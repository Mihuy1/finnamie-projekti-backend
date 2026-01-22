import {
  listAllUsers,
  getUserByIdModel,
  addUser,
} from "../models/users-model.js";
import argon2 from "argon2";

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
    const { first_name, last_name, email, password, role } = req.body;
    const hashedPassword = await argon2.hash(password);
    const newUser = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
    };

    console.log("newUser", newUser);

    console.log("Hashed password:", hashedPassword);

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

export { getUsers, getUserById, postUser };
