import { mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
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
    image: {
        type: String,
        default: "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg"
    },
    role: {
        type: String,
        default: "user"
    }
});

const blogPostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    comments: [
        {
            body: {
                type: String,
                required: true
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            date: {
                type: Date,
                default: Date.now
            },
            likes: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                }
            ],
            reply: [
                {
                    body: {
                        type: String,
                        required: true
                    },
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: "User"
                    },
                    likes: [
                        {
                            type: Schema.Types.ObjectId,
                            ref: "User"
                        }
                    ],
                    date: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ],
    tags: [
        {
            type: String
        }
    ],
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    published: {
        type: Boolean,
        default: false
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
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    comments: [
        {
            body: {
                type: String,
                required: true
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ]
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
    },
    {
        name: "BlogPost",
        schema: blogPostSchema,
        collection: "blogposts",
    }
]