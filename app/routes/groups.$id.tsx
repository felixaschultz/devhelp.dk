import { authenticator } from "../services/auth.server";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const groups = await mongoose.model("Group").findOne({
        $or: [
            { creator: new mongoose.Types.ObjectId(user?._id) },
            { members: new mongoose.Types.ObjectId(user?._id) }
        ],
        $and: [
            { _id: new mongoose.Types.ObjectId(params?.id)}
        ]
    }).populate("creator").populate("members");

    return { user, groups };
}

export const meta = [
    {
        title: "Group | Devhelp.dk",
        description: "Group"
    }
];

export default function Group() {
    const { user, groups } = useLoaderData();
    return (
        <div className="content">
            <h1>{groups.group_name}</h1>
            <p>{groups.description}</p>
        </div>
    );
}