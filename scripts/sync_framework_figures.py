#!/usr/bin/env python3
"""Extract framework figures from configured public paper PDFs.

Google Scholar remains the publication/citation source. Direct PDF URLs come
from Scholar's public ``eprint_url`` when available or from the reviewed source
registry. A missing or closed PDF never causes a fabricated figure.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterable

import pymupdf


DEFAULT_KEYWORDS = (
    "framework",
    "architecture",
    "overview",
    "pipeline",
    "proposed model",
    "proposed method",
    "network structure",
)
MAX_PDF_BYTES = 50 * 1024 * 1024
CAPTION_RE = re.compile(r"\bfig(?:ure)?\.?\s*\d+[a-z]?\b", re.IGNORECASE)


class FrameworkSyncError(RuntimeError):
    """Raised when a configured framework source cannot be safely processed."""


def _title_key(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", title.casefold())


def _slug(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.casefold()).strip("-")
    return (slug[:72].rstrip("-") or "publication") + ".png"


def _read_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise FrameworkSyncError(f"Unable to read {path}: {exc}") from exc
    if not isinstance(data, dict):
        raise FrameworkSyncError(f"Expected a JSON object in {path}")
    return data


def resolve_sources(
    publications: Iterable[dict[str, Any]],
    configured: dict[str, Any],
) -> list[dict[str, Any]]:
    """Merge reviewed source settings with Scholar-provided public PDF URLs."""

    publication_by_title = {
        _title_key(str(publication.get("title", ""))): publication
        for publication in publications
        if publication.get("title")
    }
    configured_sources = configured.get("sources", [])
    if not isinstance(configured_sources, list):
        raise FrameworkSyncError("framework source registry must contain a sources list")

    resolved: list[dict[str, Any]] = []
    configured_keys: set[str] = set()
    for item in configured_sources:
        if not isinstance(item, dict) or not item.get("title"):
            raise FrameworkSyncError("Every framework source needs a publication title")
        source = dict(item)
        key = _title_key(str(source["title"]))
        publication = publication_by_title.get(key)
        if publication is None:
            raise FrameworkSyncError(f"Framework source is not in Scholar data: {source['title']}")
        configured_keys.add(key)
        if not source.get("pdfUrl") and publication.get("pdfUrl"):
            source["pdfUrl"] = publication["pdfUrl"]
        source.setdefault("output", _slug(str(source["title"])))
        source.setdefault("captionKeywords", list(DEFAULT_KEYWORDS))
        source.setdefault("required", bool(source.get("pdfUrl")))
        if not isinstance(source["captionKeywords"], list):
            raise FrameworkSyncError(f"captionKeywords must be a list for {source['title']}")
        resolved.append(source)

    for key, publication in publication_by_title.items():
        if key in configured_keys or not publication.get("pdfUrl"):
            continue
        resolved.append(
            {
                "title": publication["title"],
                "pdfUrl": publication["pdfUrl"],
                "output": _slug(str(publication["title"])),
                "captionKeywords": list(DEFAULT_KEYWORDS),
                "source": "Google Scholar public eprint",
                "required": False,
            }
        )
    return resolved


def download_pdf(url: str, destination: Path, timeout: int = 45) -> None:
    if not re.match(r"^https://", url, re.IGNORECASE):
        raise FrameworkSyncError(f"Only HTTPS PDF sources are allowed: {url}")

    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/pdf",
            "User-Agent": "Haichao-Zhang-academic-homepage/1.0 (+https://zhang-haichao.github.io/)",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response, destination.open("wb") as handle:
            if not str(response.geturl()).lower().startswith("https://"):
                raise FrameworkSyncError(f"PDF redirected outside HTTPS: {url}")
            content_length = response.headers.get("Content-Length")
            if content_length and int(content_length) > MAX_PDF_BYTES:
                raise FrameworkSyncError(f"PDF exceeds {MAX_PDF_BYTES} bytes: {url}")
            size = 0
            prefix = b""
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                if not prefix:
                    prefix = chunk[:5]
                size += len(chunk)
                if size > MAX_PDF_BYTES:
                    raise FrameworkSyncError(f"PDF exceeds {MAX_PDF_BYTES} bytes: {url}")
                handle.write(chunk)
    except (OSError, urllib.error.URLError, ValueError) as exc:
        raise FrameworkSyncError(f"Unable to download PDF {url}: {exc}") from exc

    if prefix != b"%PDF-":
        destination.unlink(missing_ok=True)
        raise FrameworkSyncError(f"Source did not return a PDF: {url}")


def _caption_candidates(
    document: pymupdf.Document,
    keywords: Iterable[str],
    caption_pattern: str | None = None,
) -> list[dict[str, Any]]:
    normalized_keywords = [keyword.casefold() for keyword in keywords if keyword.strip()]
    try:
        explicit = re.compile(caption_pattern, re.IGNORECASE) if caption_pattern else None
    except re.error as exc:
        raise FrameworkSyncError(f"Invalid captionPattern {caption_pattern!r}: {exc}") from exc
    candidates: list[dict[str, Any]] = []
    for page_number, page in enumerate(document):
        for block in page.get_text("blocks"):
            text = re.sub(r"\s+", " ", str(block[4])).strip()
            if not CAPTION_RE.search(text):
                continue
            lowered = text.casefold()
            keyword_hits = sum(keyword in lowered for keyword in normalized_keywords)
            explicit_match = bool(explicit and explicit.search(text))
            if not keyword_hits and not explicit_match:
                continue
            score = keyword_hits * 10 + (50 if explicit_match else 0)
            candidates.append(
                {
                    "pageIndex": page_number,
                    "caption": text,
                    "rect": pymupdf.Rect(block[:4]),
                    "score": score,
                }
            )
    return sorted(candidates, key=lambda item: (-item["score"], item["pageIndex"]))


def _automatic_clip(page: pymupdf.Page, caption_rect: pymupdf.Rect) -> pymupdf.Rect:
    page_rect = page.rect
    caption_center = (caption_rect.x0 + caption_rect.x1) / 2
    if caption_rect.width < page_rect.width * 0.62:
        if caption_center < page_rect.width / 2:
            x0, x1 = 24, page_rect.width / 2 - 8
        else:
            x0, x1 = page_rect.width / 2 + 8, page_rect.width - 24
    else:
        x0, x1 = 24, page_rect.width - 24

    vertical_window = min(360, page_rect.height * 0.46)
    y0 = max(24, caption_rect.y0 - vertical_window)
    y1 = min(page_rect.height - 24, caption_rect.y1 + 6)
    return pymupdf.Rect(x0, y0, x1, y1) & page_rect


def extract_framework_figure(
    pdf_path: Path,
    output_path: Path,
    caption_keywords: Iterable[str] = DEFAULT_KEYWORDS,
    caption_pattern: str | None = None,
    crop: Iterable[float] | None = None,
) -> dict[str, Any]:
    """Render the best framework candidate to PNG without clobbering old output."""

    try:
        document = pymupdf.open(pdf_path)
    except (OSError, pymupdf.FileDataError) as exc:
        raise FrameworkSyncError(f"Unable to open PDF {pdf_path}: {exc}") from exc

    try:
        candidates = _caption_candidates(document, caption_keywords, caption_pattern)
        if not candidates:
            raise FrameworkSyncError(f"No framework-like figure caption found in {pdf_path}")
        selected = candidates[0]
        page = document[selected["pageIndex"]]
        if crop is not None:
            crop_values = [float(value) for value in crop]
            if len(crop_values) != 4 or any(value < 0 or value > 1 for value in crop_values):
                raise FrameworkSyncError("crop must contain four normalized values between 0 and 1")
            clip = pymupdf.Rect(
                crop_values[0] * page.rect.width,
                crop_values[1] * page.rect.height,
                crop_values[2] * page.rect.width,
                crop_values[3] * page.rect.height,
            ) & page.rect
        else:
            clip = _automatic_clip(page, selected["rect"])
        if clip.width < 100 or clip.height < 100:
            raise FrameworkSyncError(f"Unsafe framework crop dimensions: {clip}")

        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2.25, 2.25), clip=clip, alpha=False)
        if pixmap.width < 400 or pixmap.height < 200:
            raise FrameworkSyncError(
                f"Rendered framework is too small: {pixmap.width}x{pixmap.height}"
            )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temporary_name = tempfile.mkstemp(
            prefix=f".{output_path.stem}.", suffix=".png", dir=output_path.parent
        )
        os.close(descriptor)
        temporary_path = Path(temporary_name)
        try:
            pixmap.save(temporary_path)
            digest = hashlib.sha256(temporary_path.read_bytes()).hexdigest()
            os.replace(temporary_path, output_path)
        finally:
            temporary_path.unlink(missing_ok=True)
        return {
            "page": selected["pageIndex"] + 1,
            "caption": selected["caption"],
            "width": pixmap.width,
            "height": pixmap.height,
            "sha256": digest,
        }
    finally:
        document.close()


def _atomic_write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary_name, path)
    finally:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass


def sync_framework_sources(
    publications_path: Path,
    sources_path: Path,
    manifest_path: Path,
    output_directory: Path,
    timestamp: str | None = None,
) -> tuple[int, int]:
    publication_data = _read_json(publications_path)
    publications = publication_data.get("publications", [])
    if not isinstance(publications, list):
        raise FrameworkSyncError("publication data must contain a publications list")
    registry = _read_json(sources_path)
    sources = resolve_sources(publications, registry)
    previous_manifest = _read_json(manifest_path) if manifest_path.exists() else {"frameworks": []}
    previous_by_title = {
        _title_key(str(item.get("title", ""))): item
        for item in previous_manifest.get("frameworks", [])
        if isinstance(item, dict) and item.get("title")
    }

    pending: list[tuple[Path, Path]] = []
    frameworks: list[dict[str, Any]] = []
    failures: list[str] = []
    synced = 0
    retained = 0
    with tempfile.TemporaryDirectory(prefix="framework-sync-") as directory:
        temporary_root = Path(directory)
        for index, source in enumerate(sources):
            title = str(source["title"])
            key = _title_key(title)
            pdf_url = str(source.get("pdfUrl", "")).strip()
            output_name = Path(str(source["output"]))
            if output_name.name != str(source["output"]) or output_name.suffix.lower() != ".png":
                raise FrameworkSyncError(f"Unsafe framework output name: {source['output']}")
            final_output = output_directory / output_name
            previous = previous_by_title.get(key)

            if not pdf_url:
                entry = {
                    "title": title,
                    "status": source.get("status", "no-public-pdf"),
                    "note": source.get("note", "No reviewed public PDF source is available."),
                }
                if previous and previous.get("image") and final_output.exists():
                    entry = previous
                frameworks.append(entry)
                continue

            downloaded_pdf = temporary_root / f"source-{index}.pdf"
            staged_image = temporary_root / output_name
            try:
                download_pdf(pdf_url, downloaded_pdf)
                result = extract_framework_figure(
                    downloaded_pdf,
                    staged_image,
                    source.get("captionKeywords", DEFAULT_KEYWORDS),
                    source.get("captionPattern"),
                    source.get("crop"),
                )
                entry = {
                    "title": title,
                    "status": "synced",
                    "image": f"/images/papers/auto/{output_name.name}",
                    "pdfUrl": pdf_url,
                    "source": source.get("source", "Public paper PDF"),
                    "page": result["page"],
                    "caption": result["caption"],
                    "width": result["width"],
                    "height": result["height"],
                    "sha256": result["sha256"],
                    "extractedAt": timestamp
                    or datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                }
                if source.get("license"):
                    entry["license"] = source["license"]
                if previous and previous.get("sha256") == entry["sha256"]:
                    entry["extractedAt"] = previous.get("extractedAt", entry["extractedAt"])
                pending.append((staged_image, final_output))
                frameworks.append(entry)
                synced += 1
            except FrameworkSyncError as exc:
                if previous and previous.get("status") == "synced" and final_output.exists():
                    print(f"Framework sync warning for {title}: {exc}; retaining cache.", file=sys.stderr)
                    frameworks.append(previous)
                    retained += 1
                elif not source.get("required", False):
                    print(f"Framework sync warning for {title}: {exc}; keeping metadata only.", file=sys.stderr)
                    frameworks.append(
                        {
                            "title": title,
                            "status": "source-error",
                            "note": "Public PDF extraction failed; the scheduled workflow will retry.",
                        }
                    )
                else:
                    failures.append(f"{title}: {exc}")

        if failures:
            raise FrameworkSyncError("; ".join(failures))

        for staged_image, final_output in pending:
            final_output.parent.mkdir(parents=True, exist_ok=True)
            if final_output.exists() and hashlib.sha256(final_output.read_bytes()).hexdigest() == hashlib.sha256(staged_image.read_bytes()).hexdigest():
                continue
            os.replace(staged_image, final_output)

    manifest = {
        "version": 1,
        "updatedAt": timestamp
        or datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "frameworks": frameworks,
    }
    if previous_manifest.get("frameworks") == frameworks:
        manifest["updatedAt"] = previous_manifest.get("updatedAt", manifest["updatedAt"])
    _atomic_write_json(manifest_path, manifest)
    return synced, retained


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--publications", type=Path, default=Path("src/data/publications.json"))
    parser.add_argument("--sources", type=Path, default=Path("src/data/framework-sources.json"))
    parser.add_argument("--manifest", type=Path, default=Path("src/data/frameworks.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("public/images/papers/auto"))
    parser.add_argument("--timestamp", help=argparse.SUPPRESS)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    try:
        synced, retained = sync_framework_sources(
            args.publications,
            args.sources,
            args.manifest,
            args.output_dir,
            args.timestamp,
        )
    except FrameworkSyncError as exc:
        print(f"Framework sync aborted: {exc}", file=sys.stderr)
        return 1
    print(f"Framework sync complete: {synced} extracted, {retained} cached after a source failure.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
