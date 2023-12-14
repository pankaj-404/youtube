const asyncHandler = (requestHandler) => {
    return (err, req, res, next) => {
        Promise
            .resolve(requestHandler(err, req, res, next))
            .catch((error => next(error)))
    }
}

const asyncTyChHandler = (fn) => async (err, req, res, next) => {
    try {
        await fn(err, req, res, next)
    } catch (error) {
        res.status(err.code || error.code || 500).json({
            success: false,
            message: err.message || error.message || "Server error"
        })
    }
}

export { asyncHandler, asyncTyChHandler }