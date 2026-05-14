"""
patch_emails.py
================
Patches ONLY the null email fields in your existing professors_filled.json
by fetching each professor's profile page. Does NOT touch any other field.
Your manual edits are completely safe.

Usage:
    python patch_emails.py --input output/professors_filled.json --output output/professors_patched.json

If no --output is given, it overwrites the input file (make a backup first).
"""

import json, requests, re, time, argparse
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

SKIP_EMAILS = {
    "internationrelations@dituniversity.edu.in",
    "admissions@dituniversity.edu.in",
    "info@dituniversity.edu.in",
}

def fetch_page(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code == 200:
            return BeautifulSoup(r.text, "lxml")
    except Exception as e:
        print(f"    Error: {e}")
    return None

def extract_email(soup) -> str | None:
    # Method 1: mailto: links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("mailto:"):
            email = href.replace("mailto:", "").strip().lower()
            if "@" in email and email not in SKIP_EMAILS:
                return email

    # Method 2: regex scan of full page text
    full_text = soup.get_text()
    matches = re.findall(r'[\w.\-]+@[\w.\-]+\.(?:edu\.in|ac\.in|edu|in)', full_text)
    for match in matches:
        match = match.lower().strip()
        if match not in SKIP_EMAILS and "@" in match:
            return match

    return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="output/professors_filled.json")
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    output_path = args.output or args.input

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    missing = [p for p in data if not p.get("email")]
    print(f"Professors with null email: {len(missing)} / {len(data)}\n")

    patched = 0
    failed = 0

    for i, prof in enumerate(missing):
        print(f"[{i+1}/{len(missing)}] {prof['name']}...", end=" ", flush=True)

        soup = fetch_page(prof["profile_url"])
        if not soup:
            print("FAILED (could not fetch page)")
            failed += 1
            continue

        email = extract_email(soup)
        if email:
            # Find the entry in data and patch ONLY the email field
            for p in data:
                if p["seq_id"] == prof["seq_id"]:
                    p["email"] = email
                    break
            patched += 1
            print(f"✓ {email}")
        else:
            print("~ no email found on page")

        time.sleep(0.5)

    print(f"\nDone. Patched {patched} emails. {failed} pages failed to load.")
    print(f"Professors still without email: {sum(1 for p in data if not p.get('email'))}")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    main()