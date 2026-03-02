def validate_task_data(data):
    if not data:
        return False

    if 'title' not in data or not data['title']:
        return False

    return True
