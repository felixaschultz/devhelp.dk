import { authenticator } from "~/services/auth.server";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose, { set } from "mongoose";
import "../UserProfile.css";
import PostCard from "~/components/PostCard";
import { useEffect, useState } from "react";
import { uploadImage } from "../services/uploadImage";

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request);
    const userId = new mongoose.Types.ObjectId(user?._id || params?.id);

    const published = (!user) ? { user: userId, published: true } :  { user: userId };

    const userData = await mongoose.model("User").findOne({ _id: userId });
    const userPosts = await mongoose.model("BlogPost").find(published);
    const likedPosts = await mongoose.model("BlogPost").find({ likes: userId });

    if(!userData) {
        throw new Error("User not found");
    }

    return { user, userData, userPosts, likedPosts };
}
export const meta = [
    { title: "Me | Devhelp.dk" },
    { name: "description", content: "This is the me page" },
];

export default function Me() {
    const { user, userData, userPosts, likedPosts } = useLoaderData();
    const [openImage, setOpenImage] = useState(false);
    const fetcher = useFetcher();

    useEffect(() => {
        if(userData.image){
            setOpenImage(false);
            user.image = userData.image;
        }
    }, [userData.image]);

    return (
        <div className="profile-grid content">
            <section>
                <div className="profileImage-container">
                    <img className="userProfile" src={userData?.image || "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg"} alt="" />
                    {user?._id === userData?._id && (
                        <button className="editButton" onClick={() => {
                            setOpenImage(true)
                        }}>Edit</button>
                    )}    
                </div>
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
                            <PostCard post={post} user={user} />
                        </Link>
                    ))}
                </section>
                {user?._id === userData?._id && (
                    <>
                        <h2>Liked Posts</h2>
                        <section className="blog-grid">
                            {likedPosts.map((post) => (
                                <Link style={{textDecoration: "none"}} to={`/blog/${post._id}`} key={post._id}>
                                    <PostCard post={post} user={user} />
                                </Link>
                            ))}
                        </section>
                    </>
                )}
            </section>
            {openImage && (
                <div className="popup">
                    <div className="popup_container">
                        <h1>Change profile image</h1>
                        <fetcher.Form method="post" encType="multipart/form-data">
                            <div>
                                <label htmlFor="image">Image</label>
                                <input className="input-fields" type="file" id="image" name="image" />
                            </div>
                            <section className="flex">
                                <button type="submit">Submit</button>
                                <button onClick={() => {
                                    setOpenImage(false);
                                }}>Cancel</button>
                            </section>
                        </fetcher.Form>
                    </div>
                </div>
            )}
        </div>
    );
}

export const action = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    const image = formData.get("image");

    if(image) {
        const newImage = await uploadImage(image);
        const userId = new mongoose.Types.ObjectId(user?._id);
        const updatedUser = await mongoose.model("User").findByIdAndUpdate(userId, { image: newImage });
        return json(updatedUser);
    }
};