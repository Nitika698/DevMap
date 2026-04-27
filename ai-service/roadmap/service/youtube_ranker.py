import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")

print("🔑 API KEY:", API_KEY)


def get_best_video(query):
    try:
        search_url = "https://www.googleapis.com/youtube/v3/search"

        search_params = {
            "part": "snippet",
            "q": query + " tutorial",
            "maxResults": 1,   # 🔥 ALWAYS FIRST VIDEO
            "type": "video",
            "key": API_KEY
        }

        search_res = requests.get(search_url, params=search_params)
        search_data = search_res.json()

        print("📡 SEARCH RESPONSE:", search_data)

        if "items" not in search_data or len(search_data["items"]) == 0:
            print("❌ No items found")
            return {
                "title": f"{query} tutorial",
                "url": "https://www.youtube.com"
            }

        item = search_data["items"][0]

        video_id = item["id"]["videoId"]

        url = f"https://www.youtube.com/watch?v={video_id}"

        print("🎥 FINAL VIDEO URL:", url)

        return {
            "title": item["snippet"]["title"],
            "url": url
        }

    except Exception as e:
        print("❌ YouTube ERROR:", e)
        return {
            "title": f"{query} tutorial",
            "url": "https://www.youtube.com"
        }