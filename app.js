const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

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

app.get("/testListing", async (req, res) => {
  const sampleListing = new Listing({
    title: "Test Apartment",
    description: "A cozy place to stay.",
    price: 1000,
    location: "Mumbai",
    country: "India",
  });
  await sampleListing.save();
  res.send("Sample listing saved!");
});

app.listen(8080, () => {
  console.log("server is running");
});
