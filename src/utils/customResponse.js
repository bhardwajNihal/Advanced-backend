
// a standard approach in production level code to send api response
// instead of manually typing res.status().json({}) on every route, simply the function is called with required parameters.
// Maintains uniformity of api response accross the app, if the codebase becomes too large, and no. or routes increase multifold

export function sendResponse(
    res,
    {
        statuscode = 200,           // assigning default values
        success = true,
        message = "",
        data = null
    }
){
    res.status(statuscode).json({       // finally sending, standardized response
        success,
        message,
        data
    })
}