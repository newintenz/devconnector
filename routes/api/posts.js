const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Import model Post
const Post = require('../../models/Post');
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route    GET api/posts/test
// @desc     tests posts route
// @access   public route
router.get("/test", (req, res) => res.json({ mesg: "POSTS works" }));

// @route    GET api/posts/
// @desc     Get posts
// @access   public
router.get("/", (req, res) => {
    Post.find().sort({date: -1}).then(posts => {
        res.json(posts)
    }).catch(err => {
        res.status(404).json({nopostsfound: "No posts found!"})
    });
});

// @route    GET api/posts/:post_id
// @desc     Get post by id
// @access   public
router.get("/:id", (req, res) => {
    Post.findById(req.params.id).then(post => {
        res.json(post)
    }).catch( err => res.status(404).json({nopostfound: "No post found with that ID"}));
});


// @route    DELETE api/posts/:post_id
// @desc     Delete post by ID
// @access   private
router.delete("/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then( profile => {
        Post.findById(req.params.id)
        .then(post => {
            // check post owner
            if(post.user.toString() !== req.user.id ){
                return res.status(401).json({notauthorized: "User not authorized"});
            }

            // Delete post
            post.remove().then(() => {
                res.json({ success: true });
            }).catch(err => res.status(404).json({ postnotfound: "Post not found"}));
        })
    })
})



// @route    POST api/posts/
// @desc     Create a post
// @access   private
router.post("/", passport.authenticate('jwt', {session: false}), (req, res) => {
    const  { errors , isValid } = validatePostInput(req.body);

    // Check Validation 
    if(!isValid){
        // Check for any errors and send status 400 if any
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then( post => res.json(post));
})



// @route    POST api/posts/like/:id
// @desc     Like a post by ID
// @access   private
router.post("/like/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id }).then( profile  => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json({ alreadyliked : "User already liked this post"})
            }

            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
            post.save().then( post => res.json(post));

        }).catch(err => res.status(404).json({ postnotfound: "Post not found"}));
    })
})


// @route    POST api/posts/unlike/:id
// @desc     Unlike a post by ID
// @access   private
router.post("/unlike/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id }).then( profile  => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                return res.status(400).json({ notliked : "You have not yet liked this post"})
            }

            // Get remove index 
            const removeIndex = post.likes.map(item => item.user.toString())
            .indexOf(req.user.id);

            // Splice out of array 
            post.likes.splice(removeIndex, 1);
            
            // save
            post.save().then( post => res.json(post));

        }).catch(err => res.status(404).json({ postnotfound: "Post not found"}));
    })
})



// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   private
router.post('/comment/:post_id', passport.authenticate("jwt" , {session: false}) , (req, res) => {

    const  { errors , isValid } = validatePostInput(req.body);

    // Check Validation 
    if(!isValid){
        // Check for any errors and send status 400 if any
        return res.status(400).json(errors);
    }

    Post.findById(req.params.post_id)
    .then( post => {

        // Prepare an object containing comment data
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }

        // Add comment to array of comments
        post.comments.unshift(newComment);

        // save
        post.save().then( post => res.json(post))
        
    }).catch(err => res.status(404).json({ postnotfound: "No post found" }));
})



// @route    DELETE api/posts/comment/:post_id/:comment_id
// @desc     Delete a comment from a post
// @access   private
router.delete('/comment/:id/:comment_id', passport.authenticate("jwt" , {session: false}) , (req, res) => {

    Post.findById(req.params.id).then(post => {
        // Check if comment exists
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
            return res.status(404).json({ commentnotexists : "Comment doesn't exist"});
        }

        // If comment present get remove index 
        const removeIndex = post.comments.map( item => item._id.toString()).indexOf(req.params.comment_id);
        
        // Splice remove index
        post.comments.splice(removeIndex, 1);

        // save
        post.save().then( post => res.json(post));
    }).catch(err => res.status(404).json({ postnotfound: 'No post found' }));
})

module.exports = router;
