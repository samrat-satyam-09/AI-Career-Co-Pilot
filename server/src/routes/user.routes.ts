import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  getUsage,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middlewares/auth";


const router = Router();

// All user routes require authentication
router.use(isAuthenticated);


router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/avatar", uploadAvatar);
router.put("/change-password", changePassword);
router.get("/usage", getUsage);
router.delete("/account", deleteAccount);

export default router;
