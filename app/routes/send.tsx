import { json } from '@remix-run/node';
import { Resend } from 'resend';
import { useLoaderData } from '@remix-run/react';

const resend = new Resend(process.env.RESENDGRID_API_KEY);

export const loader = async ({request}) => {
    /* Get client email from cookie */
    const clientEmail = request.headers.get('Cookie').split('email=')[1].split(';')[0];
    const { data, error } = await resend.emails.send({
        from: 'DEVHELP <info@devhelp.dk>',
        to: clientEmail,
        subject: 'Hello world',
        html: '<strong>It works!</strong>',
    });

  if (error) {
    return json({ error }, 400);
  }
    return json({ data , error});
};

export default function Send() {
    const { data, error } = useLoaderData();
    return (
        <div className='content'>
            <h1>Send Email</h1>
            {error && <p>Error: {error.message}</p>}
            {data && <p>Email sent</p>}
        </div>
    );
}
