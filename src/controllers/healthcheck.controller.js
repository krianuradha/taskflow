import { get } from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
/*const healthCheck = (req, res,next) => {
    try{
    
        res.status(200).json(new ApiResponse(200, null, "API is healthy"));
    }
    catch(error){
        
     next(error);
    }

}*/
const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "API is healthy"));});// This is the health check controller function. It is wrapped with the `asyncHandler` to catch any errors that may occur during its execution. The function sends a JSON response with a status code of 200, indicating that the API is healthy. The response is structured using the `ApiResponse` class, which includes the status code, data (null in this case), and a message.
   export { healthCheck };// This file defines a health check controller for an API. The `healthCheck` function is an asynchronous function that sends a JSON response indicating that the API is healthy. If there is an error during the execution of the function, it will be caught and can be handled accordingly (though currently, the catch block is empty). The `ApiResponse` class is used to structure the response in a consistent format, including the status code, data, and message.