const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PhoneSchema = new Schema({
    phone_number: {
        type: String,
        required: true
    },
    phone_state: {
        type: Number,
        default: 0
    },
})

module.exports = Phone = mongoose.model("phone", PhoneSchema);
