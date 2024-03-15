import { authenticator } from "../services/auth.server";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { useEffect, useRef } from "react";
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
    }).populate("creator").populate("members.user").populate("posts.user").populate("posts.comments");

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

export default function GroupAbout() {
    const { user, groups } = useLoaderData();
    const memberStatus = groups.members.find(member => member.user == user?._id)?.status;
    groups.members.push({ user: groups.creator, status: "creator"});
    return (
        <div className="content">
            <header className="group-info">
                <section>
                    <p className="group-type">Gruppe</p>
                    <h1 className="group-name">{groups.group_name}</h1>
                    <p className="group-member-info">Gruppen har { groups.members.filter(member => member.status === "accepted").length + 1} medlemmer</p>
                    <Link className="tab" to={`/groups/${groups._id}`}>Home</Link>
                    <Link className="tab active" to={`/groups/${groups._id}/about`}>Om</Link>
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
            <section>
                <h2>Beskrivelse</h2>
                <p>{groups.description}</p>
                <section>
                    <h2>Medlemmer</h2>
                    <ul>
                        {
                            groups.members.map(member => (
                                <li className="member-container" key={member.user._id}>
                                    <Link className="member" to={`/me/${member.user._id}`}>
                                        <img className="member-picture" src={member.user.image} alt={member.user.username} />
                                        <p>{member.user.name.firstname} {member.user.name.lastname}</p>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </section>
            </section>
        </div>
    )

}