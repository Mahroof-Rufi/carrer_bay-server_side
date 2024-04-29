import { Schema, model } from "mongoose";
import user from "../../domain/user";

const userSchema: Schema<user> = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    }
})

const userModel = model<user>('user', userSchema);

export default userModel