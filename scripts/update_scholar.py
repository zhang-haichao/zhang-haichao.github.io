#!/usr/bin/env python3
"""Safely update the publication data used by the static homepage.

The live path uses ``scholarly`` to read a public Google Scholar profile. The
normalization and write path are intentionally independent from the network so
they can be exercised deterministically with fixtures.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterable


DEFAULT_SCHOLAR_ID = "zRvnGK0AAAAJ"


class ScholarUpdateError(RuntimeError):
    """Raised when fetched data is unsafe to publish."""


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (list, tuple)):
        value = ", ".join(str(item) for item in value)
    return re.sub(r"\s+", " ", str(value)).strip()


def _coerce_year(value: Any) -> int:
    match = re.search(r"(?:19|20)\d{2}", _clean_text(value))
    return int(match.group(0)) if match else 0


def _coerce_citations(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return max(0, int(value))
    except (TypeError, ValueError):
        return None


def _title_key(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", title.casefold())


def _is_truncated_text(value: str) -> bool:
    return "…" in value or bool(re.search(r"\.{3,}", value))


def normalize_publications(
    raw_publications: Iterable[dict[str, Any]],
    existing_publications: Iterable[dict[str, Any]] = (),
) -> list[dict[str, Any]]:
    """Normalize scholarly or fixture records into the site's JSON contract."""

    existing_by_title = {
        _title_key(_clean_text(item.get("title"))): item
        for item in existing_publications
        if _clean_text(item.get("title"))
    }
    normalized: list[dict[str, Any]] = []
    seen: set[str] = set()

    for raw in raw_publications:
        bib = raw.get("bib") if isinstance(raw.get("bib"), dict) else raw
        title = _clean_text(bib.get("title"))
        key = _title_key(title)
        if not title or not key or key in seen:
            continue

        previous = existing_by_title.get(key, {})
        display_title = _clean_text(previous.get("title")) or title
        authors = _clean_text(bib.get("author") or bib.get("authors")).replace(" and ", ", ")
        venue = _clean_text(
            bib.get("citation")
            or bib.get("venue")
            or bib.get("journal")
            or bib.get("conference")
            or bib.get("publisher")
        )
        previous_venue = _clean_text(previous.get("venue"))
        if _is_truncated_text(venue):
            venue = (
                previous_venue
                if previous_venue and not _is_truncated_text(previous_venue)
                else "Google Scholar"
            )
        year = _coerce_year(bib.get("pub_year") or bib.get("year"))
        url = _clean_text(
            raw.get("pub_url")
            or raw.get("eprint_url")
            or bib.get("url")
            or previous.get("url")
        )
        if not url and raw.get("author_pub_id"):
            url = (
                "https://scholar.google.com/citations?view_op=view_citation&"
                f"citation_for_view={raw['author_pub_id']}"
            )

        pdf_url = _clean_text(raw.get("eprint_url") or previous.get("pdfUrl"))

        publication = {
            "title": display_title,
            "authors": authors or _clean_text(previous.get("authors")),
            "venue": venue or previous_venue or "Google Scholar",
            "year": year or _coerce_year(previous.get("year")),
            "url": url,
            "citations": _coerce_citations(
                raw.get("num_citations", raw.get("citedby", previous.get("citations")))
            ),
        }
        if pdf_url.startswith("https://"):
            publication["pdfUrl"] = pdf_url
        normalized.append(publication)
        seen.add(key)

    return sorted(normalized, key=lambda item: (-item["year"], item["title"].casefold()))


