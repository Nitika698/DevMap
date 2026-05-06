from roadmap.service.youtube_ranker import get_best_video
from roadmap.service.web_search import get_best_article


def add_resource(resources, resource_type, data, default_title):
    """
    Safely add a resource to the resource list.
    """

    if not data:
        return

    title = data.get("title", default_title)
    url = data.get("url", "").strip()

    # Skip invalid URLs
    if not url:
        return

    # Prevent duplicate links
    if any(resource["link"] == url for resource in resources):
        return

    resources.append({
        "type": resource_type,
        "title": title,
        "link": url
    })


def attach_resources(roadmap: dict) -> dict:
    """
    Attach learning resources (videos + articles)
    to each roadmap subtopic.
    """

    topics = roadmap.get("topics", [])

    if not isinstance(topics, list):
        print("[ERROR] Invalid roadmap format")
        return roadmap

    for topic in topics:

        subtopics = topic.get("subtopics", [])

        if not isinstance(subtopics, list):
            continue

        for subtopic in subtopics:

            query = subtopic.get("name", "").strip()

            # Skip invalid subtopic names
            if not query:
                subtopic["resources"] = []
                continue

            print(f"[INFO] Fetching resources for: {query}")

            resources = []

            # Fetch YouTube resource
            try:
                video = get_best_video(query)

                add_resource(
                    resources,
                    "video",
                    video,
                    "Recommended Video"
                )

            except Exception as err:
                print(f"[VIDEO ERROR] {query}: {err}")

            # Fetch article resource
            try:
                article = get_best_article(query)

                add_resource(
                    resources,
                    "article",
                    article,
                    "Recommended Article"
                )

            except Exception as err:
                print(f"[ARTICLE ERROR] {query}: {err}")

            # Attach resources
            subtopic["resources"] = resources

    return roadmap