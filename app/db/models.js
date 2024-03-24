import { mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Please enter an email address."],
        //lowercase: true,
        match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
        ],
        validate: {
            validator: async function (email) {
                const user = await this.constructor.findOne({ email });
                if (user) {
                if (this.id === user.id) {
                    return true;
                }
                return false;
                }
                return true;
            },
            message: (props) => "The specified email address is already in use.",
        },
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
    },
    public: {
        type: Boolean,
        default: false
    },
    settings: {
        account: {
            type: String,
            enum: ["personal", "business"],
            default: "personal"
        },
        notifications: [
            {
                
                receiving: {
                    type: String,
                    enum: ["email", "push"],
                    default: "email",
                },
                notification_type: {
                    type: String,
                    enum: ["new_post", "new_comment", "new_answer", "new_group", "new_member", "new_message", "new_request", "new_connection", "new_like", "new_follow", "new_tag", "new_mention", "questions_to_me", "new_answer"],
                    default: "questions_to_me"
                },
                enabled: {
                    type: Boolean,
                    enum: [true, false],
                    default: true
                }
            }
        ],
        security: {
            passkeys: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    publicKey: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
        ,
        privacy: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },
    },
    skills: [
        {
            name: {
                type: String,
            },
            level: {
                type: String,
            },
            experience: {
                type: String,
            }
        }
    ]
});

const lookedAtLast = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: [
        {
            type: Schema.Types.ObjectId,
            ref: "BlogPost"
        }
    ],
    tags: [
        {
            type: String
        }
    ],
    question: [
        {
            type: Schema.Types.ObjectId,
            ref: "Question"
        }
    ],
});

const StudyGroups = new Schema({
    group_name: {
        type: String,
        required: true
    },
    banner: {
        type: String,
        default: "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/1.jpg"
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            status: {
                type: String,
                default: "pending",
                enum: ["pending", "accepted", "rejected"]
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    description: {
        type: String,
        required: true
    },
    posts: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            body: {
                type: String,
                required: true
            },
            status: {
                type: String,
                default: "accepted",
                enum: ["pending", "accepted", "rejected"]
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
            date: {
                type: Date,
                default: Date.now
            }
        }
    
    ]
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
    views: {
        type: Number,
        default: 0
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
    public: {
        type: Boolean,
        default: false
    },
    files: [
        {
            type: String
        }
    ],
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
    ],
    timestamp: {
        type: Date,
        default: Date.now
    }
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
    },
    {
        name: "Group",
        schema: StudyGroups,
        collection: "groups",
    },
    {
        name: "LookedAtLast",
        schema: lookedAtLast,
        collection: "lookedatlast",
    }
]