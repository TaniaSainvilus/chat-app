const mongoose = require('mongoose')

const transactionSchema = mongoose.Schema({
    date: {type: String, default: "Unnamed"},
    payee: {type: Number, default: 0},
    category: {type: String},
    spent: {type: Number, default: 0},
})

module.exports = mongoose.model('Budget', transactionSchema)