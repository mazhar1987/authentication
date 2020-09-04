/**
 * Require the npm packages
 */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



/**
 * Add express and set port locally and globally
 */

const app = express();
let port = process.env.PORT || 3000;


/**
 * Add public (static) folder on express, set ejg and add bodyParser
 * session, init passport, use passport to dealing with session
 */

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


/**
 * Connect mongoose
 */

mongoose.connect("mongodb://localhost:27017/authentication", 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);


/**
 * Remove deprecation warning
 */
mongoose.set('useCreateIndex', true);


/**
 * Make User schema
 */

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


/**
 * Use passport in mongoose
 */
userSchema.plugin(passportLocalMongoose);


/**
 * Make users model
 */

const User = new mongoose.model("User", userSchema);


/**
 * Create passport local login strategy for users
 * Setup passport serialize and deserialize for users
 */
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/**
 * Home routing
 */
app.get("/", function (req, res) {
    res.render("home");
});


/**
 * Make login route
 */

app.route("/login")
.get(function (req, res) {
    res.render("login");
})
.post(function (req, res) {
    // Getting username and password when users writng in the login fields
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            // After login successfully
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });

});


/**
 * Make register route
 */

app.route("/register")
.get(function (req, res) {
    res.render("register");
})
.post(function (req, res) {
    // Register user
    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

/**
 * Make secrets route
 */
app.route("/secrets")
.get(function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

/**
 * Make logout route
 */
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


/**
 * Start Server
 */

app.listen(port, function () {
    console.log(`Server is running on http://localhost:${port}`);
});