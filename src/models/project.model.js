import mongoose, { Schema } from "mongoose";
const projectSchema = new mongoose.Schema({
name:{
    type:String,
    required:true,
    trim:true
},
description:{
    type:String,
    trim:true,
    default:""
},
createdBy:{
type:Schema.Types.ObjectId,
ref:"User",
required:true
},
status:{    
    type:String,
    enum:["pending", "in-progress", "completed"],
    default:"pending"
},
},{
    timestamps:true
})

export const Project = mongoose.model("Project", projectSchema);