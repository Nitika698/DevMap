def get_user_prompt(topic, level, duration):

    return f"""
Generate a Computer Science learning roadmap.

Topic: {topic}

Level: {level}

Study Duration: {duration}

Return topics and subtopics only.
"""