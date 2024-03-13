import { useLoaderData } from "@remix-run/react";
export const loader = async ({ request, params }) => {
    const postId = params.id;
    const post = "";

    return { post };
};

export default function BlogEntry() {
    const {post} = useLoaderData();
    return (
        <div>
            <h1>Blog Entry</h1>
            <p>This is a remix app</p>
        </div>
    );
}