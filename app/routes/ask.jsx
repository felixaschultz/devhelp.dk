import { Form, useFetcher } from "@remix-run/react";

export const loader = async ({ params }) => {
    return "";
}

export const meta = [
    {
        title: "Ask a professional | Devhelp.dk",
        description: "Ask a professional"
    }
]

export default function Ask() {
    const fetcher = useFetcher();
    return (
        <div className="content">
            <h1>Ask a professional</h1>
            <fetcher.Form method="post" encType="multipart/form-data">
                <input className="input-fields" type="text" name="title" placeholder="Title" />
                <textarea className="input-fields" name="body" placeholder="Body"></textarea>
                <input type="file" name="image" />
                <button type="submit">Ask</button>
            </fetcher.Form>
        </div>
    );
}

export const action = async ({ request }) => {
    const body = await request.formData();

    console.log(body);
    return new Response("ok");
}