let mongoose = require('mongoose');
let categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "name khong duoc de trong"],
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    image: {
        type:String,
        default: "https://i.imgur.com/QkIa5tT.jpeg"
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('category',categorySchema)