import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_best_video(query):

    # 🔥 Improve query (VERY IMPORTANT)
    query = query + " tutorial for beginners"

    url = "https://www.googleapis.com/youtube/v3/search"

    params = {
        "part": "snippet",
        "q": query,
        "maxResults": 10,   # increased results
        "type": "video",
        "key": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    print("📺 YOUTUBE RESPONSE:", data)  # DEBUG (optional)

    # ✅ If no results → fallback
    if "items" not in data or len(data["items"]) == 0:
        return {
            "title": f"Search {query} on YouTube",
            "url": f"https://www.youtube.com/results?search_query={query}"
        }

    # 🔥 SIMPLE & RELIABLE: Pick first video
    item = data["items"][0]

    video_id = item["id"].get("videoId")

    # Safety check
    if not video_id:
        return {
            "title": f"Search {query} on YouTube",
            "url": f"https://www.youtube.com/results?search_query={query}"
        }

    return {
        "title": item["snippet"]["title"],
        "url": f"https://youtube.com/watch?v={video_id}"
    }