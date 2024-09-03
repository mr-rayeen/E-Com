const path = require('path');
const express = require('express');
const app = express();
const PORT = 4000;
const mongoose = require('mongoose'); 
const hbs = require('hbs');
const fs = require("fs");
// const User = require('./models/user');

// app.use(async (req, res, next)=>{
// 	let user = {
// 		name: 'guest',
// 		role: 'user'
// 	}
//     req.user = user;
//     next();
// })
//  Using Passport For Authentication
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const cors = require("cors");
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: process.env.ATLASDB_PATH,
		}),
	})
);
app.use(cors());
const passport = require("./authentication/passport");
app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'hbs');
app.set("views", path.join(process.cwd(), "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

//  Registering Partials
hbs.registerPartials(process.cwd() + '/views/partials');

// Routes
// /admin, /admin/abc, /admin/abc/def, /admin/abc/../../
//  Admin Page Route
const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');

app.use('/admin', adminRouter);

//  Shop Page Route
app.use('/shop', shopRouter);

const homeRouter = require('./routes/home')
app.use('/', homeRouter);


mongoose.connect(process.env.ATLASDB_PATH).then(() => {
    app.listen(PORT, () => {
        console.log(`http://localhost:` + PORT);
    });
}).catch(err => {
    console.log(err)
})
