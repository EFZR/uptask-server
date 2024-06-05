import { Request, Response } from "express";
import colors from "colors";
import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);
      await Promise.allSettled([req.project.save(), task.save()]);
      res.send("Tarea creada correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
    }
  };
}
