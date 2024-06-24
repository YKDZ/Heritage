import express from "express"
import { createViewHistory, deleteUser, getCreatedComments, getCreatedPosts, getViewHistories, getUser, getUsers, updateUser } from "../controllers/user"
import { ErrorHandler } from "../exceptions/ErrorHandler"
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from "../utils/verifyToken"

const router = express.Router()

router.get("/created/posts", verifyToken, getCreatedPosts)
router.get("/created/comments", verifyToken, getCreatedComments)
router.post("/histories", verifyToken, createViewHistory)
router.get("/histories", verifyToken, getViewHistories)
router.delete("/:id", verifyToken, deleteUser)
router.get("/:id", getUser)
router.get("/", verifyToken, getUsers)
router.put("/:id", verifyToken, updateUser)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err, res)
})

export default router