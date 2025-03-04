const mongoose = require('mongoose');
const dbg = require('debug')('post');




const postSchema = new mongoose.Schema({
   title: String,
    desc: String,
   price: String,
   userProfile: { data: Buffer, contentType: String }, 
});


module.exports = mongoose.model('post', postSchema);
