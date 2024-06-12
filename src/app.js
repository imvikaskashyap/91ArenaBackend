import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}))


app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true, limit:"22kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// router import
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/blogs", postRouter)

export {app}