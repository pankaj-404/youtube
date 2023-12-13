import express from "express"
import cors from "cors"
import { receivingDataLimit } from "./constants.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: receivingDataLimit }))
app.use(express.urlencoded({ extended: true, limit: receivingDataLimit }))
app.use(express.static("public"))
app.use(cookieParser())

export { app }