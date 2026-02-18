import TaskAssign from "../models/TaskAssignModel.js";
import Employee from "../models/employeeModel.js";

// Create a new task assignment
export const createTask = async (req, res) => {
  try {
    const { taskTitle, description, assignedTo, priority, dueDate, company } = req.body;
    const assignedBy = req.user ? req.user.id : req.body.assignedBy;

    // Validation
    if (!taskTitle || !assignedTo || !dueDate || !assignedBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: taskTitle, assignedTo, dueDate, assignedBy",
      });
    }

    // Verify assignee (Employee) exists
    const assigneeExists = await Employee.findById(assignedTo);

    if (!assigneeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Create new task
    const newTask = new TaskAssign({
      taskTitle,
      description: description || "",
      assignedBy,
      assignedTo,
      taskStatus: "Pending",
      priority: priority || "Medium",
      dueDate,
      company: company || null,
    });

    await newTask.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all tasks with filters and pagination
export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";
    const priority = req.query.priority || "";

    // Build filter
    let filter = {};

    if (search) {
      filter.$or = [
        { taskTitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.taskStatus = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const totalCount = await TaskAssign.countDocuments(filter);
    const tasks = await TaskAssign.find(filter)
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("company", "companyName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get tasks assigned to a specific user
export const getTasksByAssignee = async (req, res) => {
  try {
    const { assigneeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status || "";
    const priority = req.query.priority || "";

    let filter = { assignedTo: assigneeId };

    if (status) {
      filter.taskStatus = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const totalCount = await TaskAssign.countDocuments(filter);
    const tasks = await TaskAssign.find(filter)
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("company", "companyName")
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TaskAssign.findById(taskId)
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("company", "companyName");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { taskStatus, completedDate, statusChangeReason } = req.body;

    if (!taskStatus) {
      return res.status(400).json({
        success: false,
        message: "taskStatus is required",
      });
    }

    const validStatuses = ["Pending", "In Progress", "Completed", "On Hold", "Cancelled"];
    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Fetch current task to get old status
    const currentTask = await TaskAssign.findById(taskId);
    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const oldStatus = currentTask.taskStatus;

    // Create status change history entry
    const historyEntry = {
      oldStatus: oldStatus,
      newStatus: taskStatus,
      reason: statusChangeReason || "No reason provided",
      changedAt: new Date(),
    };

    // Prepare update data
    const updateData = { taskStatus };
    
    // Add history entry
    if (!updateData.$push) {
      updateData.$push = {};
    }
    updateData.$push = { statusChangeHistory: historyEntry };

    if (taskStatus === "Completed" && !completedDate) {
      updateData.completedDate = new Date();
    } else if (completedDate) {
      updateData.completedDate = completedDate;
    }

    const updatedTask = await TaskAssign.findByIdAndUpdate(taskId, updateData, {
      new: true,
    })
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("company", "companyName");

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update task details
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { taskTitle, description, priority, dueDate, company } = req.body;

    const updateData = {};
    if (taskTitle) updateData.taskTitle = taskTitle;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = dueDate;
    if (company) updateData.company = company;

    const updatedTask = await TaskAssign.findByIdAndUpdate(taskId, updateData, {
      new: true,
    })
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("company", "companyName");

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = await TaskAssign.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get task report with analytics
export const getTaskReport = async (req, res) => {
  try {
    const matchStage = {};

    const report = await TaskAssign.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$taskStatus",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const priorityReport = await TaskAssign.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalTasks = await TaskAssign.countDocuments(matchStage);
    const completedTasks = await TaskAssign.countDocuments({
      ...matchStage,
      taskStatus: "Completed",
    });
    const pendingTasks = await TaskAssign.countDocuments({
      ...matchStage,
      taskStatus: "Pending",
    });

    res.status(200).json({
      success: true,
      data: {
        statusReport: report,
        priorityReport,
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks: await TaskAssign.countDocuments({
            ...matchStage,
            taskStatus: "In Progress",
          }),
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) + "%" : "0%",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get overdue tasks
export const getOverdueTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const filter = {
      dueDate: { $lt: now },
      taskStatus: { $ne: "Completed" },
    };

    const totalCount = await TaskAssign.countDocuments(filter);
    const tasks = await TaskAssign.find(filter)
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("company", "companyName")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
