import { authenticator } from "../services/auth.server";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { useEffect, useRef } from "react";
import mongoose from "mongoose";
import "../styles/Group.css";
import Comments from "~/components/Comments";
export const loader = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
    const groups = await mongoose.model("Group").findOne({_id: new mongoose.Types.ObjectId(params?.id)})
        .populate("creator")
            .populate("members.user")
                .populate("posts.user")
                    .populate("posts.comments")
                        .populate("posts.comments.user")
                            .populate("posts.comments.reply")
                                .populate("posts.comments.reply.user");

    if(groups.creator._id != user?.user?._id){
        if(!groups.members.find(member => member.user == user?.user?._id)){
            return redirect("/groups/" + params?.id + "/about");
        }
    }

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
    const memberStatus = groups.members.find(member => member.user == user?.user?._id)?.status;
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
                    <Link className="tab active" to={`/groups/${groups._id}`}>Home</Link>
                    <Link className="tab" to={`/groups/${groups._id}/about`}>Om</Link>
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
                (groups.creator?._id == user?.user?._id || groups.members.indexOf(user?.user?._id) > -1) && (
                    <>
                        <section>
                            <fetcher.Form method="post">
                                <fieldset disabled={fetcher.state === "submitting"}>
                                    <textarea ref={textArea} className="input-fields" name="postContent" placeholder="Skriv et opslag" />
                                    <button className="btn" name="_action" value="post" type="submit">Post</button>
                                </fieldset>
                            </fetcher.Form>
                        </section>
                        <section className="posts">
                            <h2>Posts</h2>
                            {
                                groups.posts.length === 0 && (
                                    <p>Der er ingen posts i denne gruppe endnu.</p>
                                )
                            }
                            <section className="grid">
                            {
                                groups.posts.map(post => (
                                    <section className="post-group" key={post._id}>
                                        <article className="post">
                                            <p className="user"><img className="profileImg" src={post.user.image} alt="" /> {post.user.name.firstname} {post.user.name.lastname}</p>
                                            <p>{post.body}</p>
                                        </article>
                                        <Comments postId={post._id} post={post} user={user} />
                                    </section>
                                )).sort((a, b) => new Date(b.date) + new Date(a.date))
                            }
                            </section>
                        </section>
                    </>
                )
            }
        </div>
    );
}

export const action = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }
    
    if(!user){
        throw new Response(null, {
            status: 401,
        });
    }

    const formData = await request.formData();
    const { _action, postContent } = Object.fromEntries(formData);

    if(_action === "post"){
        const post = await mongoose.model("Group").findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(params?.id)
        }, {
            $push: {
                posts: {
                    user: user?.user?._id,
                    body: postContent,
                    date: new Date()
                }
            }
        });

        return post;
    }else if(_action === "comment"){
        const { body, postId } = Object.fromEntries(formData);
        const comment = await mongoose.model("Group").findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(params?.id),
            "posts._id": new mongoose.Types.ObjectId(postId)
        }, {
            $push: {
                "posts.$.comments": {
                    user: user?.user?._id,
                    body: body,
                    date: new Date()
                }
            }
        });

        return comment;
    }else if(_action === "like-comment") {
        const groupId = new mongoose.Types.ObjectId(params?.id);
        const postId = new mongoose.Types.ObjectId(formData.get("postId"));
        const commentId = new mongoose.Types.ObjectId(formData.get("commentId"));
        const userId = user?.user?._id;

        // Fetch the group
        const group = await mongoose.model("Group").findById(groupId);

        // Find the post and comment
        const post = group.posts.id(postId);
        const comment = post.comments.id(commentId);

        // Add the like
        comment.likes.push(userId);

        // Save the group
        return await group.save();
    }else if(_action === "unlike-comment") {
        const groupId = new mongoose.Types.ObjectId(params?.id);
        const postId = new mongoose.Types.ObjectId(formData.get("postId"));
        const commentId = new mongoose.Types.ObjectId(formData.get("commentId"));
        const userId = user?.user?._id;

        // Fetch the group
        const group = await mongoose.model("Group").findById(groupId);

        // Find the post and comment
        const post = group.posts.id(postId);
        const comment = post.comments.id(commentId);

        // Add the like
        comment.likes.pull(userId);

        // Save the group
        return await group.save();

    }else if(_action === "reply") {
        const { body, postId, commentId } = Object.fromEntries(formData);

        const reply = await mongoose.model("Group").findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(params?.id),
            "posts._id": new mongoose.Types.ObjectId(postId),
            "posts.comments._id": new mongoose.Types.ObjectId(commentId)
        }, {
            $push: {
                "posts.$.comments.$[comment].reply": {
                    user: user?.user?._id,
                    body: body,
                    date: new Date()
                }
            }
        }, {
            arrayFilters: [
                { "comment._id": new mongoose.Types.ObjectId(commentId) }
            ]
        });

        return reply;
    }else if(_action === "like-reply") {
        const groupId = new mongoose.Types.ObjectId(params?.id);
        const postId = new mongoose.Types.ObjectId(formData.get("postId"));
        const commentId = new mongoose.Types.ObjectId(formData.get("commentId"));
        const replyId = new mongoose.Types.ObjectId(formData.get("replyId"));
        const userId = user?.user?._id;

        // Fetch the group
        const group = await mongoose.model("Group").findById(groupId);

        // Find the post and comment
        const post = group.posts.id(postId);
        const comment = post.comments.id(commentId);
        const reply = comment.reply.id(replyId);

        // Add the like
        reply.likes.push(userId);

        // Save the group
        return await group.save();

        return reply;
    }else if(_action === "unlike-reply") {
        const groupId = new mongoose.Types.ObjectId(params?.id);
        const postId = new mongoose.Types.ObjectId(formData.get("postId"));
        const commentId = new mongoose.Types.ObjectId(formData.get("commentId"));
        const replyId = new mongoose.Types.ObjectId(formData.get("replyId"));
        const userId = user?.user?._id;

        // Fetch the group
        const group = await mongoose.model("Group").findById(groupId);

        // Find the post and comment
        const post = group.posts.id(postId);
        const comment = post.comments.id(commentId);
        const reply = comment.reply.id(replyId);

        // Add the like
        reply.likes.pull(userId);

        // Save the group
        return await group.save();

        return reply;
    }
};