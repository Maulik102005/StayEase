const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/expressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; //TO redirect at earlier required page after logging in
    if (req.originalUrl.includes("/reviews")) {
      req.flash("error", "You cannot send a review unless you are logged in");
    } else {
      req.flash("error", "You must be logged in to create a new listing");
    }
    return res.redirect("/login");
  }
  next();
};

//Passport deletes redirect Url after login page is accessed. SO, save it in locals
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) res.locals.redirectUrl = req.session.redirectUrl;

  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not own this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// module.exports.validateListing = async (req, res, next) => {
//   let { error} = listingSchema.validate(req.body);
//   if(error)
//   {
//     let errorMsg = error.details.map((el) =>  el.message.join(",");
//   throw new ExpressError(400, errMsg));
//   }

//   else
//     next();
// };

module.exports.isAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You did not create this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
