const passport = require("passport");
const LocalStrategy = require("passport-local");
const Users = require("../models/user");
const bcrypt = require("bcrypt");

//Local Strategy ko configure karna hai

passport.use(
	new LocalStrategy(async function (username, password, done) {
		try {
			const user = await Users.findOne({ username: username });
			if (!user) {
				return done(null, false); //user not found
			}

			bcrypt.compare(password, user.password, function (err, result) {
				if (!result) return done(null, false); //  User found password not matched
				return done(null, user); //User found password matched
			});
		} catch (err) {
			done(err);
		}
	})
);

//  Passport Setup

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
	try {
		let user = await Users.findOne({ _id: id });
		done(null, user);
	} catch (err) {
		done(err);
	}
});

//  Google Strategy  ko configure karna hai

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.STRATEGY_GOOGLE_CLIENT_ID,
			clientSecret: process.env.STRATEGY_GOOGLE_CLIENT_SECRET,
			callbackURL: "http://localhost:3000/auth/google/callback",
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				const user = await Users.findOne({ googleId: profile.id });
				if (user) {
					return done(null, user);
				}
				console.log(accessToken);
				const newUser = await Users.create({
					googleId: profile.id,
					username: profile.displayName,
					googleAccessToken: accessToken,
					googleImg: profile._json.picture,
				});
				console.log("New User: ", newUser);
				await newUser.save();
				return done(null, newUser);
			} catch (err) {
				done(err);
			}
		}
	)
);

module.exports = passport;
