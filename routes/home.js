const path = require("path");
const express = require("express");
const router = express.Router();
const passport = require("../authentication/passport");

const homeController = require("../controller/home");
router.get("/", homeController.getHomePage);
router.get("/login", homeController.getLogin);

router.post("/login", 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect("/shop");
    }
)

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/shop');
  });

router.get("/signup", homeController.getSignup);
router.post("/signup", homeController.postSignup);

router.get("/profile", homeController.getProfile);
router.get('/logout', homeController.getLogout);
module.exports = router;