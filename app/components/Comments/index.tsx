import { Form, useFetcher } from "@remix-run/react";
import "./Style.css";

export default function Comments({ post, user }) {
    const fetcher = useFetcher();
    
    return (
        <div className="commentSection">
            <fetcher.Form method="post">
                <div>
                    <label htmlFor="comment">Comment</label>
                    <textarea className="input-fields textarea comment" id="comment" name="body" />
                    <input type="hidden" name="user" value={user._id} />
                </div>
                <section className="flex">
                    <button name="_action" value="comment" className="post-btn" type="submit">Comment</button>
                </section>
            </fetcher.Form>
            <div className="comments">
                <h2>Comments</h2>
                {post?.comments?.length === 0 ? <p>No comments yet</p> : post?.comments?.map((comment, index) => (
                    <div key={index} className="comment">
                        <p>{comment.body}</p>
                        <p>{comment.user}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}