import { authenticator } from "../services/auth.server";
import { useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import mongoose from "mongoose";

export const loader = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request);
    const studyGroups = await mongoose.model("Group").find({
        creator: new mongoose.Types.ObjectId(user?._id)
    });
    return { user, studyGroups };
};
export const meta = [
    {
        title: "Groups | Devhelp.dk",
        description: "Groups"
    }
];

export default function Index() {
    const { user, studyGroups } = useLoaderData();

    return (
        <div className="content">
            <h1>Grupper</h1>
            {
                studyGroups.length === 0 && (
                    <>
                        <p>Du har ikke oprettet nogen grupper endnu.</p>
                        <button>Opret gruppe</button>
                    </>
                )
            }
            <section className="grid">
                {studyGroups > 0 && studyGroups.map(group => (
                    <div className="group" key={group._id}>
                        <h2>{group.name}</h2>
                        <p>{group.description}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}

export const action = async ({ request }) => {
    const body = await request.formData();
    const { groupname, description } = Object.fromEntries(body);
    const user = await authenticator.isAuthenticated(request);
    const group = await mongoose.model("Group").create({
        group_name: groupname,
        description,
        creator: new mongoose.Types.ObjectId(user?._id)
    });

    return redirect(`/groups/${group._id}`);
};