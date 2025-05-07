import { asyncHandler } from "../middleware/asyncHandler.middleware.js";
import { config } from "../config/app.config.js";
import passport from "passport";
import { registerSchema } from "../validation/auth.validation.js";
import { registerUserService } from "../services/auth.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const googleLoginCallback = asyncHandler(async (req, res) => {
  const currentWorkspace = req.user?.currentWorkspace;

  if (!currentWorkspace) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
    );
  }

  return res.redirect(
    `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
  );
});

export const registerUserController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse({
    ...req.body,
  });

  await registerUserService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User created successfully",
  });
});

export const loginController = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(HTTPS.UNAUTHORIZED).json({
        message: info?.message || "Invalid email or password",
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(HTTPSTATUS.OK).json({
        message: "Logged in successfully",
        user,
      });
    });
  })(req, res, next);
});

export const logOutController = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.log("Logout err :", err);
      return res
        .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Filed to log out" });
    }
  });
  req.session = null;
  return res.status(HTTPSTATUS.OK).json({ message: "Logged out successfully" });
});
