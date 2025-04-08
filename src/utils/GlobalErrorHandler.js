
// In Express, there are two kinds of middleware:
    // Normal middleware → (req, res, next)
    // Error-handling middleware → (err, req, res, next) → only runs if next(err) is called or an error is thrown


// A middleware that handles all of the async errors in every route.
// instead of handling error in every route, just pass it to this global middleware.
// it gracefully captures all the errors thrown during aynchronous operations and gives back a standardized response.

export function GlobalErrorHandler(err,req,res,next){           // every middleware in express takes this 4 parameters

    const statusCode = err.statusCode || 500;
    const message = err.message || "something went wrong!";

    res.status(statusCode).json({
        success : false,
        message : message,
    // In development mode, it shows the error stack (file and line number).
    // In production, it hides it for security reasons.
        stack: process.env.NODE_ENV === "production" ? null : err.stack 
    })
}