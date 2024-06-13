import { Request, Response } from "express";
import bcrypt from "bcrypt";
import colors from "colors";
import User from "../models/User";
import { hashPassword } from "../utils/auth";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      // Prevenir Duplicados.
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya esta registrado.");
        return res.status(409).json({ error: error.message });
      }

      // Inicio de Creación.
      const user = new User(req.body);

      // Hash Password.
      user.password = await hashPassword(password);
      await user.save();

      res.send("Cuenta creada, revisa tu email para confirmarla.");
    } catch (error) {
      console.log(colors.red.bold(error));
      res.status(500).json({ error: "Error interno." });
    }
  };
}
