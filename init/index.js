const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

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

const initDB = async () => {
  await listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68823b519e367c6308680776",
  })); //assigning owner to each listing
  await listing.insertMany(initData.data);
  console.log("data was initialsed");
  console.log("data was initialised");
};

initDB();
