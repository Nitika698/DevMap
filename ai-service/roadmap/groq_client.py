import os
import requests
from dotenv import load_dotenv

from roadmap.system_prompt import get_system_prompt
from roadmap.user_prompt import get_user_prompt

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

API_KEY = os.getenv("GROQ_API_KEY_ROADMAP")
MODEL = os.getenv("MODEL_NAME_ROADMAP")

API_URL = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


def generate_roadmap(topic, level, duration):
    """
    Generate roadmap using Groq LLM API.
    """

    try:
        if not API_KEY:
            raise ValueError("Missing GROQ_API_KEY_ROADMAP")

        if not MODEL:
            raise ValueError("Missing MODEL_NAME_ROADMAP")

        payload = {
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": get_system_prompt()
                },
                {
                    "role": "user",
                    "content": get_user_prompt(
                        topic,
                        level,
                        duration
                    )
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000
        }

        response = requests.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        print("\n====== DEBUG START ======")
        print("MODEL:", MODEL)
        print("Status Code:", response.status_code)
        print("====== DEBUG END ======\n")

        if "choices" not in data:
            return {"error": data}

        return data["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as err:
        print(f"[REQUEST ERROR] {err}")
        return {"error": str(err)}

    except Exception as err:
        print(f"[GENERAL ERROR] {err}")
        return {"error": str(err)}