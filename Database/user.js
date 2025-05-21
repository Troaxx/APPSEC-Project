const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            reqeuired: true
        },

        role: {
            type: String, 
            enum: ["president", "treasurer", "secretary", "member"]
        },

        password: {
            type: String,
            required: true
        }
    },
    {timestamps: true}
);

//Exporting the member model
module.exports = model("User", UserSchema);