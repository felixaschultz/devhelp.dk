import mongoose from "mongoose";
import { authenticator, oauthAuthenticated } from "~/services/auth.server";
import { Form, redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { useState,useRef } from "react";
import { Editor } from '@tinymce/tinymce-react';
import "../styles/BlogWrite.css";
import { uploadImage } from "~/services/uploadImage";

export const meta = [
    { title: "Blog | Devhelp.dk" },
    { name: "description", content: "This is the blog page" }
];

export const loader = async ({ request, params }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/",
    });

    const postId = new mongoose.Types.ObjectId(params?.id);
    const userId = new mongoose.Types.ObjectId(user?.user?._id || user?._id);

    const post = await mongoose.model("BlogPost").findOne({ _id: postId, user: userId });

    return {user, post};
};

export default function BlogEdit() {
    const {user, post} = useLoaderData();
    const fetcher = useFetcher();
    const [ image, setImage ] = useState(post?.image || null);
    const [ tags, setTags ] = useState([...post?.tags]);
    const handleChange = (e) => {
        const body = e;
        const textarea = document.querySelector("textarea[name=body]");
        textarea.value = body;
    }
    const editorRef = useRef(null);

    return (
        <div className="content">
            <h1>Edit a blog post</h1>
            <Form method="post" onSubmit={handelSubmit}>
                <button name="_action" value="delete" className="delete-btn">Delete</button>
                <button name="_action" value={
                    post?.published ? "unpublish" : "publish"
                } className="delete-btn">{
                    post?.published ? "Unpublish" : "Publish"
                }</button>
            </Form>
            <fetcher.Form method="post" encType="multipart/form-data">
                <fieldset disabled={fetcher.state === "submitting"}>
                    {
                        image && (
                            <img src={image} alt="Preview" />
                        )
                    }
                    <div>
                        <label htmlFor="image">
                            <h2>Image</h2>
                        </label>
                        <input className="input-fields" type="file" id="image" name="image" onChange={(e) => {
                            setImage(URL.createObjectURL(e.target.files[0]));
                        }} />
                        <input type="hidden" name="hiddenImage" defaultValue={post?.image || null} />
                    </div>
                    <div>
                        <label htmlFor="title">
                            <h2>Title</h2>
                        </label>
                        <input className="input-fields" type="text" id="title" name="title" defaultValue={post?.title} />
                    </div>
                    <div>
                        <Editor
                            apiKey='3ioqryb6do0jjs1dqe42hr1sf7nkuzwi1ig8qu2wx8xtvxzq'
                            onInit={(evt, editor) => editorRef.current = editor}
                            initialValue={post?.body}
                            init={{
                            height: 500,
                            menubar: true,
                            inline: true,
                            language: 'da',
                            plugins: [
                                'autolink', 'lists', 'link', 'image', 'charmap',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                                'imagetools', 'textpattern', 'autoresize', 'codesample',
                                'save', 'directionality', 'emoticons', 'hr', 'nonbreaking', 'pagebreak',
                                'paste', 'tabfocus', 'textcolor', 'colorpicker',
                                'contextmenu', 'noneditable', 'template', 'toc', 'visualchars',
                                'linkchecker', 'autosave', 'bbcode',
                            ],
                            menu: {
                                file: { title: 'File', items: 'newdocument restoredraft | preview | export print | deleteallconversations' },
                                edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
                                view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
                                insert: { title: 'Insert', items: 'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime' },
                                format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
                                tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
                                table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
                                help: { title: 'Help', items: 'help' }
                            },
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'emoticons | template | contextmenu |' +
                                'link image | codesample |',
                            toolbar2: 'fontselect fontsizeselect formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | codesample | removeformat',
                            image_advtab: true,
                            toolbar_float: false,
                            toolbar_sticky: true,
                                /* enable title field in the Image dialog*/
                            image_title: true,
                            /* enable automatic uploads of images represented by blob or data URIs*/
                            automatic_uploads: true,
                            /*
                                URL of our upload handler (for more details check: https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_url)
                                images_upload_url: 'postAcceptor.php',
                                here we add custom filepicker only to Image dialog
                            */
                            file_picker_types: 'image',
                            images_reuse_filename: true,
                            images_upload_handler: function (blobInfo, success, failure, progress) {
                                const xhr = new XMLHttpRequest();
                                xhr.withCredentials = false;
                                xhr.open('POST', `https://firebasestorage.googleapis.com/v0/b/devhelp-3e125.appspot.com/o/${blobInfo.filename()}`);
                                xhr.upload.onprogress = function (e) {
                                    progress(e.loaded / e.total * 100);
                                };
                                xhr.onload = function () {
                                    const json = JSON.parse(xhr.responseText);
                                    console.log(json);
                                    if (!json) {
                                        console.log("No JSON");
                                        /* failure('Invalid JSON: ' + xhr.responseText); */
                                        return;
                                    }
                                    success("https://firebasestorage.googleapis.com/v0/b/devhelp-3e125.appspot.com/o/" + json.name);
                                };
                                const formData = new FormData();
                                formData.append('file', blobInfo.blob(), blobInfo.filename());
                                xhr.send(formData);
                            },
                            /* and here's our custom image picker*/
                            file_picker_callback: (cb, value, meta) => {
                                const input = document.createElement('input');
                                input.setAttribute('type', 'file');
                                input.setAttribute('accept', 'image/*');

                                input.addEventListener('change', (e) => {
                                const file = e.target.files[0];

                                const reader = new FileReader();
                                reader.addEventListener('load', () => {
                                    /*
                                    Note: Now we need to register the blob in TinyMCEs image blob
                                    registry. In the next release this part hopefully won't be
                                    necessary, as we are looking to handle it internally.
                                    */
                                    const id = 'blobid' + (new Date()).getTime();
                                    const blobCache =  tinymce.activeEditor.editorUpload.blobCache;
                                    const base64 = reader.result.split(',')[1];
                                    const blobInfo = blobCache.create(id, file, base64);
                                    blobCache.add(blobInfo);

                                    /* call the callback and populate the Title field with the file name */
                                    cb(blobInfo.blobUri(), { title: file.name });
                                });
                                reader.readAsDataURL(file);
                                });

                                input.click();
                            },
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                            }}
                            onEditorChange={handleChange}
                        />
                        <textarea style={{
                            display: "none"
                        }} name="body" defaultValue={editorRef?.current?.getContent()}>
                            {editorRef.current?.getContent()}
                        </textarea>
                    </div>
                    <section className="tags">
                        <label htmlFor="tags">
                            <h2>Tags</h2>
                        </label>
                        <section className="tag-container">
                            {
                                tags && tags?.map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag}
                                        <button type="button" onClick={(e) => {
                                            e.preventDefault();
                                            setTags(tags.filter((t, i) => i !== index));
                                        }}>
                                            X
                                        </button>
                                    </span>
                                )).reverse()
                            }
                            <input className="input-fields" type="text" id="tags" placeholder="add a tag" onChange={(e) => {
                                if(e.target.value.indexOf(",") !== -1){
                                    if(e.target.value.split(",")[0].trim() !== ""){
                                        setTags([e.target.value.split(","), ...tags]);
                                        e.target.value = "";
                                    }
                                }
                            }} name="tags" />
                        </section>
                        <input type="hidden" name="tags" value={
                            tags
                        } />
                        <p>Separate tags with a comma</p>
                    </section>
                    <section className="flex">
                        <button className="post-btn" type="submit">Save</button>
                    </section>
                </fieldset>
            </fetcher.Form>
        </div>
    );
}

