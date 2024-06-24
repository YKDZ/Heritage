import express from 'express'
import { login, register, validateToken } from '../controllers/auth'
import { Request, Response, NextFunction } from 'express'
import { ErrorHandler } from '../exceptions/ErrorHandler'
import { verifyToken } from '../utils/verifyToken'

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/validate-token", verifyToken, validateToken)

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err, res);
})

export default router