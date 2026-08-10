from __future__ import annotations

import tempfile
import unittest
from json import dumps, loads
from pathlib import Path
from unittest.mock import patch

import pymupdf

from scripts.sync_framework_figures import (
    FrameworkSyncError,
    extract_framework_figure,
    resolve_sources,
    select_ieee_framework_figure,
    sync_framework_sources,
)


class FrameworkSyncTests(unittest.TestCase):
    def _make_pdf(self, path: Path, framework: bool = True) -> None:
        document = pymupdf.open()
        decoy = document.new_page(width=612, height=792)
        decoy.draw_rect(pymupdf.Rect(72, 96, 540, 250), color=(0, 0, 1), fill=(0.8, 0.9, 1))
        decoy.insert_text((72, 276), "Figure 1. Representative dataset samples.", fontsize=11)

        if framework:
            page = document.new_page(width=612, height=792)
            page.draw_rect(pymupdf.Rect(72, 80, 540, 300), color=(0, 0.5, 0), fill=(0.85, 1, 0.85))
            page.insert_text((100, 180), "Encoder -> Fusion -> Prediction", fontsize=18)
            page.insert_text(
                (72, 326),
                "Figure 2. Overview of the proposed framework architecture.",
                fontsize=11,
            )

        document.save(path)
        document.close()

    def test_extracts_the_highest_scoring_framework_figure_atomically(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf = root / "paper.pdf"
            output = root / "framework.png"
            self._make_pdf(pdf)

            result = extract_framework_figure(
                pdf,
                output,
                ["framework", "architecture", "overview"],
            )

            self.assertEqual(2, result["page"])
            self.assertIn("framework architecture", result["caption"].lower())
            self.assertGreater(output.stat().st_size, 1_000)
            self.assertEqual(b"\x89PNG\r\n\x1a\n", output.read_bytes()[:8])

    def test_failed_extraction_keeps_the_last_valid_image(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf = root / "paper.pdf"
            output = root / "framework.png"
            self._make_pdf(pdf, framework=False)
            output.write_bytes(b"last-valid-image")

            with self.assertRaises(FrameworkSyncError):
                extract_framework_figure(pdf, output, ["framework", "architecture"])

            self.assertEqual(b"last-valid-image", output.read_bytes())

    def test_resolves_configured_and_scholar_pdf_sources_without_inventing_urls(self) -> None:
        publications = [
            {"title": "Open Paper", "pdfUrl": "https://example.org/open.pdf"},
            {"title": "Closed Paper"},
        ]
        configured = {
            "sources": [
                {
                    "title": "Open Paper",
                    "output": "open-paper.png",
                    "captionKeywords": ["framework"],
                },
                {
                    "title": "Closed Paper",
                    "output": "closed-paper.png",
                    "status": "awaiting-author-pdf",
                },
            ]
        }

        sources = resolve_sources(publications, configured)

        self.assertEqual("https://example.org/open.pdf", sources[0]["pdfUrl"])
        self.assertNotIn("pdfUrl", sources[1])
        self.assertEqual("awaiting-author-pdf", sources[1]["status"])

    def test_selects_the_highest_scoring_ieee_framework_figure(self) -> None:
        payload = {
            "mediaPath": "/mediastore/IEEE/content/media/1/2/3",
            "figures": [
                {
                    "id": "fig1",
                    "caption": "<p>Representative input samples.</p>",
                    "graphic": {"hires": "samples-hires.gif"},
                },
                {
                    "id": "fig2",
                    "caption": "<p>Overall architecture of FTIR-Net and its two branches.</p>",
                    "graphic": {"hires": "framework-hires.gif"},
                },
            ],
        }

        selected = select_ieee_framework_figure(payload, ["framework", "architecture", "FTIR-Net"])

        self.assertEqual("fig2", selected["figureId"])
        self.assertEqual(
            "/mediastore/IEEE/content/media/1/2/3/framework-hires.gif",
            selected["resource"],
        )
        self.assertEqual("Overall architecture of FTIR-Net and its two branches.", selected["caption"])

    def test_syncs_a_configured_ieee_figure_source(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            publications = root / "publications.json"
            sources = root / "sources.json"
            manifest = root / "frameworks.json"
            output = root / "auto"
            title = "Publisher Figure Paper"
            publications.write_text(dumps({"publications": [{"title": title}]}), encoding="utf-8")
            sources.write_text(
                dumps(
                    {
                        "sources": [
                            {
                                "title": title,
                                "ieeeDocumentId": "12345678",
                                "output": "publisher-figure.png",
                                "captionKeywords": ["architecture"],
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )

            def fake_download(document_id, destination, caption_keywords, caption_pattern=None):
                self.assertEqual("12345678", document_id)
                self.assertEqual(["architecture"], caption_keywords)
                pixmap = pymupdf.Pixmap(pymupdf.csRGB, pymupdf.IRect(0, 0, 800, 300), False)
                pixmap.clear_with(255)
                pixmap.save(destination)
                return {
                    "figureId": "fig2",
                    "caption": "Overall architecture.",
                    "width": 800,
                    "height": 300,
                    "sha256": "publisher-digest",
                    "sourceUrl": "https://ieeexplore.ieee.org/document/12345678/figures",
                }

            with patch(
                "scripts.sync_framework_figures.download_ieee_framework",
                side_effect=fake_download,
            ):
                result = sync_framework_sources(
                    publications,
                    sources,
                    manifest,
                    output,
                    "2026-08-11T00:00:00Z",
                )

            self.assertEqual((1, 0), result)
            framework = loads(manifest.read_text(encoding="utf-8"))["frameworks"][0]
            self.assertEqual("synced", framework["status"])
            self.assertEqual("IEEE Xplore figures API", framework["source"])
            self.assertEqual("fig2", framework["figureId"])
            self.assertTrue((output / "publisher-figure.png").is_file())

    def test_discovered_eprint_failure_keeps_metadata_sync_unblocked(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            publications = root / "publications.json"
            sources = root / "sources.json"
            manifest = root / "frameworks.json"
            output = root / "auto"
            publications.write_text(
                dumps(
                    {
                        "publications": [
                            {
                                "title": "New Scholar Paper",
                                "pdfUrl": "https://example.org/new.pdf",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            sources.write_text(dumps({"sources": []}), encoding="utf-8")

            with patch(
                "scripts.sync_framework_figures.download_pdf",
                side_effect=FrameworkSyncError("source offline"),
            ):
                result = sync_framework_sources(
                    publications,
                    sources,
                    manifest,
                    output,
                    "2026-02-01T00:00:00Z",
                )

            self.assertEqual((0, 0), result)
            framework = loads(manifest.read_text(encoding="utf-8"))["frameworks"][0]
            self.assertEqual("source-error", framework["status"])
            self.assertNotIn("image", framework)

    def test_source_failure_retains_the_last_valid_manifest_and_image(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            publications = root / "publications.json"
            sources = root / "sources.json"
            manifest = root / "frameworks.json"
            output = root / "auto"
            output.mkdir()
            publications.write_text(
                dumps({"publications": [{"title": "Open Paper"}]}),
                encoding="utf-8",
            )
            sources.write_text(
                dumps(
                    {
                        "sources": [
                            {
                                "title": "Open Paper",
                                "pdfUrl": "https://example.org/open.pdf",
                                "output": "open-paper.png",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            previous = {
                "version": 1,
                "updatedAt": "2026-01-01T00:00:00Z",
                "frameworks": [
                    {
                        "title": "Open Paper",
                        "status": "synced",
                        "image": "/images/papers/auto/open-paper.png",
                        "sha256": "previous",
                    }
                ],
            }
            manifest.write_text(dumps(previous), encoding="utf-8")
            (output / "open-paper.png").write_bytes(b"last-valid-image")

            with patch(
                "scripts.sync_framework_figures.download_pdf",
                side_effect=FrameworkSyncError("source offline"),
            ):
                result = sync_framework_sources(
                    publications,
                    sources,
                    manifest,
                    output,
                    "2026-02-01T00:00:00Z",
                )

            self.assertEqual((0, 1), result)
            self.assertEqual(previous, loads(manifest.read_text(encoding="utf-8")))
            self.assertEqual(b"last-valid-image", (output / "open-paper.png").read_bytes())


if __name__ == "__main__":
    unittest.main()
