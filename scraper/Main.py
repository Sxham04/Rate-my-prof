"""
DIT University Faculty Scraper — Playwright version
Run: python main.py
Install: pip install playwright beautifulsoup4 lxml
         playwright install chromium
"""

import json, time, os
from playwright.sync_api import sync_playwright
from prof_parser import parse_profile_page
from cleaner import clean_professors

BASE = "https://www.dituniversity.edu.in"
OUTPUT_DIR = "output"

SCHOOLS = [
    "School of Computing",
    "School of Architecture and Planning",
    "School of Design",
    "School of Engineering & Technology",
    "School of Liberal Arts & Management",
    "School of Physical Sciences",
    "School of Pharmaceutical & Population Health Informatics",
    "College of Nursing",
    "College of Healthcare Professions",
]

def get_all_profile_urls():
    """Use Playwright to load the faculty page per school and collect all profile links."""
    urls = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for school in SCHOOLS:
            print(f"  Collecting links — {school}...")
            page.goto(f"{BASE}/faculty", wait_until="domcontentloaded", timeout=60000)

            # Select the school from the dropdown
            try:
                page.select_option("select", label=school)
            except:
                # Try clicking the custom dropdown if it's not a native <select>
                page.click("text=" + school)

            # Wait for faculty cards to load
            page.wait_for_timeout(2000)

            # Collect all faculty profile links
            links = page.eval_on_selector_all(
                "a[href*='/faculty/']",
                "els => els.map(e => e.href)"
            )
            for link in links:
                # Only keep actual profile links (have a slug and numeric ID)
                parts = link.rstrip("/").split("/")
                if len(parts) >= 6 and parts[-1].isdigit():
                    urls.add(link)

        browser.close()

    print(f"\nFound {len(urls)} unique profile URLs.\n")
    return list(urls)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Step 1: Collecting profile URLs via browser...\n")
    profile_urls = get_all_profile_urls()

    print("Step 2: Scraping each profile page...\n")
    raw = []
    for i, url in enumerate(profile_urls, 1):
        result = parse_profile_page(url, i)
        if result:
            print(f"  [{i}/{len(profile_urls)}] ✓ {result['name']} — {result['school']}")
            raw.append(result)
        else:
            print(f"  [{i}/{len(profile_urls)}] ✗ skipped: {url}")
        time.sleep(0.5)

    raw_path = os.path.join(OUTPUT_DIR, "professors_raw.json")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(raw, f, indent=2, ensure_ascii=False)
    print(f"\nRaw data: {len(raw)} professors → {raw_path}")

    clean = clean_professors(raw)
    clean_path = os.path.join(OUTPUT_DIR, "professors.json")
    with open(clean_path, "w", encoding="utf-8") as f:
        json.dump(clean, f, indent=2, ensure_ascii=False)
    print(f"Clean data: {len(clean)} professors → {clean_path}")

if __name__ == "__main__":
    main()