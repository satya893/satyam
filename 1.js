let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskCategory = document.getElementById('taskCategory');
  const taskText = taskInput.value.trim();
  const category = taskCategory.value;

  if (taskText === '') {
    alert('Please enter a task!');
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    category: category,
    completed: false,
    createdAt: new Date().toLocaleString(),
    completedAt: null
  };

  tasks.push(task);
  taskInput.value = '';
  saveTasks();
  renderTasks();
  updateReport();
}

function renderTasks(filter = 'all') {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true; // 'all'
  });

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = `${task.text} (${task.category}) - Created: ${task.createdAt}`;
    li.className = task.completed ? 'completed' : '';

    const completeButton = document.createElement('button');
    completeButton.textContent = task.completed ? 'Undo' : 'Complete';
    completeButton.onclick = () => toggleTaskCompletion(task.id);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(task.id);

    li.appendChild(completeButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

function toggleTaskCompletion(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toLocaleString() : null;
      if (task.completed) showNotification(`Task completed: ${task.text}`);
    }
    return task;
  });
  saveTasks();
  renderTasks();
  updateReport();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  updateReport();
}

function filterTasks(filter) {
  renderTasks(filter);
}

function updateReport() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('pendingTasks').textContent = pendingTasks;
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showNotification(message) {
  if (Notification.permission === 'granted') {
    new Notification(message);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(message);
      }
    });
  }
}

function exportReport() {
  const report = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.completed).length,
    pendingTasks: tasks.filter(task => !task.completed).length,
    tasks: tasks
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'task_report.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  updateReport();
});