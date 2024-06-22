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
      res.status(500).json({ error: "Error interno." });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static getProjectTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "notes",
          select: "content createdBy",
          populate: {
            path: "createdBy",
            select: "id name email",
          },
        })
        .populate({
          path: "completedBy.user",
          select: "id name email",
        });

      res.json(task);
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      const { task } = req;

      task.taskName = req.body.taskName;
      task.description = req.body.description;

      await task.save();

      res.send("Tarea Actualizada Correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static updateTaskStatus = async (req: Request, res: Response) => {
    try {
      const { task } = req;

      task.status = req.body.status;

      const data = {
        user: req.user.id,
        status: req.body.status,
      };

      req.task.completedBy.push(data);

      await task.save();

      res.send("Estado de la Tarea Actualizada Correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { task } = req;

      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== taskId
      );

      await Promise.allSettled([task.deleteOne(), req.project.save()]);

      res.send("Tarea Eliminada Correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };
}
