const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.ShowListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      }, //Nested populate so that author can be parsed
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing requested does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url, filename;

  if (req.file) {
    // File uploaded via multer
    url = req.file.path;
    filename = req.file.filename;
  } else if (req.body.listing.image) {
    // Image link from form input
    url = req.body.listing.image;
    filename = ""; // no filename for URL
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();

  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
  try {
    const searchTerm = req.body.search ? req.body.search.trim() : "";

    // If no search term, just redirect to all listings
    if (!searchTerm) {
      return res.redirect("/listings");
    }

    // Case-insensitive partial match search
    const allListings = await Listing.find({
      title: { $regex: searchTerm, $options: "i" },
    });

    // If no results, flash a message and show empty list
    if (allListings.length === 0) {
      req.flash("error", `No listings found for "${searchTerm}"`);
      return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while searching.");
    res.redirect("/listings");
  }
};
