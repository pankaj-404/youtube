const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((error => next(error)))
    }
}

const asyncTyChHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || error.code || 500).json({
            success: false,
            message: err.message || error.message || "Server error"
        })
    }
}

export { asyncHandler, asyncTyChHandler }