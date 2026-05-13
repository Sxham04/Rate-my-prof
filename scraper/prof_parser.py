"""
parser.py — DIT University faculty profile page parser
=========================================================
Fetches a single faculty profile page and extracts structured data.
"""

import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

BASE = "https://www.dituniversity.edu.in"

def parse_profile_page(url: str, prof_id: int) -> dict | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
    except requests.RequestException:
        return None

    if resp.status_code != 200:
        return None
    
    soup = BeautifulSoup(resp.text, "lxml")

    # --- THE TITLE TAG FALLBACK ---
    title = soup.title.get_text() if soup.title else ""
    parsed_title_name, parsed_title_desig = "", ""
    
    if " | " in title:
        main_part = title.split(" | ")[0]
        if " - " in main_part:
            parsed_title_name = main_part.split(" - ")[0].strip()
            parsed_title_desig = main_part.split(" - ")[1].strip()
        else:
            parsed_title_name = main_part.strip()

    name_tag = soup.select_one("h1") or soup.select_one(".faculty-name")
    name = clean_text(name_tag.get_text()).strip() if name_tag else ""

    if not name or name.lower() in ("faculty", "faculties", "dit university", "home"):
        name = parsed_title_name
        
    if not name:
        return None

    designation = extract_text(soup, ["h3", ".faculty-designation", ".designation"], fallback="")
    if designation.lower() in ("teaching subjects", "courses taught", "teaching", "research", "faculties", ""):
        designation = parsed_title_desig

    slug = extract_slug_from_url(resp.url)

    qualification = ""
    specialisation = ""
    research_interests = ""

    for li in soup.select("ul li, .faculty-info li"):
        text = li.get_text(" ", strip=True)
        if text.lower().startswith("qualification"):
            qualification = text.split("Qualification", 1)[-1].strip().lstrip(":").strip()
        elif text.lower().startswith("specialisation") or text.lower().startswith("specialization"):
            specialisation = re.split(r"speciali[sz]ation", text, flags=re.I, maxsplit=1)[-1].strip().lstrip(":").strip()
        elif text.lower().startswith("research interest"):
            research_interests = text.split("Research Interest", 1)[-1].strip().lstrip(":s").strip()

    all_p = soup.find_all("p")
    bio_tag = max(all_p, key=lambda p: len(p.get_text()), default=None)
    bio = clean_text(bio_tag.get_text()) if bio_tag else ""

    school = extract_school(bio, soup)
    
    # Passing soup to department extractor now
    department = extract_department(bio, soup)
    courses = extract_courses(soup)
    photo_url = extract_photo(soup)
    email = extract_email(soup)

    return {
        "id": prof_id,
        "slug": slug,
        "name": name,
        "designation": designation,
        "school": school,
        "department": department,
        "qualification": qualification,
        "specialisation": specialisation,
        "research_interests": research_interests,
        "courses_taught": courses,
        "bio": bio,
        "photo_url": photo_url,
        "email": email,
        "profile_url": resp.url,
    }


def extract_school(bio: str, soup) -> str:
    schools = [
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
    
    for school in schools:
        if school.lower() in bio.lower():
            return school

    title = soup.title.get_text() if soup.title else ""
    for school in schools:
        if school.lower() in title.lower():
            return school

    full_text = soup.get_text()
    for school in schools:
        if school.lower() in full_text.lower():
            return school

    return "Unknown"


def extract_department(bio: str, soup) -> str:
    """Check explicit list items first, then fallback to bio."""
    for li in soup.select("ul li, .faculty-info li"):
        text = li.get_text(" ", strip=True)
        if text.lower().startswith("department"):
            return text.split(":", 1)[-1].strip()
            
    match = re.search(r"Department of ([^,\.]+)", bio, re.I)
    if match:
        return match.group(1).strip()
    return ""


def extract_courses(soup) -> list[str]:
    """DOM Text-Flow Parsing with Strict Fences to prevent data avalanches."""
    courses = []
    
    # Extract all text, split by newline to preserve visual blocks
    lines = [line.strip() for line in soup.get_text('\n').split('\n') if line.strip()]
    
    in_courses = False
    
    # STRICT START FENCES: Must be specific, not just "teaching"
    course_keywords = [
        'courses taught', 'teaching subjects', 'teaching subject', 'subjects taught'
    ]
    
    # STRICT STOP FENCES: Every possible profile header to stop the avalanche
    stop_keywords = [
        'research profile', 'intellectual property', 'bio', 'brief profile',
        'publications', 'patents', 'awards', 'contact', 'orcid', 'google scholar',
        'scopus', 'professional works', 'qualification', 'specialisation',
        'specialization', 'research interest', 'email', 'phone', 'experience',
        'academic achievements', 'memberships', 'address'
    ]

    for line in lines:
        line_lower = line.lower()

        if in_courses:
            # 1. Stop if we hit ANY other section header
            if any(line_lower.startswith(stop) or line_lower == stop for stop in stop_keywords):
                break
            
            # 2. Stop if the line is clearly a massive paragraph (bio/description) 
            # Courses are short; if a line is 150+ chars without a comma, it's a bio.
            if len(line) > 150 and "," not in line[:50]: 
                break

            # Add line as course if it has substance
            if len(line) > 2:
                courses.extend(re.split(r"[,·•\n]+", line))
            continue

        # Look for the trigger word
        if any(line_lower == kw or line_lower.startswith(kw + ":") for kw in course_keywords):
            in_courses = True
            
            # Handle inline courses (e.g., "Courses Taught: Math, Science")
            if ":" in line:
                parts = line.split(":", 1)
                if len(parts) > 1 and len(parts[1].strip()) > 2:
                    courses.extend(re.split(r"[,·•\n]+", parts[1]))

    # Final Pre-Clean: Strip punctuation, remove empty strings, and enforce length limits
    clean_courses = []
    for c in courses:
        c = c.strip().strip(".-;:*")
        # A valid course name is usually between 3 and 80 characters
        if 2 < len(c) < 80: 
            clean_courses.append(c)
            
    return clean_courses


def extract_photo(soup) -> str | None:
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "faculty_images" in src or "faculty-images" in src:
            if src.startswith("http"):
                return src
            return BASE + src
    return None


def extract_email(soup) -> str | None:
    """Blocklist generic emails to force the scraper to find personal ones."""
    generic = ['admissions@', 'registrar@', 'info@', 'careers@', 'placement@', 'alumni@', 'vc@']
    
    # 1. Check mailto links
    for a in soup.find_all("a", href=True):
        href = a["href"].lower()
        if href.startswith("mailto:"):
            email = href.replace("mailto:", "").strip()
            if "dituniversity.edu.in" in email and not any(g in email for g in generic):
                return email

    # 2. Check plain text via regex as a fallback
    text = soup.get_text()
    emails = re.findall(r'[a-zA-Z0-9._%+-]+@dituniversity\.edu\.in', text, re.I)
    for e in emails:
        e = e.lower()
        if not any(g in e for g in generic):
            return e
            
    return None


def extract_text(soup, selectors: list[str], fallback="") -> str:
    for sel in selectors:
        tag = soup.select_one(sel)
        if tag:
            text = clean_text(tag.get_text())
            if text:
                return text
    return fallback


def extract_slug_from_url(url: str) -> str:
    parts = url.rstrip("/").split("/")
    if len(parts) >= 2:
        if parts[-1].isdigit() and len(parts) >= 3:
            return parts[-2]
        return parts[-1]
    return ""


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()