import express from "express";
import {
  login,
  register,
  refreshToken,
  logout,
  confirmarCuenta,
} from "../controllers/auth.controller.js";
import { validatorExpress } from "../middlewares/validatorExpress.js";
import { body } from "express-validator";
import { verifyToken } from "../middlewares/authJwt.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email", "Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password", "Contraseña mínimo 6 carácteres")
      .trim()
      .isLength({ min: 6 })
      .custom((value, { req }) => {
        if (value !== req.body.repassword) {
          throw new Error("No coinciden las contraseñas");
        }
        return value;
      }),
  ],
  validatorExpress,
  register
);
router.post(
  "/login",
  [
    body("email", "Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password", "Contraseña mínimo 6 carácteres")
      .trim()
      .isLength({ min: 6 }),
  ],
  validatorExpress,
  login
);

router.get("/confirm/:tokenConfirm", confirmarCuenta);

//envio token por body
router.get("/refresh", refreshToken);

router.delete("/logout", logout);

//verificar proteger rutas middleware
router.get("/getData", verifyToken, (req, res) => {
  console.log(req.user);
});

export default router;
