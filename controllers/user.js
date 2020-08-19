//DEPENDENCIES
const bcrypt = require('bcrypt')
const express = require("express");
const user = express.Router();

const User = require("../models/user.js")

//ROUTES


user.get("/:username", (req, res) => {
    User.find({username: req.params.username}, (err, foundUser) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(foundUser);
    });
});

user.post("/", (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    User.create(req.body, (err, createdUser) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(createdUser);
    });
});

user.put("/:id", (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, updatedUser) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(updatedUser);
    });
});

user.delete("/:id", (req, res) => {
    User.findByIdAndDelete(req.params.id, (err, deletedUser) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(deletedUser);
    });
});

//EXPORTS
module.exports = user