const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { isLoggedIn, isAuthor } = require("../middleware.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
//Controller
const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");
//Review Routes
//POST route
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

//Review_Delete Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
