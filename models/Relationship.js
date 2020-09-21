const moongoose = require("mongoose");
const Schema = moongoose.Schema;

const RelationshipSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    relationship: {
        type: Number,
        default: 0
    }
})

module.exports = Relationship = moongoose.model("friend", RelationshipSchema);
