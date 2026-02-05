import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";

import {
  listAllUsers,
  getUserByIdModel,
  addUser,
  modifyUser,
} from "../models/users-model.js";

const getUsers = async (req, res, next) => {
  try {
    res.json(await listAllUsers());
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json(await getUserByIdModel(id));
  } catch (error) {
    next(error);
  }
};

const postUser = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      image_url,
      description,
    } = req.body;

    const hashedPassword = await argon2.hash(password);
    const newUser = {
      id: uuidv4(),
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
      image_url,
      description,
    };

    const createdUser = await addUser(newUser);

    console.log(createdUser);
    res.status(201).json(createdUser);
  } catch (error) {
    if (error.errno === 1062 || error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const putUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // tartteeko tätä, kun route käyttää allowSelfOrAdmin
    if (req.user) {
      if (req.user.id !== id && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Forbidden: You can only modify your own account.",
        });
      }
    }

    const {
      first_name,
      last_name,
      email,
      password, // new
      currentPassword, // current, only if changing password
    } = req.body;

    const currentUser = await getUserByIdModel(id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found", id: id });
    }

    const updateData = {};

    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to update your password.",
        });
      }

      try {
        const isMatch = await argon2.verify(
          currentUser.password,
          currentPassword,
        );
        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect." });
        }
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error verifying credentials." });
      }

      updateData.password = await argon2.hash(password);
    }

    const result = await modifyUser(id, updateData);

    res.status(200).json({
      message: "User updated successfully",
      updated: updateData,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already in use." });
    }
    next(error);
  }
};

export { getUsers, getUserById, postUser, putUser };
