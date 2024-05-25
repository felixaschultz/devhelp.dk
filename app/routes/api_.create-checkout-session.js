import { createCheckoutSession } from '../services/stripe.server';

export const action = async (req, res) => {
    const session = await createCheckoutSession();

    return session;
}