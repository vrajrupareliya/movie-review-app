import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middleweres/multer.middlewere.js";
import { verifyJWT } from "../middleweres/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage", 
            maxCount: 1
        }
    ]),registerUser)

router.route("/login").post(loginUser)

// srecured routes
router.route("/logout").post(verifyJWT ,logoutUser)

export default router