export const action = async ({ request, params }) => {
    let user = await authenticator.isAuthenticated(request);
    if(!user){
        user = await oauthAuthenticated(request);
    }

    if(!user){
        throw new Response(null, {
            status: 401,
            statusText: "Unauthorized",
        });
    }

    const postId = new mongoose.Types.ObjectId(params?.id);

    const formData = await request.formData();
    const post = Object.fromEntries(formData);
    const { _action, hiddenImage } = post;

    if(_action === "delete") {
        const deletedPost = await mongoose.models.BlogPost.findByIdAndDelete(postId);
        if(deletedPost) {
            return redirect("/me/" + user._id);
        }
    }else if(_action === "publish") {
        const publishedPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, { published: true });
        if(publishedPost) {
            return redirect("/blog/" + publishedPost._id);
        }
    }else if(_action === "unpublish") {
        const publishedPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, { published: false });
        if(publishedPost) {
            return redirect("/me/" + user._id);
        }
    }

    const image = post.image;
    let newImage = null;

    if(hiddenImage && image.size > 0) {
        if (image && image._name) {
            newImage = await uploadImage(image);
            if(!image){
                return new Response(null, {
                    status: 400,
                    statusText: "Image is required",
                });
            }
        }
    }else {
        newImage = hiddenImage;
    }
    post.image = newImage;
    post.tags = [...new Set(post.tags.split(",").map(tag => tag.trim()).filter(str => str !== ""))];

    const newPost = await mongoose.models.BlogPost.findByIdAndUpdate(postId, post);

    if(newPost) {
        return newPost
    }

}

function handelSubmit(e) {
    const value = e.nativeEvent.submitter.value;
    if(value === "delete" && !confirm(`Are you sure, you want to delete this event?`)){
        e.preventDefault();
    }else if(value === "publish" && !confirm(`Are you sure, you want to make this event ${e.nativeEvent.submitter.innerText.indexOf("Publish") > -1 ? "public" : "private"}?`)){
        e.preventDefault();
    }
}