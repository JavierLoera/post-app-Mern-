import jwt from "jsonwebtoken";
import { configJwt } from "../config/auth.config.js";
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "Sin autorización. El token ha expirado!" });
  }
  return res.status(401).send({ message: "Sin autorización!" });
};

export const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No se proveyo un token!" });
  }
  //decodificamos el token y en respuesta exitosa enviamos el decoded si no enviamos el error
  try {
    const decoded = jwt.verify(token, configJwt.secret);
    req.user = decoded;
  } catch (err) {
    return catchError(err, res);
  }
  return next();
};
