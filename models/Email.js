const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmailSchema = new Schema({
    email_address: {
        type: String,
        default: "Unknown"
    },
    email_state: {
        type: Number,
        default: 0
    }
})

module.exports = Email = mongoose.model("email", EmailSchema);
