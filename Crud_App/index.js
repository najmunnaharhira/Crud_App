const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// Load initial data from JSON file
let data = JSON.parse(fs.readFileSync("data.json"));

// Middleware to validate required fields for POST and PUT requests
const validateTask_POST_PUT_Method = (req, res, next) => {
  const { title, description, status } = req.body;

  // Check if title, description, and status are provided
  if (!title || !description || !status) {
    return res
      .status(400)
      .json({ message: "Title, description, and status are required" });
  }
  next();
};

// Middleware to validate at least one field for PATCH requests
const validateTask_PATCH_Method = (req, res, next) => {
  const { title, description, status } = req.body;

  // Check if at least one of title, description, or status is provided
  if (!title && !description && !status) {
    return res
      .status(400)
      .json({ message: "Title or description or status is required" });
  }
  next();
};

// Define status rank for sorting
const statusRank = {
  "TO DO": 1,
  "In Progress": 2,
  Completed: 3,
};

// GET endpoint to retrieve all tasks
app.get("/taskList", (req, res) => {
  try {
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ message: "Tasks not found" });
  }
});

// GET endpoint to retrieve tasks sorted by ID
app.get("/taskList/sortById", (req, res) => {
  try {
    const sortedTasks = data.slice().sort((a, b) => a.id - b.id);
    res.status(200).json(sortedTasks);
  } catch (error) {
    res.status(404).json({ message: "Tasks not found" });
  }
});

// GET endpoint to retrieve tasks sorted by status
app.get("/taskList/sortByStatus", (req, res) => {
  try {
    const sortedTasks = data.sort(
      (a, b) => statusRank[a.status] - statusRank[b.status]
    );
    res.status(200).json(sortedTasks);
  } catch (error) {
    res.status(404).json({ message: "Tasks not found" });
  }
});

// GET endpoint to search tasks by title or description
app.get("/taskList/search", (req, res) => {
  try {
    const { q } = req.query;
    const searchResults = data.filter(
      (task) =>
        task.title.toLowerCase().includes(q.toLowerCase()) ||
        task.description.toLowerCase().includes(q.toLowerCase())
    );
    res.status(200).json(searchResults);
  } catch (error) {
    res.status(404).json({ message: "Tasks not found" });
  }
});

// POST endpoint to add a new task
app.post("/taskList", validateTask_POST_PUT_Method, (req, res) => {
  try {
    const newTask = {
      id: data.length + 1,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    };
    data.push(newTask);
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to add task" });
  }
});

// PUT endpoint to update an existing task
app.put("/taskList/:id", validateTask_POST_PUT_Method, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    const taskIndex = data.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
      data[taskIndex] = { ...data[taskIndex], ...updatedTask };
      fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// DELETE endpoint to remove a task
app.delete("/taskList/:id", (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = data.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
      data.splice(taskIndex, 1);
      fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// PATCH endpoint to partially update a task
app.patch("/taskList/:id", validateTask_PATCH_Method, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updates = req.body;
    const taskIndex = data.findIndex((task) => task.id === taskId);

    if (taskIndex !== -1) {
      data[taskIndex] = { ...data[taskIndex], ...updates };
      fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
