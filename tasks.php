<?php
session_start();
include("connect.php");

// Проверка авторизации
if(!isset($_SESSION['email'])) {
    header("Location: index.php");
    exit();
}

// Обработка AJAX запросов
if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];
    $email = $_SESSION['email'];
    
    switch($action) {
        case 'add':
            $task = $_POST['task'];
            $time = $_POST['time'] ?? null;
            $stmt = $conn->prepare("INSERT INTO tasks (email, task, time) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $email, $task, $time);
            $stmt->execute();
            echo $stmt->insert_id; // Возвращаем ID новой задачи
            break;
            
        case 'delete':
            $task_id = $_POST['task_id'];
            $stmt = $conn->prepare("DELETE FROM tasks WHERE id=? AND email=?");
            $stmt->bind_param("is", $task_id, $email);
            $stmt->execute();
            echo "OK";
            break;
            
        case 'update':
            $task_id = $_POST['task_id'];
            $new_task = $_POST['new_task'];
            $new_time = $_POST['new_time'] ?? null;
            $stmt = $conn->prepare("UPDATE tasks SET task=?, time=? WHERE id=? AND email=?");
            $stmt->bind_param("ssis", $new_task, $new_time, $task_id, $email);
            $stmt->execute();
            echo "OK";
            break;
            
        case 'toggle':
            $task_id = $_POST['task_id'];
            $stmt = $conn->prepare("UPDATE tasks SET completed=NOT completed WHERE id=? AND email=?");
            $stmt->bind_param("is", $task_id, $email);
            $stmt->execute();
            echo "OK";
            break;
    }
    exit();
}

// Получение задач пользователя
$email = $_SESSION['email'];
$tasks = [];
$result = $conn->query("SELECT id, task, time, completed FROM tasks WHERE email='$email' ORDER BY id");
while($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <link href="https://fonts.googleapis.com/css2?family=FreeMono&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style_tasks.css">
    <style>
        * {
            font-family: 'FreeMono', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Task Manager</h1>
        <input type="text" id="taskInput" placeholder="Task description">
        <input type="text" id="timeInput" placeholder="Time to complete (optional)">
        <button onclick="addTask()">Add Task</button>
        <ul id="taskList">
            <?php foreach($tasks as $task): ?>
                <li data-id="<?= $task['id'] ?>" <?= $task['completed'] ? 'class="completed"' : '' ?>>
                    <span>
                        <?= htmlspecialchars($task['task']) ?>
                        <?php if($task['time']): ?>
                            <span class="task-time">(Date: <?= htmlspecialchars($task['time']) ?>)</span>
                        <?php endif; ?>
                    </span>
                    <button class="delete-btn" onclick="deleteTask(this)">Delete</button>
                    <button class="complete-btn" onclick="toggleComplete(this)">Complete</button>
                    <button class="edit-btn" onclick="editTask(this)">Edit</button>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <script src="script_tasks.js"></script>
</body>
</html>