import {
  getReviewByGuestId,
  getReviewByHostId,
  listAllReviews,
} from "../models/review-model.js";

const getReviews = async (req, res, next) => {
  try {
    res.json(await listAllReviews());
  } catch (error) {
    next(error);
  }
};

const getReviewForHost = async (req, res, next) => {
  try {
    const { hostId } = req.params;

    res.json(await getReviewByHostId(hostId));
  } catch (error) {
    next(error);
  }
};

const getReviewForGuest = async (req, res, next) => {
  try {
    const { guestId } = req.params;

    res.json(await getReviewByGuestId(guestId));
  } catch (error) {
    next(error);
  }
};

export { getReviews, getReviewForHost, getReviewForGuest };
