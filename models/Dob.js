const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DobSchema = new Schema({
    date_of_birth: {
        type: Number,
        default: Date.now
    },
    dob_state: {
        type: Number,
        default: 0
    },
})

module.exports = Dob = mongoose.model("dob", DobSchema);
