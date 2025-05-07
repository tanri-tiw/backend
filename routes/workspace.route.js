import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  deleteWorkspaceByIdController,
  getAllWorkspaceUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMemberController,
  updateWorkspaceByIdController,
} from "../controllers/workspace.controller.js";
const workspaceRoutes = Router();

workspaceRoutes.post("/create/new", createWorkspaceController);
workspaceRoutes.put("/update/:id", updateWorkspaceByIdController);
workspaceRoutes.delete("/delete/:id", deleteWorkspaceByIdController);
workspaceRoutes.put(
  "/change/member/role/:id",
  changeWorkspaceMemberRoleController
);
workspaceRoutes.get("/all", getAllWorkspaceUserIsMemberController);
workspaceRoutes.get("/members/:id", getWorkspaceMemberController);
workspaceRoutes.get("/:id", getWorkspaceByIdController);
workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);
export default workspaceRoutes;
