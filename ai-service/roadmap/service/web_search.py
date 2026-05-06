import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
CX = os.getenv("GOOGLE_CX")

SEARCH_URL = "https://www.googleapis.com/customsearch/v1"

# Trusted educational domains
TRUSTED_DOMAINS = [
    "developer.mozilla.org",
    "w3schools.com",
    "geeksforgeeks.org",
    "freecodecamp.org",
    "docs.python.org",
    "react.dev",
    "nodejs.org",
    "kaggle.com",
    "medium.com",
    "towardsdatascience.com",
    "scikit-learn.org",
    "tensorflow.org",
    "pytorch.org",
]


def fallback_article(query: str) -> dict:
    """
    Return fallback Google search link.
    """

    return {
        "title": f"{query} tutorial",
        "url": (
            "https://www.google.com/search?q="
            f"{query}+tutorial"
        )
    }


def calculate_article_score(title: str, link: str) -> int:
    """
    Rank article quality.
    """

    score = 0

    title = title.lower()
    link = link.lower()

    # Trusted domains boost
    for domain in TRUSTED_DOMAINS:
        if domain in link:
            score += 1000

    # Educational keyword boost
    keywords = [
        "tutorial",
        "guide",
        "documentation",
        "course",
        "beginner",
        "learn",
    ]

    for keyword in keywords:
        if keyword in title:
            score += 200

    # Penalize poor-quality sites
    spam_keywords = [
        "download",
        "pdf",
        "ppt",
        "advertisement",
        "login",
    ]

    for keyword in spam_keywords:
        if keyword in title:
            score -= 300

    return score


def get_best_article(query: str) -> dict:
    """
    Fetch best ranked article/resource.
    """

    try:

        if not API_KEY or not CX:
            print(
                "[WARNING] Missing Google Search API "
                "credentials."
            )

            return fallback_article(query)

        params = {
            "q": (
                f"{query} tutorial "
                f"OR guide "
                f"OR documentation"
            ),
            "key": API_KEY,
            "cx": CX,
            "num": 10,
        }

        response = requests.get(
            SEARCH_URL,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        items = data.get("items", [])

        if not items:
            return fallback_article(query)

        best_article = None
        best_score = -1

        for item in items:

            title = item.get("title", "")
            link = item.get("link", "")

            score = calculate_article_score(
                title,
                link
            )

            if score > best_score:
                best_score = score
                best_article = item

        if not best_article:
            return fallback_article(query)

        return {
            "title": best_article.get(
                "title",
                "Recommended Article"
            ),
            "url": best_article.get("link", "")
        }

    except Exception as err:
        print(f"[ARTICLE ERROR] {query}: {err}")

    return fallback_article(query)