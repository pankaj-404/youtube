// require(dotenv).config({ path: './env' })
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: "./env"
})

const port = process.env.PORT || 8000

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("ERROR ===> ", err)
            throw err
        })
        app.listen(port,
            () => console.log(`Server is running on port ===> ${port}`)
        )
    })
    .catch(err => console.error("MONGO DB connection failed ===> ", err))