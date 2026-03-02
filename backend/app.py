from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from models import db, Task
from utils import validate_task_data

app = Flask(__name__)

# Database configuration (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Home route
@app.route('/')
def home():
    return jsonify({"message": "Task Management Backend Running"})


# Create Task
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()

    if not validate_task_data(data):
        return jsonify({"error": "Invalid data"}), 400

    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        completed=False
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify({"message": "Task created successfully"}), 201


# Get All Tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    task_list = []

    for task in tasks:
        task_list.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed
        })

    return jsonify(task_list)


# Update Task
@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.get_json()

    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.completed = data.get('completed', task.completed)

    db.session.commit()

    return jsonify({"message": "Task updated successfully"})


# Delete Task
@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted successfully"})


if __name__ == '__main__':
    app.run(debug=True)


app = Flask(__name__)
CORS(app)   # ADD THIS

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
