import { authenticator } from "~/services/auth.server";
import { useLoaderData, Link } from "@remix-run/react";
import mongoose from "mongoose";
import "../UserProfile.css";
import PostCard from "~/components/PostCard";

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const userId = new mongoose.Types.ObjectId(user?.id || params?.id);

    const published = (!user) ? { user: userId, published: true } :  { user: userId };

    const userData = await mongoose.model("User").findOne({ _id: userId });
    const userPosts = await mongoose.model("BlogPost").find(published);
    
    console.log(userData);

    if(!userData) {
        throw new Error("User not found");
    }

    return { user, userData, userPosts };
}
export const meta = [
    { title: "Me | Devhelp.dk" },
    { name: "description", content: "This is the me page" },
];

export default function Me() {
    const { user, userData, userPosts } = useLoaderData();
    return (
        <div className="profile-grid content">
            <section>
                <img className="userProfile" src={userData?.image || "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg"} alt="" />
                <h1>{userData?.name.firstname} {userData?.name.lastname}</h1>
                {
                    (user?._id === userData?._id) && (
                        <>
                            <Link to={`/me/${userData?.id}/edit`}>Edit</Link>
                            <Link to={`/blog/write`}>Write a new Blog post</Link>
                        </>
                    )
                }
            </section>
            <section>
                <h2>Blog posts</h2>
                <section className="blog-grid">
                    {userPosts.map((post) => (
                        <Link style={{textDecoration: "none"}} to={`/blog/${post._id}`} key={post._id}>
                            <PostCard post={post} />
                        </Link>
                    ))}
                </section>
            </section>
        </div>
    );
}