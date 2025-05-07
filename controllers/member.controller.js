import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { joinworkspaceByInviteService } from "../services/member.service.js";
import z from "zod";
import { HTTPSTATUS } from "../config/http.config.js";

export const joinWorkspaceController = asyncHandler(async (req, res) => {
  const inviteCode = z.string().parse(req.params.inviteCode);
  const userId = req.user?._id;
  const { workspaceId, role } = await joinworkspaceByInviteService(
    userId,
    inviteCode
  );
  return res.status(HTTPSTATUS.OK).json({
    message: "Successfully joined the workspace",
    workspaceId,
    role,
  });
});
