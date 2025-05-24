class ApiError extends Error{
    constructor(
        statuscode,
        massage= "somthing went wrong",
        _error = [],
        stack = ""
    ){
        super(massage)
        this.message = massage
        this.data = null
        this.statuscode = statuscode
        this.success = false;
        this.errors = this.errors
        if (stack) {
            this.stack = stack            
        } else {
            Error.captureStackTrace(this, this.constuctor)
        }
    
    }
}

export {ApiError}