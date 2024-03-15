import { authenticator } from "../services/auth.server";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
    }).populate("creator").populate("members.user").populate("posts.user").populate("posts.comments.user");

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
    const fetcher = useFetcher();
    const textArea = useRef();

    useEffect(() => {
        if(fetcher.state === "submitting"){
            textArea.current.value = "";
        }
    }, [fetcher.state, textArea]);

    return (
        <div className="content">
            <header className="group-info">
                <section>
                    <p className="group-type">Gruppe</p>
                    <h1 className="group-name">{groups.group_name}</h1>
                    <p className="group-member-info">Gruppen har { groups.members.filter(member => member.status === "accepted").length + 1} medlemmer</p>
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
                <fetcher.Form method="post">
                    <fieldset disabled={fetcher.state === "submitting"}>
                        <textarea ref={textArea} className="input-fields" name="postContent" placeholder="Skriv et opslag" />
                        <button className="btn" name="_action" value="post" type="submit">Post</button>
                    </fieldset>
                </fetcher.Form>
            </section>
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
                                    <p>{post.user.name.firstname} {post.user.name.lastname}</p>
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

export const action = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    
    if(!user){
        throw new Response(null, {
            status: 401,
        });
    }

    const body = await request.formData();
    const { _action, postContent } = Object.fromEntries(body);

    if(_action === "post"){
        const post = await mongoose.model("Group").findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(params?.id)
        }, {
            $push: {
                posts: {
                    user: user?._id,
                    body: postContent,
                    date: new Date()
                }
            }
        });

        return post;
    }
};