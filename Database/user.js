const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        role: {
            type: String, 
            enum: ["president", "treasurer", "secretary", "member"]
        },

        password: {
            type: String,
            required: true
        },

        // 2FA fields
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        verificationCode: {
            code: String,
            expiresAt: Date,
            resendCount: { type: Number, default: 0 },
            lastResendTime: { type: Date }
        },

        // Account lockout fields
        loginAttempts: {
            count: { type: Number, default: 0 },
            lastAttempt: { type: Date },
            lockedUntil: { type: Date }
        },

        // Password policy fields
        passwordChangedAt: {
            type: Date,
            default: Date.now
        },
        passwordHistory: [{
            password: String,
            changedAt: Date
        }],
        
        // Password reset fields
        passwordResetToken: String,
        passwordResetExpires: Date
    },
    {timestamps: true}
);

//Exporting the member model
module.exports = model("User", UserSchema);