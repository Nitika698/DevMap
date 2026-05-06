def get_user_prompt(topic, level, duration):

    return f"""
Generate a roadmap for: {topic}

Level: {level}
Study Duration: {duration}

All resources must be strictly about "{topic}" in the context of programming/technology.

Follow JSON format from system prompt.
"""