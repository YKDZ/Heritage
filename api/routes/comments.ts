import express from "express"
import { ErrorHandler } from "../exceptions/ErrorHandler"
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from "../utils/verifyToken"
import { createComment, deleteComment, updateComment } from "../controllers/comment"
import { getComments } from "../controllers/post"

const router = express.Router()

router.post('/', verifyToken, createComment)
router.put('/:id', verifyToken, updateComment)
router.delete('/:id', verifyToken, deleteComment)
router.get('/', verifyToken, getComments)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err, res)
})

export default router