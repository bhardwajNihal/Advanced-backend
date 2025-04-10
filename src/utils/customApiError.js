
// Defining our own custom error class, extending the inbuilt Error class provided by js.
// gives more control over how we want to send error responses.
// used in case of synchronous error handling.

export class ApiError extends Error{

    constructor(status,message){        // calling constructor with desired parameters
        super(message),             // super(message) calls the parent Error class constructor, 
        this.statusCode = status        // custom attribute added

        Error.captureStackTrace(this,this.constructor);     // adds helpful stack trace debugging
    }

}