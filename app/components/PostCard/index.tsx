import "./Style.css";
import { Link } from "@remix-run/react";

export default function PostCard({post, user}) {
    console.log(post, user);
    return (
        <div className="post-card">
            {(user?.user?._id == post.user || user?._id == post.user && post?.popularityScore) ? <p>Popularity Score: {post?.popularityScore}</p> : null}
            {post?.published || post?.public ? null : <p style={{color: "red", marginTop: 0}}>Draft</p>}
            {post.image && <img onLoadStart={(e) => {
                e.target.style.display = "none";
            }} loading="lazy" src={post.image} alt={post.title} />}
            <h2>{post.title}</h2>
            <div className="post-card-content" dangerouslySetInnerHTML={{
                            __html: post.body,
                        }}></div>
            {
                (post.user == user?.user?._id || user?._id == post.user) ? (
                    <>
                        <p>Views: {post?.views}</p>
                        <Link style={{color: "red", padding: "15px"}} to={`/blog/edit/${post?._id}`}>Edit</Link>
                    </>
                ) : null
            }
        </div>
    );
}