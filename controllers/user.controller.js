import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { getCurrentUserService } from "../services/user.service.js";
import { HTTPSTATUS } from "../config/http.config.js";
export const getCurrentUserController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { user } = await getCurrentUserService(userId);
  return res.status(HTTPSTATUS.OK).json({
    message: "User fetch successfully",
    user,
  });
});
