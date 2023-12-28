import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
// console.log("🚀 ~ file: multer.middleware.js:11 ~ storage:", storage)

const upload = multer({ storage })
// console.log("🚀 ~ file: multer.middleware.js:14 ~ upload:", upload)

export { upload }