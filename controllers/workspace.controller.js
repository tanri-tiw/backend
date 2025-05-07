import { HTTPSTATUS } from "../config/http.config.js";
import { Permissions } from "../enums/role.enum.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { getMemberRoleInWorkspace } from "../services/member.service.js";
import {
  changeMemberRoleService,
  createWorkspaceService,
  deleteWorkspaceService,
  getAllWorkspaceIsUserMemberService,
  getWorkspaceAnalyticsService,
  getWorkspaceByIdService,
  getWorkspaceMembersService,
  updateWorkspaceByIdService,
} from "../services/workspace.service.js";
import { roleGuard } from "../utils/roleGuard.js";
import {
  changeRoleSchema,
  createWorkspaceSchema,
  workspaceIdSchema,
} from "../validation/workspace.validation.js";
import mongoose from "mongoose";

export const createWorkspaceController = asyncHandler(async (req, res) => {
  const body = createWorkspaceSchema.parse(req.body);
  const userId = req.user?._id;
  const { workspace } = await createWorkspaceService(userId, body);
  return res
    .status(HTTPSTATUS.CREATED)
    .json({ message: "workspace created", workspace });
});

export const getAllWorkspaceUserIsMemberController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const { workspaces } = await getAllWorkspaceIsUserMemberService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User workspaces fetched successfully",
      workspaces,
    });
  }
);

export const getWorkspaceByIdController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  await getMemberRoleInWorkspace(userId, workspaceId);
  const { workspace } = await getWorkspaceByIdService(workspaceId);
  return res.status(HTTPSTATUS.OK).json({
    message: "workspace fetched successfully",
    workspace,
  });
});

export const getWorkspaceMemberController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.VIEW_ONLY]);
  const { members, roles } = await getWorkspaceMembersService(workspaceId);
  return res.status(HTTPSTATUS.OK).json({
    message: "workspace members retrived successfully ",
    members,
    roles,
  });
});

export const getWorkspaceAnalyticsController = asyncHandler(
  async (req, res) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getWorkspaceAnalyticsService(workspaceId);
    return res.status(HTTPSTATUS.OK).json({
      message: "workspace members retrived successfully",
      analytics,
    });
  }
);

export const changeWorkspaceMemberRoleController = asyncHandler(
  async (req, res) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);
    const userId = req.user?._id;
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);
    const { member } = await changeMemberRoleService(
      workspaceId,
      memberId,
      roleId
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Member Role changed successfully",
      member,
    });
  }
);

export const updateWorkspaceByIdController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const { name, description } = createWorkspaceSchema.parse(req.body);
  const userId = req.user?._id;

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.EDIT_WORKSPACE]);

  const { workspace } = await updateWorkspaceByIdService(
    workspaceId,
    name,
    description
  );
  return res.status(HTTPSTATUS.OK).json({
    message: "Workspace updated successfully",
    workspace,
  });
});

export const deleteWorkspaceByIdController = asyncHandler(async (req, res) => {
  const workspaceId = workspaceIdSchema.parse(req.params.id);
  const userId = req.user?._id;
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.DELETE_WORKSPACE]);

  const { currentWorkspace } = await deleteWorkspaceService(
    workspaceId,
    userId
  );
  return res.status(HTTPSTATUS.OK).json({
    message: "workspace deleted successfully",
    currentWorkspace,
  });
});
