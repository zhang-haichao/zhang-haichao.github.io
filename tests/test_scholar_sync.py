from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.update_scholar import ScholarUpdateError, update_publication_file


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests" / "fixtures" / "scholar-profile.json"


class ScholarSyncTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()

