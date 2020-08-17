const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load validation
const validProfileInput = require("../../validation/profile");
const validExperienceInput = require("../../validation/experience");
const validEducationInput = require("../../validation/education.js");

// Load profile model & Load user profile
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { restart } = require("nodemon");
const { route } = require("./auth");
const profile = require("../../validation/profile");
const { mapReduce } = require("../../models/Profile");

// @route    GET api/profile/test
// @desc     tests profile route
// @access   public route
router.get("/test", (req, res) => res.json({ mesg: "Profile works" }));

// @route    GET api/profile/profile
// @desc     Current user profile
// @access   Private route
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      //   .populate("user", ["name"])
      .then((profile) => {
        if (!profile) {
          errors.profile = "There are no profiles for this user!";
          return res.status(404).json(errors);
        }
        res.status(200).json(profile);
      })
      .catch((err) => res.status(400).json(err));
  }
);

// @route    GET api/profile/all
// @desc     Get all profiles
// @access   public route
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .then((profiles) => {
      if (!profiles) {
        errors.profiles = "There are no profiles";
        res.status(400).json(errors);
      }
      res.json(profiles);
    })
    .catch((err) => {
      res.status(400).json({ profiles: "There are no profiles here" });
    });
});

// @route    GET api/profile/handle/:handle
// @desc     Get user profile by handle
// @access   public route
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch((err) => res.status(400).json(err));
});

// @route    GET api/profile/user/:user_id
// @desc     Get user profile by user ID
// @access   Public route
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch((err) =>
      res.status(400).json({ profile: "There is no profile for this user ID" })
    );
});

// @route    GET api/profile/profile
// @desc     Create user profile
// @access   Private route
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validProfileInput(req.body);

    // check validation
    if (!isValid) {
      // return any errors with 400 status
      return res.status(400).json(errors);
    }
    // get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    //
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.gitHubUserName)
      profileFields.gitHubUserName = req.body.gitHubUserName;

    // Skills = split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.linkedIn) profileFields.social.linkedIn = req.body.linkedIn;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // update profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((profile) => res.json(profile));
      } else {
        // create profile

        // check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        });

        // Save Profile
        new Profile(profileFields).save().then((profile) => res.json(profile));
      }
    });
  }
);

// @route    POST api/profile/experience
// @desc     Add experience to profile
// @access   Private route
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validExperienceInput(req.body);

    // check validation
    if (!isValid) {
      // return any errors with 400 status
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // Add to experience array
      profile.experience.unshift(newExp);
      profile.save().then((profile) => {
        res.json(profile);
      });
    });
  }
);

// @route    POST api/profile/education
// @desc     Add experience to profile
// @access   Private route
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validEducationInput(req.body);

    // check validation
    if (!isValid) {
      // return any errors with 400 status
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // Add to experience array
      profile.education.unshift(newEdu);
      profile.save().then((profile) => {
        res.json(profile);
      });
    });
  }
);




// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience by ID
// @access   Private route
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
   
    Profile.findOne({ user: req.user.id }).then((profile) => {
    //  get remove index 
    const removeIndex = profile.experience
    .map(item => item.id)
    .indexOf(req.params.exp_id);

    // Splice 
    profile.experience.splice(removeIndex, 1);

    // Save
    profile.save().then(profile => res.json(profile))
    .catch(err => res.status(404).json(err));
    });
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education by ID
// @access   Private route
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
   
    Profile.findOne({ user: req.user.id }).then((profile) => {
    //  get remove index 
    const removeIndex = profile.education
    .map(item => item.id)
    .indexOf(req.params.edu_id);

    // Splice 
    profile.education.splice(removeIndex, 1);

    // Save
    profile.save().then(profile => res.json(profile))
    .catch(err => res.status(404).json(err));
    });
  }
);


// @route    DELETE api/profile
// @desc     Delete user and profile
// @access   Private route
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
   
   Profile.findOneAndRemove({ user: req.user.id})
   .then(() => {
     User.findOneAndRemove({ _id: req.user.id})
     .then(() => {
       res.json({ success: true});
     })
   })
  }
);


module.exports = router;
