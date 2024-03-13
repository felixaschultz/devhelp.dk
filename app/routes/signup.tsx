export const loader = async ({ request }) => {

  return "";
}

export default function Signup() {
  return (
    <div>
      <h1>Signup</h1>
    </div>
  );
}

export const action = async ({ request }) => {
    const formData = request.formData();
    const data = Object.fromEntries(formData);
    
    return "";
};