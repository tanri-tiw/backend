import RoleModel from "../models/roles-permission.model.js";
import UserModel from "../models/user.model.js";
import MemberModel from "../models/member.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import { NotFoundException } from "../utils/appError.js";
import projectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";
import { Roles } from "../enums/role.enum.js";
import { TaskStatusEnum } from "../enums/task.enum.js";

export const createWorkspaceService = async (userId, body) => {
  try {
    const { name, description } = body;
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const workspace = new WorkspaceModel({
      name: name,
      description: description,
      owner: user._id,
    });

    await workspace.save();

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });

    await member.save();

    user.currentWorkspace = workspace._id;
    await user.save();

    return {
      workspace,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllWorkspaceIsUserMemberService = async (userId) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();
  const workspaces = memberships.map((membership) => membership.workspaceId);
  return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("workSpace are not found");
  }
  const members = await MemberModel.find({
    workspaceId,
  }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };
  return {
    workspace: workspaceWithMembers,
  };
};

export const getWorkspaceMembersService = async (workspaceId) => {
  const members = await MemberModel.find({ workspaceId })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");
  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();
  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId) => {
  const currentDate = new Date();
  const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });
  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $gt: TaskStatusEnum.DONE },
  });
  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });
  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };
  return { analytics };
};

export const changeMemberRoleService = async (
  workspaceId,
  memberId,
  roleId
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("workspace Not found");
  }
  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role Not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });
  if (!member) {
    throw new Error("member not found in the workspace");
  }
  member.role = role;
  await member.save();
  return { member };
};

export const updateWorkspaceByIdService = async (
  workspaceId,
  name,
  description
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("workspace not found");
  }

  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();

  return {
    workspace,
  };
};

export const deleteWorkspaceService = async (workspaceId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const workspace = await WorkspaceModel.findById(workspaceId).session(
      session
    );
    if (!workspace) {
      throw new NotFoundException("workspace not found");
    }

    if (workspace.owner.toString() !== userId) {
      throw new BadRequestException(
        "you are not authorized to delete this workspace"
      );
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await projectModel
      .deleteMany({ workspace: workspace._id })
      .session(session);
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
    await MemberModel.deleteMany({ workspaceId: workspace._id }).session(
      session
    );

    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(
        session
      );
      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;
      await user.save({ session });
    }

    await workspace.deleteOne({ session });
    await session.commitTransaction();
    session.endSession();
    return {
      currentWorkspace: user.currentWorkspace,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
