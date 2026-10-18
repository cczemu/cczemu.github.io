#!/usr/bin/env python3
"""Generate data/articles.json from Markdown files in content/articles/."""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIRECTORY = PROJECT_ROOT / "content" / "articles"
INDEX_FILE = PROJECT_ROOT / "data" / "articles.json"


def main():
    article_slugs = sorted(
        path.name
        for path in ARTICLES_DIRECTORY.glob("*.md")
        if path.is_file()
    )
    INDEX_FILE.write_text(
        f"{json.dumps(article_slugs, ensure_ascii=False, indent=2)}\n",
        encoding="utf-8",
    )
    print(f"Updated {INDEX_FILE.relative_to(PROJECT_ROOT)} with {len(article_slugs)} articles.")


if __name__ == "__main__":
    main()
