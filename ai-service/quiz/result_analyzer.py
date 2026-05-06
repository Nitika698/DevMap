from collections import defaultdict


def analyze_results(questions, answers):

    correct = 0
    wrong = 0

    weak_topics = defaultdict(int)

    review = []

    for q, user_answer in zip(questions, answers):

        is_correct = user_answer == q["answer"]

        if is_correct:
            correct += 1
        else:
            wrong += 1
            weak_topics[q["topic"]] += 1

        review.append({
            "question": q["question"],
            "options": q["options"],
            "correct_answer": q["answer"],
            "user_answer": user_answer,
            "topic": q["topic"],
            "is_correct": is_correct
        })

    weak_list = list(weak_topics.keys())

    return correct, wrong, weak_list, review