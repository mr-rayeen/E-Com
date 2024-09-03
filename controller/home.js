const Products = require("../models/products");
const Users = require("../models/user");
const bcrypt = require("bcrypt")
const saltRounds = 10;

module.exports.getLogin = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/profile');
  res.render('login');
}

module.exports.getSignup = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/profile');
  res.render('signup')
}
module.exports.getHomePage = async (req, res, next) => {
  if (req.user == undefined) {
    isAdmin = false
  }else if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  try {
    let products = await Products.find();
    res.render("index", {
		products,
		isLoggedIn: req.isAuthenticated(),
		isAdmin,
		user: req.user || false
    });
  } catch (err) {
    next(err);
  }
};

module.exports.postSignup = async (req, res, next) => {
	const { username, password, name, email } = req.body;
	try {
		let user = await Users.findOne({ username });
		if (user) {
			return res.render("signup", {
				msg: "This username already exists try another one",
			});
		}

		bcrypt.hash(password, saltRounds, async function (err, hash) {
			try {
				user = await Users.create({
					username,
          password: hash,
          name,
          email
				});

				res.redirect("/login");
			} catch (err) {
				return res
					.status("500")
					.json("Cannot create a user right now!");
			}
		});
	} catch (err) {
		next(err);
	}
};

module.exports.getProfile = (req, res, next) => {
  if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  if (req.isAuthenticated()) {
    res.render("profile", {
      user: req.user,
      isLoggedIn: req.isAuthenticated(),
      isAdmin
    });
  } else {
		res.redirect("/login");
  }
}

module.exports.getLogout = function (req, res, next) {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
};
