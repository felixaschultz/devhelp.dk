import { Form, useFetcher } from "@remix-run/react";
import "./Style.css";
import { useState } from "react";

export default function Comments({ post, user }) {
    const fetcher = useFetcher();
    const [newReply, setReply] = useState(false);
    
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
                        <>
                            <div className="comment-group">
                                <div key={index} className="comment">
                                    <p>{comment.body}</p>
                                    <section className="comment-reply">
                                        <p className="user"><img src={comment.user.image} alt="" className="comment-profileImage" /> {comment.user.name.firstname}</p>
                                        <button className="reply_btn" onClick={ () => {
                                            setReply(!newReply)
                                        }}>Reply</button>
                                    </section>
                                </div>
                                {
                                    newReply && (
                                        <fetcher.Form method="post">
                                            <div>
                                                <label htmlFor="reply">Reply</label>
                                                <textarea className="input-fields textarea comment" id="reply" name="body" />
                                                <input type="hidden" name="user" value={user._id} />
                                                <input type="hidden" name="commentId" value={comment._id} />
                                            </div>
                                            <section className="flex">
                                                <button name="_action" value="reply" className="post-btn" type="submit">Reply</button>
                                            </section>
                                        </fetcher.Form>
                                    )
                                }
                                {
                                    (comment.reply.length > 0) && (
                                        <div className="replies">
                                            {comment.reply.map((reply, index) => (
                                                <div key={index} className="comment reply">
                                                    <p>{reply.body}</p>
                                                    <p className="user"><img src={comment.user.image} alt="" className="comment-profileImage" /> {comment.user.name.firstname}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        </>
                        
                    )).sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                    })}
            </div>
        </div>
    );
}