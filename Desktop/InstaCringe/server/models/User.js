const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true, maxLength: 60 },
    email: { type: String, unique: true, trim: true, maxLength: 100 },
    password: String,
    isAdmin: { type: Boolean, default: false },
    profilePic: { data: Buffer, contentType: String },
    photos: Array,
    bio: { type: String, default: "This user has not set their bio yet." },
    followingMe: Array,
    following: Array
});
userSchema.methods.generateToken = function () {
    return jwt.sign({
        _id: this._id,
        name: this.name,
        email: this.email,
        profilePic: this.profilePic,
        photos: this.photos,
        isAdmin: this.isAdmin,
        bio: this.bio,
        followingMe: this.followingMe,
        following: this.following,
    },
        config.get('jwtPrivateKey'));
};

const User = mongoose.model('User', userSchema);

const validateUser = user => {
    const schema = {
        name: Joi.string().required().min(5).max(60),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).max(255)
    };
    return Joi.validate(user, schema);
};

module.exports.User = User;
module.exports.validate = validateUser;
