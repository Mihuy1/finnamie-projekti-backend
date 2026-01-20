import { listAllUsers, getUserByIdModel } from "../models/users-model.js";

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

export { getUsers, getUserById };
