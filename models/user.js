const mongoose = require('mongoose');
const dbg = require('debug')('user');


mongoose.connect('mongodb://127.0.0.1:27017/shops', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    dbg('Connected to MongoDB');
}).catch((error) => {
    dbg('Error connecting to MongoDB:', error);
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// ✅ Fix model name to "User"
module.exports = mongoose.model('User', userSchema);
