/**
 * Require the npm packages
 */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


/**
 * Add express and set port locally and globally
 */

const app = express();
let port = process.env.PORT || 3000;


/**
 * Add public (static) folder on express, set ejg and add bodyParser
 */

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


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
 * Make User schema
 */

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


/**
 * Encryption Password on database
 */

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});


/**
 * Make users model
 */

const User = new mongoose.model("User", userSchema);

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
    const username = req.body.username;
    const password = req.body.password;

    // Find user on database and match with user type on the login page
    User.findOne({email: username}, function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
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
    const newUser = new User(
        {
            email: req.body.username,
            password: req.body.password
        }
    );

    newUser.save(function (err) {
        if (err) {
            res.send(err);
        } else {
            res.render("secrets");
        }
    });
});


/**
 * Start Server
 */

app.listen(port, function () {
    console.log(`Server is running on http://localhost:${port}`);
});