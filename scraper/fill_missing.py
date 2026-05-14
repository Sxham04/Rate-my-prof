"""
fill_missing.py
================
Run this locally inside your scraper/ folder to fill in missing
designation, school, department, and courses_taught fields
by fetching each professor's profile page.

Usage:
    python fill_missing.py --input output/professors.json --output output/professors_filled.json
"""

import json, requests, re, time, argparse
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

SCHOOL_ALIASES = {
    "school of computing": "School of Computing",
    "school of architecture and planning": "School of Architecture and Planning",
    "school of architecture & planning": "School of Architecture and Planning",
    "school of design": "School of Design",
    "school of engineering & technology": "School of Engineering & Technology",
    "school of engineering and technology": "School of Engineering & Technology",
    "school of liberal arts & management": "School of Liberal Arts & Management",
    "school of liberal arts and management": "School of Liberal Arts & Management",
    "school of physical sciences": "School of Physical Sciences",
    "school of pharmaceutical & population health informatics": "School of Pharmaceutical & Population Health Informatics",
    "school of pharmaceutical and population health informatics": "School of Pharmaceutical & Population Health Informatics",
    "college of nursing": "College of Nursing",
    "college of healthcare professions": "College of Healthcare Professions",
}

SCHOOL_SLUGS = {
    "School of Computing": "school-of-computing",
    "School of Architecture and Planning": "school-of-architecture-and-planning",
    "School of Design": "school-of-design",
    "School of Engineering & Technology": "school-of-engineering-and-technology",
    "School of Liberal Arts & Management": "school-of-liberal-arts-and-management",
    "School of Physical Sciences": "school-of-physical-sciences",
    "School of Pharmaceutical & Population Health Informatics": "school-of-pharmaceutical-and-population-health-informatics",
    "College of Nursing": "college-of-nursing",
    "College of Healthcare Professions": "college-of-healthcare-professions",
}

DESIGNATION_MAP = {
    "assistant professor grade i": "Assistant Professor Grade I",
    "assistant professor grade ii": "Assistant Professor Grade II",
    "assistant professor-i": "Assistant Professor Grade I",
    "assistant professor-ii": "Assistant Professor Grade II",
    "assistant professor": "Assistant Professor",
    "associate professor": "Associate Professor",
    "professor": "Professor",
    "professor & head": "Professor & Head",
    "professor and head": "Professor & Head",
    "associate professor & head": "Associate Professor & Head",
    "associate professor and head": "Associate Professor & Head",
    "visiting faculty": "Visiting Faculty",
    "adjunct faculty": "Adjunct Faculty",
    "lecturer": "Lecturer",
}

def normalise_designation(raw):
    if not raw: return ""
    key = raw.strip().lower()
    key = re.sub(r'^(dr\.?|mr\.?|ms\.?|prof\.?)\s+', '', key).strip()
    for k, v in DESIGNATION_MAP.items():
        if k in key:
            return v
    return raw.strip().title()

def fetch_page(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code == 200:
            return BeautifulSoup(r.text, "lxml")
    except Exception as e:
        print(f"    Error fetching {url}: {e}")
    return None

def extract_from_page(soup):
    result = {}
    full_text = soup.get_text(" ", strip=True)
    full_lower = full_text.lower()

    # School — search entire page text
    for key, val in SCHOOL_ALIASES.items():
        if key in full_lower:
            result["school"] = val
            break

    # Designation from page title
    title = soup.title.get_text() if soup.title else ""
    if " - " in title:
        parts = title.split(" - ")
        if len(parts) >= 2:
            desig_raw = parts[1].split("|")[0].strip()
            result["designation"] = normalise_designation(desig_raw)

    # Department
    dept_match = re.search(
        r'[Dd]epartment\s+of\s+([A-Za-z &\(\)/]+?)(?:\s*,|\s*\.|\s*\n|$)',
        full_text
    )
    if dept_match:
        dept = dept_match.group(1).strip().strip(",.")
        if 3 < len(dept) < 60:
            result["department"] = dept

    # Courses taught
    courses = []
    for section in soup.find_all(["div", "section", "ul"]):
        heading = section.find(["h3", "h4", "h5", "strong", "a", "span"])
        if heading and "courses" in heading.get_text().lower():
            raw = section.get_text(" ", strip=True)
            raw = re.sub(r'[Cc]ourses\s+[Tt]aught', '', raw).strip()
            items = re.split(r'[,•·\n]+', raw)
            for item in items:
                item = item.strip().strip(".,;:")
                if item and 3 < len(item) < 100:
                    courses.append(item)
            if courses:
                break
    if courses:
        result["courses_taught"] = list(dict.fromkeys(courses))

    return result

def needs_fix(prof):
    return (
        not prof.get("designation") or
        prof.get("school") == "Unknown" or
        not prof.get("courses_taught") or
        not prof.get("department")
    )

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="output/professors.json")
    parser.add_argument("--output", default="output/professors_filled.json")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    to_fix = [p for p in data if needs_fix(p)]
    print(f"Entries needing fixes: {len(to_fix)} / {len(data)}\n")

    fixed_count = 0

    for i, prof in enumerate(to_fix):
        print(f"[{i+1}/{len(to_fix)}] {prof['name']}...", end=" ", flush=True)
        soup = fetch_page(prof["profile_url"])
        if not soup:
            print("FAILED")
            continue

        extracted = extract_from_page(soup)
        idx = next(j for j, p in enumerate(data) if p["seq_id"] == prof["seq_id"])
        changed = []

        if not data[idx].get("designation") and extracted.get("designation"):
            data[idx]["designation"] = extracted["designation"]
            changed.append("designation")
        if data[idx].get("school") == "Unknown" and extracted.get("school"):
            data[idx]["school"] = extracted["school"]
            data[idx]["school_slug"] = SCHOOL_SLUGS.get(extracted["school"], "unknown")
            changed.append("school")
        if not data[idx].get("department") and extracted.get("department"):
            data[idx]["department"] = extracted["department"]
            changed.append("department")
        if not data[idx].get("courses_taught") and extracted.get("courses_taught"):
            data[idx]["courses_taught"] = extracted["courses_taught"]
            changed.append("courses_taught")

        if changed:
            fixed_count += 1
            print(f"✓ fixed: {', '.join(changed)}")
        else:
            print("~ no new data")

        time.sleep(0.6)

    print(f"\nDone. Fixed {fixed_count}/{len(to_fix)} entries.")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved to {args.output}")

if __name__ == "__main__":
    main()