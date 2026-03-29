import express from "express";
import {
  getReviewForGuest,
  getReviewForHost,
  getReviews,
  postReview,
  updateReview,
} from "../controllers/review-controller.js";
import { authorize } from "../middlewares.js";

const reviewRouter = express.Router();

reviewRouter
  .route("/")
  .get(getReviews)
  .post(authorize, postReview)
  .put(authorize, updateReview);
reviewRouter.route("/host/:hostId").get(getReviewForHost);
reviewRouter.route("/guest/:guestId").get(getReviewForGuest);

export default reviewRouter;
