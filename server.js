const express = require("express");
const mongoose = require("mongoose");

// specifying routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

// DB Confing
const db = require("./config/keys").mongoURI;

// connect to mongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log("Error: " + err);
  });

app.get("/", (req, res) => res.send("Hello there"));

// use routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000; // connect to port or localhost:5000

app.listen(port, () => console.log(`Server running on  ${port}`));
