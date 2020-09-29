const moongoose = require("mongoose");
const Schema = moongoose.Schema;

const RelationshipSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    person_name: {
        type: Schema.Types.ObjectId,
        required: true
    },
    relationship: {
        type: Number,
        default: 0
    },
    isOnline: {
        type: Boolean,
        default: false
    }
})

module.exports = Relationship = moongoose.model("friend", RelationshipSchema);
