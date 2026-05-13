"""
DIT University Faculty Scraper
================================
Scrapes all faculty profiles from dituniversity.edu.in by iterating
over known ID range. Individual profile pages are static HTML —
no browser/Playwright needed.

Usage:
    python main.py

Output:
    output/professors_raw.json   — raw scraped data, one object per professor
    output/professors.json       — cleaned, normalised data ready for DB seed

Requirements:
    pip install requests beautifulsoup4 lxml
"""

import json
import time
import os
from parser import parse_profile_page
from cleaner import clean_professors

BASE_URL = "https://www.dituniversity.edu.in/faculty"
ID_RANGE = range(1, 600)       # scrape IDs 1–599; 404s are skipped silently
DELAY_SECONDS = 0.8            # polite delay between requests
OUTPUT_DIR = "output"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    raw_professors = []
    skipped = 0
    scraped = 0

    print(f"Starting scrape — checking {len(ID_RANGE)} possible IDs...\n")

    for prof_id in ID_RANGE:
        # URL format: /faculty/{slug}/{id}
        # We use a placeholder slug; the server resolves by ID
        url = f"{BASE_URL}/profile/{prof_id}"

        result = parse_profile_page(url, prof_id)

        if result is None:
            skipped += 1
            if skipped % 50 == 0:
                print(f"  [{prof_id}] ...still scanning (skipped {skipped} so far)")
            time.sleep(0.2)   # shorter delay on 404s
            continue

        raw_professors.append(result)
        scraped += 1
        print(f"  [{prof_id}] ✓ {result['name']} — {result['designation']} ({result['school']})")
        time.sleep(DELAY_SECONDS)

    # Save raw output
    raw_path = os.path.join(OUTPUT_DIR, "professors_raw.json")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(raw_professors, f, indent=2, ensure_ascii=False)

    print(f"\nRaw scrape complete: {scraped} professors found, {skipped} IDs skipped.")
    print(f"Raw data saved to {raw_path}\n")

    # Clean and normalise
    clean = clean_professors(raw_professors)
    clean_path = os.path.join(OUTPUT_DIR, "professors.json")
    with open(clean_path, "w", encoding="utf-8") as f:
        json.dump(clean, f, indent=2, ensure_ascii=False)

    print(f"Cleaned data saved to {clean_path}")
    print(f"Final count: {len(clean)} professors across {len(set(p['school'] for p in clean))} schools.\n")
    print("Next step: copy output/professors.json → web-app/prisma/professors.json")
    print("Then run: cd web-app && npx ts-node prisma/seed.ts")

if __name__ == "__main__":
    main()