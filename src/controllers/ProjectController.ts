import type { Request, Response } from "express";
import colors from "colors";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    try {
      await project.save();
      res.send("Proyecto creado correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static getAllProjects = async (_req: Request, res: Response) => {
    try {
      const projects = await Project.find({});
      res.json(projects);
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado.");
        return res.status(404).json({ error: error.message });
      }
      res.json(project);
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Proyecto no encontrado.");
        return res.status(404).json({ error: error.message });
      }

      project.projectName = req.body.projectName;
      project.clientName = req.body.clientName;
      project.description = req.body.description;

      await project.save();
      res.send("Proyecto Actualizado.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Proyecto no encontrado.");
        return res.status(404).json({ error: error.message });
      }
      await project.deleteOne();
      res.send("Proyecto eliminado.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };
}
