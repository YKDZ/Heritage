import express, { NextFunction, Request, Response } from "express"
import { createBadge, deleteBadge, getBadges, updateBadge } from "../controllers/badge"
import { ErrorHandler } from "../exceptions/ErrorHandler"
import { verifyToken } from "../utils/verifyToken"

const router = express.Router()

router.post('/', verifyToken, createBadge)
router.put('/:id', verifyToken, updateBadge)
router.delete('/:id', verifyToken, deleteBadge)
router.get('/', getBadges)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err, res)
})

export default router