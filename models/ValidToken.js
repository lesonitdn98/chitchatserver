const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ValidTokenSchema = new Schema({
    token: {
        type: String,
        required: true
    }
})

module.exports = ValidToken = mongoose.model("validtoken", ValidTokenSchema);
