import { Request, Response } from "express";
import colors from "colors";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
  static async findMemberByEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email }).select("_id name email");
      if (!user) {
        const error = new Error("Usuario no encontrado.");
        return res.status(404).json({ error: error.message });
      }
      res.json(user);
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  }

  static async addMemberId(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const user = await User.findById(id);
      if (!user) {
        const error = new Error("Usuario no encontrado.");
        return res.status(404).json({ error: error.message });
      }

      if (
        req.project.team.some(
          (teamMember) => teamMember.toString() === user.id.toString()
        )
      ) {
        const error = new Error("El usuario ya existe en el proyecto.");
        return res.status(404).json({ error: error.message });
      }

      req.project.team.push(user.id);
      await req.project.save();

      res.send("Usuario agregado al projecto correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  }

  static async removeMemberId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (
        !req.project.team.some((teamMember) => teamMember.toString() === userId)
      ) {
        const error = new Error("El usuario no existe en el proyecto.");
        return res.status(404).json({ error: error.message });
      }

      req.project.team = req.project.team.filter(
        (teamMember) => userId !== teamMember._id.toString()
      );
      await req.project.save();

      res.send("Usuario eliminado del projecto correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  }

  static async getProjectTeam(req: Request, res: Response) {
    try {
      const project = await Project.findById(req.project.id).populate({
        path: "team",
        select: "id email name",
      });
      res.json(project.team);
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  }
}
