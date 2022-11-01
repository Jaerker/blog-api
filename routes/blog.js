const router = require('express').Router();
const verify = require('./verifyToken');
const { Post } = require('../model/Post');
const { commentSchema } = require('../model/Comment');
const mongoose = require('mongoose');
const User = require('../model/User');


router.route('/posts')
    .get(verify, async (req, res) => {


        const posts = await Post.find();

        if (posts) return res.status(200).send(posts);
        else return res.status(400).send("No posts found.");



    })

    .post(verify, async (req, res) => {


        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user._id
        });

        await User.findOneAndUpdate({ _id: req.user._id }, { $push: { posts: post._id } }, { upsert: true, new: true, runValidators: true });

        post.save((err, success) => {
            if (err) return res.status(400).send(err);
            else return res.status(201).send(success);
        });
    });



router.route('/posts/:postId/')

    .get(verify, async (req, res) => {

        console.log(req.user);

        const post = await Post.findById(req.params.postId).populate('author', { password: 0 });


        if (post) return res.status(200).send(post);
        return res.status(400).send('did not find post');

        // Post.findById(req.params.postId, (err, success) => {
        //     if (err) return res.status(400).send(err);
        //     return res.status(200).send(success);
        // });

    })

    //Posts comment for specific post.
    .post(verify, async (req, res) => {
        const Comment = new mongoose.model("comment", commentSchema);
        const comment = new Comment({
            reaction: req.body.reaction,
            content: req.body.content,
            user: req.user._id,
            username: req.user.username

        });





        const post = await Post.findOne({ _id: req.params.postId });

        await post.comments.push(comment);
        await post.save()

        return res.status(201).send(post);
    })

    //Deletes the post itself with all the comments
    .delete(verify, async (req, res) => {
        await User.findOneAndUpdate({_id: req.user._id}, {$pull: {posts: req.params.postId}}, { upsert: true, new: true, runValidators: true });

        Post.findOneAndDelete({ _id: req.params.postId }, err => {
            if (err) return res.status(400).send(err);
            else return res.status(200).send("Successfully deleted post");
        });
    });

router.route('/posts/:postId/like')
    .post(verify, async (req, res) => {


        const user = await User.findById(req.user._id);

        if (user) {

            const post = await Post.findById(req.params.postId);
            if (!post) return res.status(400).send('Post does not exist');


            if (post.likes.includes(user._id)) {
                await Post.findOneAndUpdate({ _id: req.params.postId }, { $pull: { likes: user._id } }, { upsert: true, new: true, runValidators: true });
            }
            else {
                await Post.findOneAndUpdate({ _id: req.params.postId }, { $push: { likes: user._id } }, { upsert: true, new: true, runValidators: true });
            }
            return res.status(200).send('Post like updated');


        }
        else {
            return res.status(400).send('Did not find User');
        }


    });



router.route('/posts/:postId/:commentId')
    .get(verify, async (req, res) => {

        try {
            const post = await Post.findOne({ _id: req.params.postId });


            res.status(200).send(post.comments.id(req.params.commentId));

        }
        catch (e) {
            res.status(400).send("Did not find the comment");
        }






    })

    .delete(verify, async (req, res) => {
        try {
            const post = await Post.findOne({ _id: req.params.postId });


            post.comments.id(req.params.commentId).deleteOne();
            post.save((err) => {
                if (err) return res.status(400).send(err);
                else return res.status(200).send("Succesfully removed comment");
            })

        }
        catch (e) {
            res.status(400).send("Did not find the comment");
        }
    });

//Get user info
router.route('/user')
    .delete(verify, (req, res) => {
        
        User.findOneAndDelete({ _id: req.user._id }, (err) => {
            if (err) return res.status(400).send("Could not delete User");
            else {

                return res.status(200).send("Succesfully deleted User" + req.user);
            }
        });

    });


router.route('/users')
    .get(verify, async (req, res) => {
        const users = await User.find({}, { __v: 0, password: 0 });

        res.status(200).send(users);
    });


router.route('/users/:userId')
    .get(verify, async (req, res) => {
        const user = await User.findOne({ _id: req.params.userId }, { __v: 0, password: 0 }).populate('friends', {password:0});

        if (user) {
            return res.status(200).send(user);
        }
        else {
            res.status(400).send("User not found");
        }

    })

    .put(verify, (req, res) => {
        const user = new User({
            fName: req.body.fName,
            lName: req.body.lName,
            email: req.body.email
        });

        User.findOneAndUpdate({ _id: req.user._id }, user, { upsert: true }, (err) => {
            if (err) return res.status(400).send("Did not update user correctly");
            else return res.status(200).send("Succesfully updates user");
        });
    });



router.route('/users/:userId/posts')
    .get(verify, async (req, res) => {
        const posts = await Post.find({ author: req.params.userId });

        res.send(posts);
    })
    .delete(verify, async (req, res) => {
        const posts = await Post.find({ author: req.params.userId }).deleteMany();
        res.send(posts);


    });

router.route('/users/:userId/friends')

    .get(verify, async (req, res) => {

        const user = await User.findOne({ _id: req.params.userId }).populate('friends', {password:0}).exec();

        // user.friends.forEach(e => {
        //     e.password = "";
        // });

        res.send(user.friends);

    })

    .post(verify, async (req, res) => {

        const friendUser = await User.findById(req.params.userId);

        const user = await User.findById(req.user._id);

        if (user.friends) {

            if (user.friends.includes(friendUser._id)) {
                return res.status(400).send("exists");
            }
        }

        await User.findOneAndUpdate({ _id: req.user._id }, { $push: { friends: friendUser._id } }, { upsert: true, new: true, runValidators: true });
        return res.status(201).send('Friend added');



    })

    .delete(verify, async (req, res) => {


        await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { friends: req.params.userId } }, { upsert: true, new: true, runValidators: true });
        return res.status(201).send('Friend removed');


        // const user = await User.findById(req.user._id);

        // user.friends.id(req.params.userId).DeleteOne().then(() => {
        //     res.status(200).send("Successfully deleted friend.");
        // }).catch(e => {
        //     res.status(400).send(e);
        // });
    });




module.exports = router;