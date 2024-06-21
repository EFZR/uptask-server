import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export async function validateCurrentProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      const err = new Error("Proyecto no encontrado.");
      next(err);
    }
    req.project = project;
    next();
  } catch (error) {
    const err = new Error("Hubo un error.");
    next(err);
  }
}
