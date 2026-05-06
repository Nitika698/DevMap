from utils.groq_client import query_model


def generate_references(topics):

    prompt = f"""
Provide exactly 3-4 learning references for these topics:

{topics}

Rules:

1 Video tutorial (YouTube)

1 Research paper (arXiv or academic)

1 or 2 educational websites

Return format:

Video:
title - link

Research Paper:
title - link

Website:
title - link
"""

    return query_model(prompt)