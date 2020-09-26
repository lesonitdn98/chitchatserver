const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    phone: {
        type: Schema.Types.ObjectId,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: ""
    },
    full_name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        default: ""
    },
    dob: {
        type: Schema.Types.ObjectId
    },
    email: {
        type: Schema.Types.ObjectId
    },
    bio: {
        type: String,
        default: "Welcome to chitchat^^"
    },
    avatar: {
        type: String,
        default: ""
    },
    state: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: Date.now
    }
});

module.exports = User = mongoose.model("user", UserSchema);
