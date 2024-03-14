export const loader({request, params}) => {
    const search = request.url.split("?q=")[1];
    return {search};
}

export default function Search(){
    const {search} = useLoaderData();
    return (
        <div className="content">
            <h1>Search results for {search}</h1>
        </div>
    );
};