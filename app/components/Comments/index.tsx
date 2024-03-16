import { Form, useFetcher } from "@remix-run/react";
import "./Style.css";
import { useEffect, useState } from "react";
import like from "../../assets/like-icon.svg";
import likeFillOut from "../../assets/like-icon-fillout.svg";

export default function Comments({ postId, post, user }) {
    const fetcher = useFetcher();
    const [newReply, setReply] = useState(false);
    const [activeReply, setActiveReply] = useState({
        _id: null,
        user: null
    });

    useEffect(() => {
        const textarea = document.querySelectorAll('.textarea');
        textarea.forEach(textarea => {
            textarea.addEventListener('input', function(){
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });
    }, [])

    return (
        <div className="commentSection">
            <fetcher.Form method="post">
                <fieldset disabled={!user}>
                    <div>
                        <label htmlFor="comment">Comment</label>
                        <textarea className="input-fields textarea comment" id="comment" name="body" placeholder="Write your comment" />
                        {
                            (postId) && (
                                <input type="hidden" name="postId" value={postId} />
                            )
                        }
                        <input type="hidden" name="user" value={user?._id} />
                    </div>
                    { user ? <>
                        <section className="flex">
                            <button name="_action" value="comment" className="post-btn" type="submit">Comment</button>
                        </section>
                    </> : <p>You need to be logged in to comment</p>}
                </fieldset>
            </fetcher.Form>
            <div className="comments">
                <h2>Comments ({(post?.comments?.length > 0) ? post?.comments?.length : "0"})</h2>
                    {post?.comments?.length === 0 ? <p>No comments yet</p> : post?.comments?.filter((comment) => {
                        return comment.body !== undefined;
                    })?.map((comment, index) => (
                        <>
                            <div key={index} className="comment-group">
                                <div className="comment">
                                    <p>{comment?.body}</p>
                                    <section className="comment-reply">
                                        <p className="user">
                                            <img src={comment?.user?.image} alt="" className="comment-profileImage" /> {comment?.user?.name?.firstname}
                                            <span className="dateTime">{Intl.DateTimeFormat("da-DK", {
                                                year: "numeric",
                                                month: "long",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            }).format(new Date(comment?.date))}</span>
                                            <fetcher.Form method="post">
                                                {
                                                    comment?.likes?.includes(user?._id) ? (
                                                        <button disabled={!user} className="like dislike" name="_action" value="unlike-comment"><img src={likeFillOut} className="likeIcon" alt="" /> {comment?.likes?.length}</button>
                                                    ) : (
                                                        <button disabled={!user} className="like" name="_action" value="like-comment"><img src={like} className="likeIcon" alt="" /> {comment?.likes?.length}</button>
                                                    )
                                                }
                                                {
                                                    (postId) && (
                                                        <input type="hidden" name="postId" value={postId} />
                                                    )
                                                }
                                                <input type="hidden" name="commentId" value={comment?._id} />
                                            </fetcher.Form>
                                        </p>
                                        { user && (
                                            <button className="reply_btn" onClick={ () => {
                                                setReply(!newReply),
                                                setActiveReply({
                                                    _id: comment?._id,
                                                    user: comment?.user?.name?.firstname
                                                })
                                            }}>Reply</button>
                                        )}
                                    </section>
                                </div>
                                {
                                    (comment.reply.length > 0) && (
                                        <div className="replies">
                                            {comment.reply?.filter((comment) => {
                                                return comment.body != undefined;
                                            }).map((reply, index) => (
                                                <div key={index} className="comment reply">
                                                    <p>{reply.body}</p>
                                                    <p className="user">
                                                        <img src={comment.user.image} alt="" className="comment-profileImage" /> {comment.user.name.firstname}
                                                        <span className="dateTime">{Intl.DateTimeFormat("da-DK", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        }).format(new Date(reply.date))}</span>
                                                        <fetcher.Form method="post">
                                                            {
                                                                reply?.likes?.includes(user?._id) ? (
                                                                    <button disabled={!user} className="like dislike" name="_action" value="unlike-reply"><img src={likeFillOut} className="likeIcon" alt="" /> {reply?.likes?.length}</button>
                                                                ) : (
                                                                    <button disabled={!user} className="like" name="_action" value="like-reply"><img src={like} className="likeIcon" alt="" /> {reply?.likes?.length}</button>
                                                                )
                                                            }
                                                            <input type="hidden" name="commentId" value={comment._id} />
                                                            <input type="hidden" name="replyId" value={reply._id} />
                                                            {
                                                                (postId) && (
                                                                    <input type="hidden" name="postId" value={postId} />
                                                                )
                                                            }
                                                        </fetcher.Form>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                                {
                                    user && newReply && activeReply?._id === comment?._id && (
                                        <fetcher.Form method="post">
                                            <fieldset className="replyComment" disabled={!user}>
                                                <div>
                                                    <label htmlFor="reply">Reply</label>
                                                    <textarea className="input-fields textarea comment" id="reply" name="body" placeholder={"Write your reply to " + activeReply.user} />
                                                    <input type="hidden" name="user" value={user?._id} />
                                                    <input type="hidden" name="commentId" value={comment?._id} />
                                                    {
                                                        (postId) && (
                                                            <input type="hidden" name="postId" value={postId} />
                                                        )
                                                    }
                                                </div>
                                                <section className="flex">
                                                    <button name="_action" value="reply" className="post-btn" type="submit">Reply</button>
                                                </section>
                                            </fieldset>
                                        </fetcher.Form>
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