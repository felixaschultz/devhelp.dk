import { authenticator } from "../services/auth.server";
import { useLoaderData, useOutletContext, Form, Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import mongoose from "mongoose";


export const loader = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/"
    });
    const studyGroups = await mongoose.model("Group").find({
        $or: [
            { creator: new mongoose.Types.ObjectId(user?._id) },
            { members: new mongoose.Types.ObjectId(user?._id) }
        ]
    }).select("group_name description");

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
    const [open, setOpen] = useOutletContext();

    return (
        <div className="content">
            <h1>Grupper</h1>
            {
                studyGroups.length === 0 && (
                    <>
                        <p>Du har ikke oprettet nogen grupper endnu.</p>
                        <button onClick={() => {
                            setOpen({
                                open: true,
                                type: "createGroup"
                            });
                        }}>Opret gruppe</button>
                    </>
                )
            }
            <section className="grid">
                {studyGroups.length > 0 && studyGroups?.map(group => (
                    <Link to={`/groups/${group._id}`} className="group" key={group?._id}>
                        <img src="https://via.placeholder.com/150" alt="Group" />
                        <h2>{group?.group_name}</h2>
                        <p>{group?.description}</p>
                    </Link>
                ))}
            </section>
            {
                open.open && open.type === "createGroup" && (
                    <Form className="popup" method="post" encType="multipart/form-data">
                        <section className="popup_container">
                            <button className="close" onClick={() => setOpen(false)}>X</button>
                            <h2>Opret gruppe</h2>
                            <fieldset>
                                <label htmlFor="groupname">Gruppenavn</label>
                                <input type="text" id="groupname" name="groupname" />
                                <label htmlFor="description">Beskrivelse</label>
                                <textarea id="description" name="description"></textarea>
                                <button className="btn" type="submit">Opret</button>
                            </fieldset>
                        </section>
                    </Form>
                )
            }
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