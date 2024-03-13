import { mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    name: {
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        }
    },
    image: String,
    role: {
        type: String,
        default: "user"
    }
});

const questionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
});

const answerSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question"
    }
});

userSchema.pre("save", async function (next) {
    const user = this; // this refers to the user document
  
    // only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) {
      return next(); // continue
    }
  
    const salt = await bcrypt.genSalt(10); // generate a salt
    user.password = await bcrypt.hash(user.password, salt); // hash the password
    next(); // continue
});

export const models = [
    {
        name: "User",
        schema: userSchema,
        collection: "users",
    },
    {
        name: "Question",
        schema: questionSchema,
        collection: "questions",
    },
    {
        name: "Answer",
        schema: answerSchema,
        collection: "answers",
    }
]