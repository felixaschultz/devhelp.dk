import { authenticator } from "../services/auth.server";
import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import "../styles/Group.css";
export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const groups = await mongoose.model("Group").findOne({
        /* $or: [
            { creator: new mongoose.Types.ObjectId(user?._id) },
            { members: new mongoose.Types.ObjectId(user?._id) }
        ], */
        /* $and: [ */
            /* {  */_id: new mongoose.Types.ObjectId(params?.id)/* } */
        /* ] */
    }).populate("creator").populate("members");

    return { user, groups };
}

export const meta = ({data}) => {

    return [
        {
            title: data?.groups?.group_name + " | Devhelp.dk",
            description: "Group"
        }
    ]
};

export default function Group() {
    const { user, groups } = useLoaderData();
    const memberStatus = groups.members.find(member => member.user == user?._id)?.status;

    return (
        <div className="content">
            <header className="group-info">
                <section>
                    <p className="group-type">Gruppe</p>
                    <h1 className="group-name">{groups.group_name}</h1>
                    <p className="group-member-info">Gruppen har {groups.members.length + 1} medlemmer</p>
                </section>
                <section>
                    {
                        memberStatus === "pending" && (
                            <p>Du har en anmodning om at blive medlem af gruppen</p>
                        )
                    }
                    {
                        memberStatus === "accepted" && (
                            <form method="post">
                                <button type="submit" name="action" value="leave">Forlad gruppen</button>
                            </form>
                        )
                    }
                </section>
            </header>
            {
                (groups.creator?._id == user?._id || groups.members.indexOf(user?._id) > -1) && (
                    <section className="posts">
                        <h2>Posts</h2>
                        {
                            groups.posts.length === 0 && (
                                <p>Der er ingen posts i denne gruppe endnu.</p>
                            )
                        }
                        {
                            groups.posts.map(post => (
                                <article key={post._id}>
                                    <p>{post.user}</p>
                                    <p>{post.body}</p>
                                </article>
                            ))
                        }
                    </section>
                )
            }
        </div>
    );
}