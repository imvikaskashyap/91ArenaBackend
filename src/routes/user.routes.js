import { Router } from "express";
import { changeUserPassword, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser)

// Secured Routes

router.route("/logout").post(verifyToken,logoutUser)
router.route("/change-password").post(verifyToken,changeUserPassword)
router.route("/refresh-token").post(refreshAccessToken)

export default router;
