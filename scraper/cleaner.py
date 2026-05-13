"""
cleaner.py — Normalise and clean raw scraped professor data
============================================================
"""

import re

BASE_URL = "https://www.dituniversity.edu.in"

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

DESIGNATION_MAP = {
    "assistant professor grade i": "Assistant Professor Grade I",
    "assistant professor grade ii": "Assistant Professor Grade II",
    "assistant professor": "Assistant Professor",
    "associate professor": "Associate Professor",
    "professor": "Professor",
    "professor & head": "Professor & Head",
    "associate professor & head": "Associate Professor & Head",
    "assistant professor & head": "Assistant Professor & Head",
    "visiting faculty": "Visiting Faculty",
    "adjunct faculty": "Adjunct Faculty",
    "lecturer": "Lecturer",
}

def clean_professors(raw: list[dict]) -> list[dict]:
    cleaned = []
    seen = set()

    for prof in raw:
        name = clean_name(prof.get("name", ""))
        if not name:
            continue

        school = normalise_school(prof.get("school", ""))
        if not school or school == "Unknown":
            school = "Unknown"

        key = (name.lower(), school.lower())
        if key in seen:
            continue
        seen.add(key)

        cleaned.append({
            "name": name,
            "slug": prof.get("slug", ""),
            "designation": normalise_designation(prof.get("designation", "")),
            "school": school,
            "school_slug": school_to_slug(school),
            "department": clean_field(prof.get("department", "")),
            "qualification": clean_field(prof.get("qualification", "")),
            "specialisation": clean_field(prof.get("specialisation", "")),
            "research_interests": clean_field(prof.get("research_interests", "")),
            "courses_taught": clean_courses(prof.get("courses_taught", [])),
            "bio": clean_bio(prof.get("bio", "")),
            "photo_url": normalise_photo(prof.get("photo_url")),
            "email": clean_email(prof.get("email")),
            "source_id": prof.get("id"),
            "profile_url": prof.get("profile_url", ""),
        })

    cleaned.sort(key=lambda p: (p["school"], p["name"]))

    for idx, prof in enumerate(cleaned, start=1):
        prof["seq_id"] = idx

    return cleaned


def clean_name(name: str) -> str:
    name = name.strip()
    name = re.sub(r"\s*\|\s*DIT University.*$", "", name, flags=re.I)
    name = re.sub(r"\s+", " ", name)
    return name.strip()


def normalise_school(school: str) -> str:
    key = school.strip().lower()
    return SCHOOL_ALIASES.get(key, school.strip() or "Unknown")


def normalise_designation(designation: str) -> str:
    if not designation:
        return ""
    key = designation.strip().lower()
    return DESIGNATION_MAP.get(key, designation.strip().title())


def school_to_slug(school: str) -> str:
    slug = school.lower()
    slug = re.sub(r"[&/]+", "and", slug)
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def clean_field(value: str) -> str:
    if not value:
        return ""
    value = value.replace("\xa0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def clean_bio(bio: str) -> str:
    bio = clean_field(bio)
    if len(bio) > 600:
        cutoff = bio.rfind(".", 0, 600)
        if cutoff > 400:
            bio = bio[:cutoff + 1]
        else:
            bio = bio[:600].rstrip() + "..."
    return bio


def clean_courses(courses: list) -> list[str]:
    seen = set()
    clean = []
    junk_keywords = ['orcid', 'research profile', 'google scholar', 'scopus', 'research gate', 'click here']
    
    for c in courses:
        c = c.strip().strip(".,;:-")
        if len(c) > 2 and not any(junk in c.lower() for junk in junk_keywords):
            if c.lower() not in seen:
                seen.add(c.lower())
                clean.append(c)
                
    return clean


def normalise_photo(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if url.startswith("http"):
        return url
    if url.startswith("/"):
        return BASE_URL + url
    return None


def clean_email(email: str | None) -> str | None:
    if not email:
        return None
    email = email.strip().lower()
    if "@" not in email:
        return None
    if "dituniversity.edu.in" not in email:
        return None
    return email