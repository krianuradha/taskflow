import mongoose from "mongoose";
import { TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: Object.values(TaskStatusEnum),
            default: TaskStatusEnum.TODO
        },

        dueDate: {
            type: Date
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        attachment: [
            {
                url: String,
                mimetype: String,
                size: Number
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Task = mongoose.model("Task", taskSchema);