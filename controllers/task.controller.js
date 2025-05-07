import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "../validation/task.validation.js";
import { projectIdSchema } from "../validation/project.validation.js";
import { workspaceIdSchema } from "../validation/workspace.validation.js";
import { Permissions } from "../enums/role.enum.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";
import { roleGuard } from "../utils/roleGuard.js";
import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from "../services/task.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const createTaskController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const body = createTaskSchema.parse(req.body);
  const projectId = projectIdSchema.parse(req.params.projectId);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.CREATE_TASK]);

  const { task } = await createTaskService(
    workspaceId,
    projectId,
    userId,
    body
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Task created successfully",
    task,
  });
});

export const updateTaskController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const body = updateTaskSchema.parse(req.body);
  const taskId = taskIdSchema.parse(req.params.id);
  const projectId = projectIdSchema.parse(req.params.projectId);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.EDIT_TASK]);

  const { updatedTask } = await updateTaskService(
    workspaceId,
    projectId,
    taskId,
    body
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Task updated successfully",
    task: updatedTask,
  });
});

export const getAllTasksController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const filters = {
    projectId: req.query.projectId,
    status: req.query.status?.split(","),
    priority: req.query.priority?.split(","),
    assignedTo: req.query.assignedTo?.split(","),
    keyword: req.query.keyword,
    dueDate: req.query.dueDate,
  };

  const pagination = {
    pageSize: parseInt(req.query.pageSize) || 10,
    pageNumber: parseInt(req.query.pageNumber) || 1,
  };

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const result = await getAllTasksService(workspaceId, filters, pagination);

  return res.status(HTTPSTATUS.OK).json({
    message: "All tasks fetched successfully",
    ...result,
  });
});

export const getTaskByIdController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const taskId = taskIdSchema.parse(req.params.id);
  const projectId = projectIdSchema.parse(req.params.projectId);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);

  const task = await getTaskByIdService(workspaceId, projectId, taskId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Task fetched successfully",
    task,
  });
});

export const deleteTaskController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const taskId = taskIdSchema.parse(req.params.id);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_TASK]);

  await deleteTaskService(workspaceId, taskId);

  return res.status(HTTPSTATUS.OK).json({
    message: "Task deleted successfully",
  });
});
