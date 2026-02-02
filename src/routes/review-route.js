import express from "express";
import {
  getReviewForGuest,
  getReviewForHost,
  getReviews,
} from "../controllers/review-controller.js";

const reviewRouter = express.Router();

reviewRouter.route("/").get(getReviews);
reviewRouter.route("/host/:hostId").get(getReviewForHost);
reviewRouter.route("/guest/:guestId").get(getReviewForGuest);

export default reviewRouter;
