import { authenticator } from "~/services/auth.server";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import mongoose from "mongoose";
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
    const [openRequest, setOpenRequest] = useState(false);
    const [newSkills, setNewSkills] = useState([]);
    const fetcher = useFetcher();

    useEffect(() => {
        if(userData.image){
            setOpenImage(false);
        }
    }, [userData.image]);

    return (
        <div className="profile-grid content">
            <section className="userInfos">
                <div className="profileImage-container">
                    <img className="userProfile" src={userData?.image || "https://scontent-uc-d2c-7.intastellaraccounts.com/a/s/ul/p/avtr46-img/felix.schultz@intastellar.com/profile/i3ek74fxmlnpeeazw6wadfk6lhxealofk7z6391v8a60reol0uyf4w7vic9jab2xjzmix1d3otvrsj2bv6i604id2j5j0v9nm0vlb9qv3wfb26tvw4otd0n8q49ugm4e3ew4rikm7di8qco0w33kz03nmz0r45g0bos12sbk2vra7vdmw8ewpkydo97y8f1ycr4i82eu.jpg"} alt="" />
                    {user?._id === userData?._id && (
                        <button className="editButton" onClick={() => {
                            setOpenImage(true)
                        }}>Edit</button>
                    )}    
                </div>
                <h1>{userData?.name.firstname} {userData?.name.lastname}</h1>
                {userData?.role === "pro" && <Link to={`/me/${user?._id}/questions/ask`}>Ask a question</Link>}
                {
                    (user?._id === userData?._id) && (
                        <div className="menu">
                            <Link to={`/blog/write`}>Write a new Blog post</Link>
                            {
                                userData?.role !== "pro" && (
                                    <button onClick={() => {
                                        setOpenRequest(true);
                                    }}>Request Pro Status</button>
                                )
                            }
                            {userData?.role === "pro" && (
                            <Link to={`questions`}>Questions to me</Link>
                            )}
                        </div>
                    )
                }
            </section>
            <section className="userContent">
                <h2>{userData.name.firstname}´s top 3 popular blog posts</h2>
                <section className="blog-grid --popular">
                    {userPosts.map(post => ({
                    ...post,
                    popularityScore: post.likes.length + post.comments.length + post.comments.filter(comment => comment.reply).length
                    }))
                    .sort((a, b) => b.popularityScore - a.popularityScore || new Date(b.date) - new Date(a.date))
                    .map((post) => (
                        <Link style={{textDecoration: "none"}} to={`/blog/${post._id}`} key={post._id}>
                            <PostCard post={post} user={user} />
                        </Link>
                    )).slice(0, 3)}
                </section>
                <h2>All Blog posts</h2>
                <section className="blog-grid">
                    {userPosts?.map((post) => (
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
            {
                openRequest && (
                    <div className="popup">
                        <div className="popup_container">
                            <button className="close" onClick={() => setOpenRequest(false)}>X</button>
                            <h1>Add skills</h1>
                            <fetcher.Form method="post">
                                <div>
                                    <input className="input-fields" type="text" name="skills" id="skills" placeholder="Skills" />
                                    <button onClick={(e) => {
                                        e.preventDefault();
                                        setNewSkills([...newSkills, document.getElementById("skills").value]);
                                        document.getElementById("skills").value = "";
                                    }}>Add</button>
                                    {
                                        newSkills.map((skill, index) => (
                                            <p key={index}>{skill} <button onClick={(e) => {
                                                e.preventDefault();
                                                setNewSkills(newSkills.filter((_, i) => i !== index));

                                            }}>Remove</button></p>
                                        ))
                                    }
                                    <input type="hidden" name="skills" value={newSkills} />
                                </div>
                                <section className="flex">
                                    <button type="submit">Submit</button>
                                    <button onClick={() => {
                                        setOpenRequest(false);
                                    }}>Cancel</button>
                                </section>
                            </fetcher.Form>
                        </div>
                    </div>
                )
            }
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