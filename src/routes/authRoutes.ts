import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El Nombre no puede ir vacio."),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("El Password es muy corto, minimo 8 caracteres."),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no son iguales.");
    }
    return true;
  }),
  body("email").isEmail().withMessage("E-mail no valido."),
  handleInputErrors,
  AuthController.createAccount
);

export default router;
