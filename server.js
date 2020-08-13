const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// request body parser
const bodyParser = require("body-parser");

// specifying routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Confing
const db = require("./config/keys").mongoURI;

// Connect to mongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Using routes that we declared earlier
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

//
const port = process.env.PORT || 5000; // connect to port or localhost:5000
app.listen(port, () => console.log(`Server running on  ${port}`));
