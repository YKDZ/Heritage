import express, { NextFunction, Request, Response } from "express"
import { createPost, deletePost, getBadges, getCommentAmount, getComments, getLatestComment, getPost, getPosts, getTags, updatePost } from "../controllers/post"
import { ErrorHandler } from "../exceptions/ErrorHandler"
import { verifyToken } from "../utils/verifyToken"

const router = express.Router()

router.get("/:id/latest-comment", getLatestComment)
router.get("/:id/comment-amount", getCommentAmount)
router.get("/:id/tags", getTags)
router.get("/:id/badges", getBadges)
router.get("/:id/comments", getComments)
router.post("/", verifyToken, createPost)
router.delete("/:id", verifyToken, deletePost)
router.get("/:id", getPost)
router.get("/", getPosts)
router.put("/:id", verifyToken, updatePost)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err, res)
})

export default router