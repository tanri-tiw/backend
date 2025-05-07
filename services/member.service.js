import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import workspaceModel from "../models/workspace.model.js";
import { NotFoundException, UnauthorizedException } from "../utils/appError.js";
import memberModel from "../models/member.model.js";
import rolesPermissionModel from "../models/roles-permission.model.js";
import { Roles } from "../enums/role.enum.js";
import { BadRequestException } from "../utils/appError.js";
export const getMemberRoleInWorkspace = async (userId, workspaceId) => {
  const workspace = await workspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }
  const member = await memberModel
    .findOne({
      userId,
      workspaceId,
    })
    .populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "you are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  const roleName = member.role?.name;
  return { role: roleName };
};

export const joinworkspaceByInviteService = async (userId, inviteCode) => {
  const workspace = await workspaceModel.findOne({ inviteCode });
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }
  const existingMember = await memberModel
    .findOne({
      userId,
      workspaceId: workspace._id,
    })
    .exec();

  if (existingMember) {
    throw new BadRequestException("you are already a member of workspace");
  }

  const role = await rolesPermissionModel.findOne({ name: Roles.MEMBER });

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const newMember = new memberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
  });

  await newMember.save();

  return { workspaceId: workspace._id, role: role.name };
};
