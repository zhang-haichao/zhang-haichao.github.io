from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.update_scholar import (
    ScholarUpdateError,
    normalize_publications,
    update_publication_file,
)


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests" / "fixtures" / "scholar-profile.json"


class ScholarSyncTests(unittest.TestCase):
    def test_all_scholar_works_are_normalized_with_publication_metadata(self) -> None:
        publications = normalize_publications(
            [
                {
                    "bib": {
                        "title": "Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains",
                        "author": "Lin Shi and Yushi Li and Yu Han and Jia Wang and Fangyu Wu and Chenke Yin and Haichao Zhang",
                        "pub_year": "2024",
                        "citation": "2024 27th International Conference on Computer Supported Cooperative Work in Design (CSCWD), 2191-2196",
                    },
                    "pub_url": "https://doi.org/10.1109/CSCWD61410.2024.10580800",
                    "num_citations": 3,
                },
                {
                    "bib": {
                        "title": "A Visible Scholar Work",
                        "author": "Haichao Zhang",
                        "pub_year": "2025",
                    }
                },
            ]
        )

        self.assertEqual(
            [
                "A Visible Scholar Work",
                "Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains",
            ],
            [item["title"] for item in publications],
        )
        bloodstain = publications[1]
        self.assertEqual(2024, bloodstain["year"])
        self.assertEqual(3, bloodstain["citations"])
        self.assertIn("CSCWD", bloodstain["venue"])
        self.assertEqual(
            "https://doi.org/10.1109/CSCWD61410.2024.10580800",
            bloodstain["url"],
        )

    def test_truncated_venue_preserves_existing_complete_metadata(self) -> None:
        previous = {
            "title": "A Scholar Work",
            "authors": "Haichao Zhang",
            "venue": "Complete Conference Name (CCN), 1–10, 2025",
            "year": 2025,
            "url": "https://example.org/work",
            "citations": 2,
        }

        for truncated in ("Complete Conference Name …, 2025", "Complete Conference Name ..., 2025"):
            with self.subTest(truncated=truncated):
                publications = normalize_publications(
                    [
                        {
                            "bib": {
                                "title": "A Scholar Work",
                                "author": "Haichao Zhang",
                                "pub_year": "2025",
                                "citation": truncated,
                            }
                        }
                    ],
                    [previous],
                )

                self.assertEqual(previous["venue"], publications[0]["venue"])

    def test_fixture_normalizes_deterministically_and_preserves_curated_url(self) -> None:
        raw = json.loads(FIXTURE.read_text(encoding="utf-8"))["publications"]
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "publications.json"
            output.write_text(
                json.dumps(
                    {
                        "scholarId": "zRvnGK0AAAAJ",
                        "updatedAt": "2025-01-01T00:00:00Z",
                        "source": "seed",
                        "publications": [
                            {
                                "title": "A Newer Scholar Work",
                                "authors": "Haichao Zhang, Jia Wang",
                                "venue": "Example Conference",
                                "year": 2026,
                                "url": "https://example.org/curated",
                                "citations": 1,
                            },
                            {
                                "title": "An Earlier Scholar Work",
                                "authors": "Jia Wang and Haichao Zhang",
                                "venue": "Example Journal",
                                "year": 2024,
                                "url": "https://example.org/earlier",
                                "citations": 10,
                            },
                        ],
                    }
                ),
                encoding="utf-8",
            )

            changed = update_publication_file(
                output,
                "zRvnGK0AAAAJ",
                raw,
                "fixture",
                "2026-08-07T00:00:00Z",
            )
            data = json.loads(output.read_text(encoding="utf-8"))

            self.assertTrue(changed)
            self.assertEqual([2026, 2024], [item["year"] for item in data["publications"]])
            self.assertEqual("https://example.org/newer", data["publications"][0]["url"])
            self.assertEqual("https://example.org/earlier", data["publications"][1]["url"])
            self.assertEqual(11, data["publications"][1]["citations"])

    def test_invalid_empty_result_keeps_last_valid_file_untouched(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "publications.json"
            original = '{"scholarId":"zRvnGK0AAAAJ","publications":[]}\n'
            output.write_text(original, encoding="utf-8")

            with self.assertRaises(ScholarUpdateError):
                update_publication_file(output, "zRvnGK0AAAAJ", [], "fixture")

            self.assertEqual(original, output.read_text(encoding="utf-8"))

    def test_suspiciously_truncated_result_keeps_existing_data(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "publications.json"
            existing = {
                "scholarId": "zRvnGK0AAAAJ",
                "publications": [
                    {
                        "title": f"Existing Work {index}",
                        "authors": "Haichao Zhang",
                        "venue": "Venue",
                        "year": 2024,
                        "url": "",
                        "citations": 0,
                    }
                    for index in range(10)
                ],
            }
            original = json.dumps(existing)
            output.write_text(original, encoding="utf-8")
            raw = [
                {
                    "bib": {
                        "title": "Only One Work",
                        "author": "Haichao Zhang",
                        "pub_year": "2026",
                    }
                }
            ]

            with self.assertRaises(ScholarUpdateError):
                update_publication_file(output, "zRvnGK0AAAAJ", raw, "fixture")

            self.assertEqual(original, output.read_text(encoding="utf-8"))

    def test_any_count_decrease_is_rejected_by_default(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "publications.json"
            existing = {
                "scholarId": "zRvnGK0AAAAJ",
                "publications": [
                    {
                        "title": f"Existing Work {index}",
                        "authors": "Haichao Zhang",
                        "venue": "Venue",
                        "year": 2024,
                        "url": "",
                        "citations": 0,
                    }
                    for index in range(6)
                ],
            }
            original = json.dumps(existing)
            output.write_text(original, encoding="utf-8")
            raw = [
                {
                    "bib": {
                        "title": f"Existing Work {index}",
                        "author": "Haichao Zhang",
                        "pub_year": "2024",
                    }
                }
                for index in range(3)
            ]

            with self.assertRaises(ScholarUpdateError):
                update_publication_file(output, "zRvnGK0AAAAJ", raw, "fixture")

            self.assertEqual(original, output.read_text(encoding="utf-8"))

    def test_count_decrease_requires_explicit_removal_override(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "publications.json"
            existing = {
                "scholarId": "zRvnGK0AAAAJ",
                "publications": [
                    {
                        "title": f"Existing Work {index}",
                        "authors": "Haichao Zhang",
                        "venue": "Venue",
                        "year": 2024,
                        "url": "",
                        "citations": 0,
                    }
                    for index in range(6)
                ],
            }
            output.write_text(json.dumps(existing), encoding="utf-8")
            raw = [
                {
                    "bib": {
                        "title": f"Existing Work {index}",
                        "author": "Haichao Zhang",
                        "pub_year": "2024",
                    }
                }
                for index in range(3)
            ]

            changed = update_publication_file(
                output,
                "zRvnGK0AAAAJ",
                raw,
                "fixture",
                allow_removals=True,
            )

            self.assertTrue(changed)
            data = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(3, len(data["publications"]))


if __name__ == "__main__":
    unittest.main()
