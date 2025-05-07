import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import AccountModel from "../models/account.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import RoleModel from "../models/roles-permission.model.js";
import { Roles } from "../enums/role.enum.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError.js";
import MemberModel from "../models/member.model.js";
import { ProviderEnum } from "../enums/account-provider.enum.js";

// Service to login or create an account
export const loginOrCreateAccountService = async (data) => {
  const { providerId, provider, displayName, email, picture } = data;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Started Session...");

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      // Create a new user if not found
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      // Create an account linked to the user
      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save({ session });

      // Create a default workspace for the user
      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      // Assign OWNER role to the user in the workspace
      const ownerRole = await RoleModel.findOne({ name: Roles.OWNER }).session(
        session
      );
      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      // Set the current workspace for the user
      user.currentWorkspace = workspace._id;
      await user.save({ session });
    }

    await session.commitTransaction();
    // console.log(user);
    session.endSession();
    console.log("End Session...");

    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

// Service to register a new user
export const registerUserService = async (body) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = new UserModel({
      email,
      name,
      password,
    });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    const workspace = new WorkspaceModel({
      name: `My Workspace`,
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER }).session(
      session
    );
    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });

    user.currentWorkspace = workspace._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("End Session...");

    return {
      userId: user._id,
      workspaceId: workspace._id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Service to verify user credentials
export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Invalid email or password");
  }

  const user = await UserModel.findById(account.userId);
  if (!user) {
    throw new NotFoundException("User not found for the given account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  return user.omitPassword();
};
