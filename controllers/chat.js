//DEPENDENCIES
const express = require("express");
const chats = express.Router();

const Chat = require("../models/chat.js");

//ROUTES

//Get route
chats.get("/", (req, res) => {
    Chat.find({}, (err, foundChats) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(foundChats);
    });
});

//Seed value for road trip presets
chats.get("/seed", (req, res) => {
    let names = ["John", "Bill", "John", "Bill"];
    let chats = [];
    names.map((name) => {
        chats.push({
            content: "Ipsum lorem epsom salus stupendus maximus",
            name: name
        });
    });
    Chat.create(categories, (err, seededChat) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(seededChat)
    })
})

//Create new budget category
chats.post("/", (req, res) => {
    Chat.create(req.body, (err, createdChat) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(createdChat);
    });
});

//update budget value
chats.put('/:id', (req, res) => {
    Chat.findByIdAndUpdate(req.params.id, {$set: req.body}, (err, updatedChat) => {
        if (err) {
            res.status(400).json({ error: err.message })
        }
        res.status(200).json(updatedChat);
    })
})

//delete budget category
chats.delete("/:id", (req, res) => {
    Chat.findByIdAndDelete(req.params.id, (err, deletedChat) => {
        if (err) {
            res.status(400).json({"Error": err.message});
        }
        res.status(200).json(deletedChat);
    });
});

// chats.delete("/delete", (req, res) => {
// 	db.collection("Message").deleteMany({} , (err , collection) => {
// 		if(err) console.log(err);
// 		console.log(collection.result.n + " Record(s) deleted successfully");
// 		console.log(collection);
// 		db.close();
// 	});
// });

//EXPORTS
module.exports = chats