const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const Review = require("./models/review.js");

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//allows POST's use via req.body
app.use(express.urlencoded({ extended: true }));
//Post to put or post to delete
app.use(methodOverride("_method"));

//ejsMate
app.engine("ejs", ejsMate);

//To use style.css
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/wanderLust');` if your database has auth enabled
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", async (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
});

//Create Route
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

//Review Route
//POST route
app.post("/listings/:id/reviews", async (req, res) => {
  let listing = await Listing.findById(req.params.id).populate("reviews");
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview._id);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
});

// app.use((err, req, res, nest) => {
//   let { statusCode = 500, message = "Went wrong" } = err;
//   res.render("error.ejs", { message });
// });

//Review_Delete Route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);
app.listen(8080, () => {
  console.log("server is running");
});
