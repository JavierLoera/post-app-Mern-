import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { User } from "../models/User.js";
import { configJwt } from "../config/auth.config.js";
import { RefreshToken } from "../models/RefreshToken.js";
import nodemailer from "nodemailer";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    //si existe el usuario
    let user = await User.findOne({ email });
    if (user) throw new Error("Email ya registrado 😒");

    //generamos nuevo usuario
    user = new User({ email, password, tokenConfirm: nanoid() });

    // Generar token
    let token = jwt.sign({ id: user.id }, configJwt.secret, {
      expiresIn: configJwt.jwtExpiration,
    });
    let refreshToken = await RefreshToken.createToken(user);
    res.status(200).json({
      id: user._id,
      email: user.email,
      accessToken: token,
      refreshToken: refreshToken,
    });

    await user.save();

    //enviamos el email de confirmacion de cuenta
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "c58882ba834218",
        pass: "8156e4beb74650",
      },
    });

    await transport.sendMail({
      from: '"Jesus Loera" <jesus_loera_15@hotmail.com>',
      to: user.email,
      subject: "verifique cuenta de correo",
      html: `<a href="http://localhost:5000/auth/confirm/${user.tokenConfirm}">verificar cuenta aquí</a>`,
    });
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
};

export const confirmarCuenta = async (req, res) => {
  const { tokenConfirm } = req.params;
  try {
    //buscamos el usuarioo con el token para confirmar su cuenta
    const user = await User.findOne({ tokenConfirm });
    if (!user) throw new Error("no se pudo confirmar cuenta");

    user.tokenConfirm = null;
    user.confirm = true;

    await user.save();
    res.redirect("/home");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    //usamos el metodo definido en el modelo para comparar las contraseñas
    if (!user || !(await user.comparePassword(password)))
      throw new Error("Email o contrasña incorrecta");

    //generar token
    let token = jwt.sign({ id: user.id }, configJwt.secret, {
      expiresIn: configJwt.jwtExpiration,
    });
    let refreshToken = await RefreshToken.createToken(user);
    res.status(200).json({
      id: user._id,
      email: user.email,
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  if (requestToken == null) {
    return res.status(403).json({ message: "Token es requerido" });
  }
  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });
    if (!refreshToken) {
      res.status(403).json({ message: "No existe el Token!" });
      return;
    }
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();
      res.status(403).json({
        message: "El token ha expirado, Inicia sesion nuevamente",
      });
      return;
    }
    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      configJwt.secret,
      {
        expiresIn: configJwt.jwtExpiration,
      }
    );
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const logout = (req, res) => {
  const { token } = req.body;
  RefreshToken.findOneAndRemove({ token }).exec();
  res.status(403).json({ message: "Logged out!" });
};
