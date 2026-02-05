import { addUser, getUserByEmail } from "../models/users-model.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const postLogin = async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await getUserByEmail(req.body.email);

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const ok = await argon2.verify(user.password, req.body.password);

    if (!ok) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const userWithoutPass = {
      id: user.id?.toString?.() ?? String(user.id),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing!");

    const token = jwt.sign(userWithoutPass, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    console.log("Login token: ", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7200000,
    });

    res.status(200).json({ message: "Login succesful!" });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const existingUserByEmail = await getUserByEmail(req.body.email);

    if (existingUserByEmail)
      return res
        .status(409)
        .json({ message: "User with this email already exists" });

    const { first_name, last_name, email, password, role } = req.body;

    if (!role) return res.status(400).json({ message: "Invalid role." });

    console.log("role:", role);

    if (role !== "guest" && role !== "host")
      return res
        .status(400)
        .json({ message: "Invalid role. Role must be 'guest' or 'host'." });

    const hashedPassword = await argon2.hash(password);

    const registeredUser = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role,
    };

    const result = await addUser(registeredUser);

    res
      .status(200)
      .json({ message: "Registration successful!", userId: result.id });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
    message: "Session is active",
  });
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out" });
};

export { postLogin, getMe, register, logout };
