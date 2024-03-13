import "./Style.css"
export default function PostCard({post}) {
    return (
        <div className="post-card">
            {post.image && <img src={post.image} alt={post.title} />}
            <h2>{post.title}</h2>
            <p>{post.body}</p>
        </div>
    );
}