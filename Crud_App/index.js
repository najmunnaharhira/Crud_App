// Import required modules
const express = require("express");
const bodyParser = require("body-parser");

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// In-memory storage for tasks`
let tasks = [];

// Routes

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Create a new task
app.post("/tasks", (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !status) {
    return res.status(400).json({ error: "Title and status are required" });
  }
  const newTask = {
    id: tasks.length + 1,
    title,
    description: description || "",
    status,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, status } = req.body;
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title || tasks[taskIndex].title,
    description: description || tasks[taskIndex].description,
    status: status || tasks[taskIndex].status,
  };
  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks.splice(taskIndex, 1);
  res.sendStatus(204);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
