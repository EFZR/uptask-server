import { Request, Response } from "express";
import colors from "colors";
import User from "../models/User";
import Token from "../models/Token";
import { checkPasswork, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static async createAccount(req: Request, res: Response) {
    try {
      const { password, email } = req.body;

      // Prevenir Duplicados.
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya esta registrado.");
        return res.status(409).json({ error: error.message });
      }

      // Inicio de Creación de Usuario.
      const user = new User(req.body);

      // Hash Password.
      user.password = await hashPassword(password);
      await user.save();

      // Generar Token.
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar Email.
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([token.save(), user.save()]);

      return res.send("Cuenta creada, revisa tu email para confirmarla.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async confirmAccount(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Token no valido.");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      return res.send("Cuenta confirmada correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado.");
        return res.status(404).json({ error: error.message });
      }

      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        // Enviar Email.
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un email de confirmacion."
        );
        return res.status(401).json({ error: error.message });
      }

      // Revisión de password.
      const isPasswordCorrect = await checkPasswork(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error("La contraseña es incorrecta.");
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT({ id: user.id });

      return res.send(token);
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async requestConfirmationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Buscar si existe el usuario.
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no esta registrado.");
        return res.status(404).json({ error: error.message });
      }

      // Prevenir token de usuarios confirmados.
      if (user.confirmed) {
        const error = new Error("El usuario ya esta confirmado.");
        return res.status(403).json({ error: error.message });
      }

      // Generar Token.
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar Email.
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await token.save();

      return res.send("Se envió un nuevo token a tu E-mail.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Buscar si existe el usuario.
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no esta registrado.");
        return res.status(404).json({ error: error.message });
      }

      // Generar Token.
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Enviar Email.
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await token.save();

      return res.send("Revisa tu E-Mail para instrucciones.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async validateToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Token no valido.");
        return res.status(404).json({ error: error.message });
      }

      return res.send("Token valido define tu nuevo password.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async updatePasswordWithToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido.");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([tokenExists.deleteOne(), user.save()]);

      return res.send("El password se modificó correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async user(req: Request, res: Response) {
    return res.json(req.user);
  }

  static async updateProfile(req: Request, res: Response) {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("Ese E-Mail ya esta registrado.");
      return res.status(409).json({ error: error.message });
    }

    try {
      req.user.name = name;
      req.user.email = email;

      await req.user.save();

      return res.send("Perfil actualizado correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async updateCurrentUserPassword(req: Request, res: Response) {
    const { password, current_password, password_confirmation } = req.body;
    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPasswork(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("La contraseña es incorrecta");
      return res.status(401).json({ error: error.message });
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      return res.send("El password se modifico correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }
}
