import { Response, Request, NextFunction } from "express";
import { validationResult } from "express-validator";

export function handleInputErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let errors = validationResult(req);
  if (!errors) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
}