import {
  findReviewByExperienceId,
  getReviewByGuestId,
  getReviewByHostId,
  listAllReviews,
  postReviewModel,
  updateReviewModel,
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

const getReviewByExperience = async (req, res, next) => {
  const { experience_id } = req.params;

  try {
    const reviews = await findReviewByExperienceId(experience_id);

    res
      .status(200)
      .json({ status: "success", results: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

const postReview = async (req, res, next) => {
  try {
    await postReviewModel(req.body, req.user.id);
    res.status(201).json({ message: "Review posted." });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    if (req.body.guestId !== req.user.id) {
      res.status(401).json({ message: "Unauthorized to update review." });
    }
    await updateReviewModel(req.body);
    res.status(200).json({ message: "Review updated." });
  } catch (error) {
    next(error);
  }
};

export {
  getReviews,
  getReviewForHost,
  getReviewForGuest,
  getReviewByExperience,
  postReview,
  updateReview,
};
