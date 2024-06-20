import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import colors from "colors";
import User, { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// TODO: Better handle errors.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get Bearer Token from req.
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error("No autorizado.");
    return res.status(401).json({ error: error.message });
  }
  const [_, token] = bearer.split(" ");

  // Decode JWT.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findById(decoded.id).select("_id name email");
      if (user) {
        req.user = user;
        next();
      } else {
        const err = new Error("Token no Valido.");
        next(err);
      }
    }
  } catch (error) {
    const err = new Error("Token no Válido");
    next(err);
  }
}
