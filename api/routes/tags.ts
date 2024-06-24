import express, { NextFunction, Request, Response } from "express"
import { createTag, deleteTag, getTags, updateTag } from "../controllers/tag"
import { ErrorHandler } from "../exceptions/ErrorHandler"
import { verifyToken } from "../utils/verifyToken"

const router = express.Router()

router.post('/', verifyToken, createTag)
router.put('/:id', verifyToken, updateTag)
router.delete('/:id', verifyToken, deleteTag)
router.get('/', getTags)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err, res)
})

export default router