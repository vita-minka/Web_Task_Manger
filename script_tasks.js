function addTask() {
    const taskInput = document.getElementById("taskInput");
    const timeInput = document.getElementById("timeInput");
    const taskList = document.getElementById("taskList");

    if (taskInput.value === "") {
        alert("Please enter a task");
        return;
    }

    // AJAX запрос для сохранения в БД
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "tasks.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // После сохранения в БД добавляем задачу в список
            const taskId = xhr.responseText;
            const li = createTaskElement(taskId, taskInput.value, timeInput.value, false);
            taskList.appendChild(li);
            
            // Очищаем поля ввода
            taskInput.value = "";
            timeInput.value = "";
        }
    };
    xhr.send("action=add&task=" + encodeURIComponent(taskInput.value) + "&time=" + encodeURIComponent(timeInput.value));
}

function createTaskElement(id, taskText, timeText, completed) {
    const li = document.createElement("li");
    li.dataset.id = id;
    if (completed) li.classList.add("completed");
    
    const taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    
    if (timeText) {
        const timeSpan = document.createElement("span");
        timeSpan.textContent = " (Date: " + timeText + ")";
        timeSpan.className = "task-time";
        taskSpan.appendChild(timeSpan);
    }

    li.appendChild(taskSpan);

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.onclick = function() {
        deleteTask(this);
    };

    const completeButton = document.createElement("button");
    completeButton.innerHTML = "Complete";
    completeButton.className = "complete-btn";
    completeButton.onclick = function() {
        toggleComplete(this);
    };

    const editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    editButton.className = "edit-btn";
    editButton.onclick = function() {
        editTask(this);
    };

    li.appendChild(deleteButton);
    li.appendChild(completeButton);
    li.appendChild(editButton);
    
    return li;
}

function deleteTask(button) {
    const li = button.parentElement;
    const taskId = li.dataset.id;
    
    // AJAX запрос для удаления из БД
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "tasks.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            li.parentElement.removeChild(li);
        }
    };
    xhr.send("action=delete&task_id=" + taskId);
}

function toggleComplete(button) {
    const li = button.parentElement;
    const taskId = li.dataset.id;
    const isCompleted = li.classList.contains("completed");
    
    // AJAX запрос для обновления статуса в БД
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "tasks.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            li.classList.toggle("completed");
        }
    };
    xhr.send("action=toggle&task_id=" + taskId);
}

function editTask(button) {
    const li = button.parentElement;
    const taskId = li.dataset.id;
    const taskSpan = li.querySelector("span");
    const taskText = taskSpan.textContent.replace(/ \(Date: .*\)$/, "");
    const timeMatch = taskSpan.textContent.match(/\(Date: ([^)]+)\)/);
    const timeText = timeMatch ? timeMatch[1] : "";
    
    const newText = prompt("Edit task:", taskText);
    if (newText !== null) {
        const newTime = prompt("Edit time:", timeText);
        
        // AJAX запрос для обновления в БД
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "tasks.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                taskSpan.textContent = newText;
                
                // Удаляем старое время, если есть
                const oldTimeSpan = taskSpan.querySelector(".task-time");
                if (oldTimeSpan) taskSpan.removeChild(oldTimeSpan);
                
                // Добавляем новое время, если оно указано
                if (newTime) {
                    const timeSpan = document.createElement("span");
                    timeSpan.textContent = " (Date: " + newTime + ")";
                    timeSpan.className = "task-time";
                    taskSpan.appendChild(timeSpan);
                }
            }
        };
        xhr.send("action=update&task_id=" + taskId + "&new_task=" + encodeURIComponent(newText) + 
                "&new_time=" + encodeURIComponent(newTime || ""));
    }
}