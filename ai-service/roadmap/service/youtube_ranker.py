import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")

SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


def fallback_video(query: str) -> dict:
    """
    Return fallback YouTube search URL.
    """

    return {
        "title": f"{query} tutorial",
        "url": (
            "https://www.youtube.com/results?"
            f"search_query={query}+tutorial"
        )
    }


def get_best_video(query: str) -> dict:
    """
    Fetch best YouTube tutorial video.
    """

    try:

        query = query.strip()

        if not query:
            return fallback_video("General")

        # If API key missing
        if not API_KEY:
            print("[WARNING] Missing YOUTUBE_API_KEY")
            return fallback_video(query)

        params = {
            "part": "snippet",
            "q": f"{query} tutorial",
            "maxResults": 5,
            "type": "video",
            "order": "viewCount",  # Best viewed videos
            "videoEmbeddable": "true",
            "safeSearch": "moderate",
            "key": API_KEY,
        }

        response = requests.get(
            SEARCH_URL,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        print("YOUTUBE RESPONSE:", data)

        items = data.get("items", [])

        if not items:
            return fallback_video(query)

        # Pick best ranked video
        best_video = items[0]

        # Correct extraction
        video_id = (
            best_video
            .get("id", {})
            .get("videoId")
        )

        if not video_id:
            return fallback_video(query)

        video_url = (
            f"https://www.youtube.com/watch?v={video_id}"
        )

        return {
            "title": (
                best_video
                .get("snippet", {})
                .get("title", f"{query} tutorial")
            ),
            "url": video_url
        }

    except requests.exceptions.Timeout:
        print(f"[TIMEOUT ERROR] {query}")

    except requests.exceptions.HTTPError as err:
        print(f"[HTTP ERROR] {query}: {err}")

    except requests.exceptions.RequestException as err:
        print(f"[REQUEST ERROR] {query}: {err}")

    except Exception as err:
        print(f"[UNKNOWN ERROR] {query}: {err}")

    return fallback_video(query)