import { get } from "mongoose";
import { ApiResponse } from "../utils/api-response.js";
const healthCheck = (req, res,next) => {
    try{
    
        res.status(200).json(new ApiResponse(200, null, "API is healthy"));
    }
    catch(error){
        
     next(error);
    }

}
export { healthCheck };// This file defines a health check controller for an API. The `healthCheck` function is an asynchronous function that sends a JSON response indicating that the API is healthy. If there is an error during the execution of the function, it will be caught and can be handled accordingly (though currently, the catch block is empty). The `ApiResponse` class is used to structure the response in a consistent format, including the status code, data, and message.