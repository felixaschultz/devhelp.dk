import "./Style.css";
import { Link } from "@remix-run/react";

export default function PostCard({post, user}) {
    return (
        <div className="post-card">
            {post.published ? null : <p style={{color: "red", marginTop: 0}}>Draft</p>}
            {post.image && <img src={post.image} alt={post.title} />}
            <h2>{post.title}</h2>
            <p>{post.body}</p>
            {
                (post.user == user?._id) ? (
                    <Link style={{color: "red", padding: "15px"}} to={`/blog/edit/${post?._id}`}>Edit</Link>
                ) : null
            }
        </div>
    );
}