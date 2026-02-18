import express from "express";
import {
  createTask,
  getAllTasks,
  getTasksByAssignee,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskReport,
  getOverdueTasks,
} from "../controller/taskAssignController.js";

const router = express.Router();

// Create a new task
router.post("/task", createTask);

// Get all tasks with filters and pagination
router.get("/tasks", getAllTasks);

// Get tasks assigned to a specific user
router.get("/tasks/assignee/:assigneeId", getTasksByAssignee);

// Get a single task by ID
router.get("/task/:taskId", getTaskById);

// Update task status
router.put("/task/:taskId/status", updateTaskStatus);

// Update task details
router.put("/task/:taskId", updateTask);

// Delete a task
router.delete("/task/:taskId", deleteTask);

// Get task report
router.get("/task-report", getTaskReport);

// Get overdue tasks
router.get("/overdue-tasks", getOverdueTasks);

export default router;
