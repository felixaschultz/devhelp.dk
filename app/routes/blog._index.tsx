export const loader = async ({ request }) => {
    return { user: null };
};
export default function Blog() {
    return (
        <div>
        <h1>Blog</h1>
        <p>This is a remix app</p>
        </div>
    );
}