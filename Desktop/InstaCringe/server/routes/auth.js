const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');

router.post("/", async (req, res, next) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).send("Invalid email or password...");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send("Invalid email or password...");

        const token = user.generateToken();
        res.status(200).send(token);
    }
    catch (ex) {
        console.error(ex);
        next();
    }
});

const validate = (user) => {
    const schema = {
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).max(255)
    };
    return Joi.validate(user, schema);
};


module.exports = router;