const express = require("express");
const bcrypt = require("bcrypt")
const user = express.Router();
const jwt = require("jsonwebtoken")
const auth = require("../middleware/user_auth.js")
const User = require("../models/user.js")

user.post('/register', async (req, res) => {
    try {
        let { username, email, password, passwordCheck } = req.body;
       
        if (!username || !email || !password || !passwordCheck)
            return res.status(400).json({
                msg: "Incomplete field."
            })
        if (password !== passwordCheck)
            return res.status(400).json({
                msg: "Please verify the password."
            })
        if (password.length < 7)
            return res.status(400).json({
                msg: "Choose a password that is at least 7 characters long."
                })

        const createdEmail = await User.findOne({ email: email })
        if (createdEmail)
            return res.status(400).json({
                msg: "Sorry, email already exists."
            })

        const createdUsername = await User.findOne({ username: username })
        if (createdUsername)
            return res.status(400).json({ msg: "Sorry, username already exists." })

        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt)

        const newUser = new User({
            email,
            username,
            password: passwordHash, 
        })
        const savedUser = await newUser.save()
            res.json(savedUser)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

user.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
    if (!email || !password)
    return res.status(400).json({
        msg: "Incomplete field."
    })

    const user = await User.findOne({ email: email })
    if (!user)
    return res.status(400).json({ 
        msg: "No account with this email exists."
    })

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return res.status(400).json({ 
        msg: "Invalid password."
    })

    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET)
    res.json({ 
        token, 
        user: { 
            id: user._id, 
            email: user.email, 
        }})
} catch (err) {
    res.status(500).json({error: err.message})
}
})

user.delete("/delete", auth, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user);
      res.json(deletedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  user.post("/tokenIsValid", async (req, res) => {
    try {
      const token = req.header("x-auth-token");
      if (!token) return res.json(false);
  
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (!verified) return res.json(false);
  
      const user = await User.findById(verified.id);
      if (!user) return res.json(false);
  
      return res.json(true);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  user.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
      username: user.username,
      id: user._id,
    });
  });

module.exports = user

