import type { Request, Response } from "express";
import colors from "colors";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    // Asignamos a un Manager.
    project.manager = req.user.id;

    try {
      await project.save();
      res.send("Proyecto creado correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [{ manager: { $in: req.user.id } }],
      });
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
        res.status(404).json({ error: error.message });
      }

      // Verificación si el usuario le pertenece el projecto.
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error("Acción no valida.");
        res.status(404).send(error.message);
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
        res.status(404).json({ error: error.message });
      }

      // Verificación si el usuario le pertenece el projecto.
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error(
          "Solo el manager puede actualizar el proyecto."
        );
        res.status(404).send(error.message);
      }

      project.projectName = req.body.projectName;
      project.clientName = req.body.clientName;
      project.description = req.body.description;

      await project.save();
      res.send("Solo el manager puede eliminar el proyecto.");
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
        res.status(404).json({ error: error.message });
      }

      // Verificación si el usuario le pertenece el projecto.
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error("Solo el manager puede eliminar el proyecto");
        res.status(404).send(error.message);
      }

      await project.deleteOne();
      res.send("Proyecto eliminado.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };
}
