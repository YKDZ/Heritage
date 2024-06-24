import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from "express"
import WebSocket from 'ws'
import authRouter from './routes/auth'
import commentsRouter from './routes/comments'
import postsRouter from './routes/posts'
import tagsRouter from './routes/tags'
import usersRouter from './routes/users'
import badgesRouter from './routes/badges'

dotenv.config()

const app = express()
const wss = new WebSocket.Server({ port: parseInt(process.env.WSS_PORT as string) })

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173', // 指定允许的源
    credentials: true, // 允许携带凭证
}))

app.use("/api/auth", authRouter)
app.use("/api/users", usersRouter)
app.use("/api/tags", tagsRouter)
app.use("/api/badges", badgesRouter)
app.use("/api/posts", postsRouter)
app.use("/api/comments", commentsRouter)

app.listen(process.env.PORT, () => {
    console.log("Heritage backend running on http://" + process.env.HOST + ":" + process.env.PORT)
})

wss.on('connection', (ws: WebSocket) => {
})