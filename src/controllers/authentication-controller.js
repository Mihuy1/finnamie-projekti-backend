import { addUser, getUserByEmail, modifyUser } from "../models/users-model.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  addHostProfileByUserId,
  modifyHostProfileByUserId,
} from "../models/host-profile-model.js";
import { setHostActivitiesByUserId } from "../models/host-activities-model.js";
import isEmail from "validator/lib/isEmail.js";

const postLogin = async (req, res, next) => {
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

    const {
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      role,
      country,
      date_of_birth,
      // Host specific fields (extracted from req.body)
      phone_number,
      street_address,
      postal_code,
      city,
      description,
      experience_length,

      activity_ids,
    } = req.body;

    if (!role) return res.status(400).json({ message: "Invalid role." });

    if (role !== "guest" && role !== "host")
      return res
        .status(400)
        .json({ message: "Invalid role. Role must be 'guest' or 'host'." });

    if (!password || !confirmPassword)
      return res.status(400).json({ message: "Password not specified" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match!" });

    const hashedPassword = await argon2.hash(password);

    if (!isEmail(email))
      return res.status(400).json({ message: "Please enter a valid email!" });

    const registeredUser = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role,
      country,
      date_of_birth,
    };

    const result = await addUser(registeredUser);

    if (role === "host") {
      const hostProfile = {
        phone_number,
        street_address,
        postal_code,
        city,
        description,
        experience_length,
      };

      await addHostProfileByUserId(result.id, hostProfile);

      if (activity_ids !== undefined)
        await setHostActivitiesByUserId(result.id, activity_ids);
    }

    res
      .status(200)
      .json({ message: "Registration successful!", userId: result.id });
  } catch (error) {
    res.status(400).json({ message: "something went wrong:", error });
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const role = req.user.role;
  const id = req.user.id;
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      country,
      date_of_birth,
      // Host specific fields (extracted from req.body)
      phone_number,
      street_address,
      postal_code,
      city,
      description,
      experience_length,
      activity_ids,
    } = req.body;

    let hashedPassword;

    if (password) {
      if (!confirmPassword)
        return res
          .status(400)
          .json({ message: "Password confirmation required." });

      if (password !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match!" });

      hashedPassword = await argon2.hash(password);
    }

    if (email)
      if (!isEmail(email))
        return res.status(400).json({ message: "Please enter a valid email!" });

    const updatedUser = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      country,
      date_of_birth,
    };

    await modifyUser(id, updatedUser);

    if (role === "host") {
      const hostUpdatedUser = {
        phone_number,
        street_address,
        postal_code,
        city,
        description,
        experience_length,
      };
      await modifyHostProfileByUserId(id, hostUpdatedUser);

      if (activity_ids !== undefined)
        await setHostActivitiesByUserId(id, activity_ids);
    }

    res.status(200).json({ message: "Profile updated successfully!" });
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

export { postLogin, register, updateProfile, getMe, logout };
