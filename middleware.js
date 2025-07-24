module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; //TO redirect at earlier required page after logging in
    req.flash("error", "You must be logged in to create a new listing");
    return res.redirect("/login");
  }
  next();
};

//Passport deletes redirect Url after login page is accessed. SO, save it in locals
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) res.locals.redirectUrl = req.session.redirectUrl;

  next();
};
