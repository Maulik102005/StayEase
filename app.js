if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Express Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET || "thisshouldbeabettersecret";

// ejs setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Temporary root route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Main async function
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");

    const store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: {
        secret: secret,
      },
      touchAfter: 24 * 3600, // 1 day
    });

    store.on("error", () => {
      console.log("❌ Error in mongo session store");
    });

    const sessionOptions = {
      store,
      secret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    // Passport setup
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // Flash + current user middleware
    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
      next();
    });

    // Routes
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // Start server
    const host = "0.0.0.0";
    const port = process.env.PORT || 8080;
    app.listen(port, host, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (e) {
    console.error("❌ MongoDB connection error:", e);
    process.exit(1);
  }
}

// Start the app
main();
