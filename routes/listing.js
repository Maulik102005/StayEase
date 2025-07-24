const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

//Index Route
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
});

//New Route
router.get("/new", async (req, res) => {
  console.log(req.user);
  isLoggedIn;

  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing requested does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
});

//Create Route
router.post(
  "/",
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  })
);

//Edit Route
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
router.put("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
});

//Delete Route
router.delete("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
});

module.exports = router;
