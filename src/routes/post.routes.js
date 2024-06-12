import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { addPost, addPostCategory, getAllBlogs, getPostCategory } from "../controllers/post.controller.js";

const router = Router();



router.route("/post-category").post(addPostCategory)
router.route("/categories").get(getPostCategory)
router.route("/new-post").post(addPost)
router.route("/blogs").get(getAllBlogs)

export default router;
