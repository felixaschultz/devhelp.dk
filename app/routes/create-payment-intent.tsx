import {useStripe} from '@stripe/react-stripe-js';

export const action = async ({ request, params }) => {
    const { amount, currency } = await request.json();

    console.log("amount", amount);
    console.log("currency", currency);

    return null;
};