const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/User');
const bcrypt = require('bcrypt');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

router.post("/", async (req, res, next) => {
    try {
        let { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("Email already used.");

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        let salt = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        await user.save();

        let token = user.generateToken();

        res.send(token);
    } catch (ex) {
        console.error(ex);
        next();
    }
});


router.get("/usernames", async (req, res, next) => {
    try {
        const usernames = await User.find().select('name _id profilePic');
        if (!usernames) return res.status(404).send("Usernames not found...");
        res.send(usernames);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.get("/cur-user/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('No user found...');
        res.send(user);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.get("/get-followers/new/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User not found...");
        let following = [...user.following];
        let users = await User.find({ 'name': { $in: following } }).select('name profilePic photos');
        res.send(users);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.get('/modal/:id/:image', async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('photos _id name profilePic');
        if (!user) return res.status(404).send('User not found...');
        const photos = [...user.photos];
        const index = photos.findIndex(x => x._id === req.params.image);
        let newUser = { user: { _id: user._id, name: user.name, profilePic: user.profilePic }, photo: photos[index] };
        res.send(newUser);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('_id name profilePic bio photos following followingMe');
        if (!user) return res.status(404).send("User not found...");
        res.send(user);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.get("/photo/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('profilePic');
        if (!user) return res.status(404).send('No user found...');
        res.header('Content-Type', user.profilePic.contentType).send(user.profilePic.data);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.get('/photos/:id', async (req, res, next) => {
    try {
        const photos = await User.findById(req.params.id).select('photos');
        if (!photos) return res.status(404).send('User not found...');
        res.send(photos);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.put("/profile-pic/:id", async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User not found...");
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).send("Image could not be uploaded.");
            else if (files.profilePic) {
                if (files.profilePic.size > 2000000) {
                    return res.status(400).send("Image can not be larger than 2MB");
                }
                await User.updateOne({ _id: user._id }, {
                    $set: {
                        profilePic: {
                            data: fs.readFileSync(files.profilePic.path),
                            contentType: files.profilePic.type
                        }
                    }
                })
                res.send("Image uploaded successfully.");
            }
        });
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.put("/bio/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('name');
        if (!user) return res.status(404).send('User not found...');
        await User.findByIdAndUpdate({ _id: req.params.id }, {
            bio: req.body.bio
        }, { useFindAndModify: false });
        res.send('bio updated successfully');
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.put("/grid-new/:id", async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('photos');
        if (!user) return res.status(404).send("User not found...");
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err) { return res.status(400).send("Image could not be uploaded.") }
            if (files.photo) {
                if (files.photo.size > 2000000) {
                    return res.status(400).send("Image can not be larger than 2MB");
                }
                let newPhotos = [...user.photos];
                let curPhoto = {
                    data: fs.readFileSync(files.photo.path),
                    contentType: files.photo.type, _id: Math.floor(Math.random() * 1000000).toString(),
                    likes: [],
                    comments: [],
                    date: Date.now()
                };
                newPhotos.push(curPhoto);
                await User.findByIdAndUpdate({ _id: user.id }, {
                    photos: newPhotos
                }, { useFindAndModify: false });
                res.send("Photo uploaded successfully!");
            }
        });
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.post("/following-me/:id", async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('_id');
        if (!user) return res.status(404).send("User not found...");

        await User.updateOne({ _id: req.params.id }, {
            followingMe: req.body.followingMe
        });
        res.send('user followed/unfollowed');
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.post("/following/:id", async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('_id');
        if (!user) return res.status(404).send("User not found...");

        await User.updateOne({ _id: req.body.userId }, {
            following: req.body.following
        });
        res.send('user followed/unfollowed');
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.put("/likes/:id/:image", async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('photos');
        if (!user) return res.status(404).send('User not found...');
        const photos = [...user.photos];
        const index = photos.findIndex(x => x._id === req.params.image);
        photos[index].likes = req.body.likes;
        await User.updateOne({ _id: req.params.id }, {
            photos: photos
        });
        res.send('photo liked/disliked')
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.put("/comments/:id/:image", async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('photos');
        if (!user) return res.status(404).send('User not found...');
        const photos = [...user.photos];
        const index = photos.findIndex(x => x._id === req.params.image);
        photos[index].comments = req.body.comments;
        await User.updateOne({ _id: req.params.id }, {
            photos: photos
        });
        res.send('photo liked/disliked')
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.delete("/delete-profile/:id", async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('Invalid user id.');
        res.send(user);
    } catch (ex) {
        console.error(ex);
        next();
    }
});

router.delete("/delete-photo/:id/:image", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('photos');
        if (!user) return res.status(404).send('Invalid user id');
        let newPhotos = [...user.photos];
        const index = newPhotos.findIndex(i => i._id === req.params.image);
        newPhotos.splice(index, 1);
        await User.updateOne({ _id: req.params.id }, {
            photos: newPhotos
        });
        res.send('Photo deleted successfully.');
    } catch (ex) {
        console.error(ex);
        next();
    }
});

module.exports = router;