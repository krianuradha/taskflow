import mongoose from "mongoose";
const connectDB = async () => {
    try{
await mongoose.connect(process.env.MONGODB_URL);
 console.log("Connected to MongoDB successfully");
    }//AWAITING THE CONNECTION TO MONGODB, IF IT IS SUCCESSFUL, WE LOG A SUCCESS MESSAGE TO THE CONSOLE
    catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }
};// in case we face some error connecting to database, we will catch it and log it to the console

export default connectDB;// we export the connectDatabase function to be used in other parts of the application, such as in server.js where we will call this function to establish a connection to the database before starting the server.