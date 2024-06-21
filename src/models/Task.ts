import mongoose, { Schema, Document, Types } from "mongoose";

const TASKSTATUS = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TASKSTATUS)[keyof typeof TASKSTATUS];

export interface ITask extends Document {
  taskName: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
  completedBy: Types.ObjectId;
}

export const TaskSchema: Schema = new Schema(
  {
    taskName: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    project: {
      type: Types.ObjectId,
      ref: "Project",
    },
    status: {
      type: String,
      enum: Object.values(TASKSTATUS),
      default: TASKSTATUS.PENDING,
    },
    completedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;
