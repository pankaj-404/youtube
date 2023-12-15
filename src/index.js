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
            console.log("ERROR ===> ".bgBrightRed, `${err}`.underline.red)
            throw err
        })
        app.listen(port,
            () => console.log(`Server is running on port ===> ${port} 🕺`.bgGreen)
        )
    })
    .catch(err => console.error("MONGO DB connection failed 🥺 ===> ".bgBrightRed, `${err}`.underline.red))