def validate_publications(
    publications: list[dict[str, Any]],
    existing_count: int = 0,
    allow_removals: bool = False,
) -> None:
    """Reject empty, malformed, duplicate, or suspiciously truncated results."""

    if not publications:
        raise ScholarUpdateError("Scholar returned no usable publications")

    if existing_count and len(publications) < existing_count and not allow_removals:
        raise ScholarUpdateError(
            f"Scholar result would remove publications: {len(publications)} fetched, "
            f"but {existing_count} records already exist; rerun with "
            "--allow-removals only after reviewing the missing works"
        )

    current_year = datetime.now(UTC).year
    keys: set[str] = set()
    for index, publication in enumerate(publications):
        title = _clean_text(publication.get("title"))
        key = _title_key(title)
        if not title or not key:
            raise ScholarUpdateError(f"Publication {index} has no title")
        if key in keys:
            raise ScholarUpdateError(f"Duplicate publication title: {title}")
        keys.add(key)

        year = publication.get("year")
        if not isinstance(year, int) or not (1900 <= year <= current_year + 1):
            raise ScholarUpdateError(f"Invalid publication year for {title!r}: {year!r}")
        if not _clean_text(publication.get("authors")):
            raise ScholarUpdateError(f"Publication has no authors: {title}")


def load_live_scholar(scholar_id: str) -> list[dict[str, Any]]:
    """Fetch a public Scholar profile. Import lazily so fixture tests stay light."""

    try:
        from scholarly import scholarly
    except ImportError as exc:  # pragma: no cover - exercised in the Action
        raise ScholarUpdateError(
            "The 'scholarly' package is required for live updates; install "
            "scripts/requirements-scholar.txt"
        ) from exc

    try:
        author = scholarly.search_author_id(scholar_id)
        if not author:
            raise ScholarUpdateError(f"Scholar profile not found: {scholar_id}")
        author = scholarly.fill(author, sections=["publications"])
        summaries = author.get("publications", [])
    except ScholarUpdateError:
        raise
    except Exception as exc:  # pragma: no cover - depends on remote service
        raise ScholarUpdateError(f"Unable to read Google Scholar profile: {exc}") from exc

    results: list[dict[str, Any]] = []
    for summary in summaries:
        try:
            results.append(scholarly.fill(summary))
        except Exception:
            # A single detail page can be rate-limited even when the profile is
            # available. The profile summary still contains the safe minimum.
            results.append(summary)
    return results


def load_fixture(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    publications = data.get("publications") if isinstance(data, dict) else data
    if not isinstance(publications, list):
        raise ScholarUpdateError("Fixture must contain a publications list")
    return publications


def load_existing(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"publications": []}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ScholarUpdateError(f"Existing publication data is invalid: {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("publications"), list):
        raise ScholarUpdateError("Existing publication data has the wrong shape")
    return data


def atomic_write_json(path: Path, data: dict[str, Any]) -> None:
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
    except Exception:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass
        raise


def update_publication_file(
    output: Path,
    scholar_id: str,
    raw_publications: list[dict[str, Any]],
    source: str,
    timestamp: str | None = None,
    allow_removals: bool = False,
) -> bool:
    existing = load_existing(output)
    existing_publications = existing.get("publications", [])
    publications = normalize_publications(raw_publications, existing_publications)
    validate_publications(publications, len(existing_publications), allow_removals)

    if existing.get("scholarId") == scholar_id and existing_publications == publications:
        return False

    document = {
        "scholarId": scholar_id,
        "updatedAt": timestamp or datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source": source,
        "publications": publications,
    }
    atomic_write_json(output, document)
    return True


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scholar-id", default=DEFAULT_SCHOLAR_ID)
    parser.add_argument("--output", type=Path, default=Path("src/data/publications.json"))
    parser.add_argument("--fixture", type=Path, help="Use a local JSON fixture instead of the network")
    parser.add_argument(
        "--allow-removals",
        action="store_true",
        help="Allow a reviewed update to contain fewer publications than the current file",
    )
    parser.add_argument("--timestamp", help=argparse.SUPPRESS)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    try:
        if args.fixture:
            raw_publications = load_fixture(args.fixture)
            source = "fixture"
        else:
            raw_publications = load_live_scholar(args.scholar_id)
            source = "google-scholar"
        changed = update_publication_file(
            args.output,
            args.scholar_id,
            raw_publications,
            source,
            args.timestamp,
            args.allow_removals,
        )
    except (OSError, json.JSONDecodeError, ScholarUpdateError) as exc:
        print(f"Scholar update aborted: {exc}", file=sys.stderr)
        return 1

    print("Scholar publication data updated." if changed else "Scholar publication data is already current.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
