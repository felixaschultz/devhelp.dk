import Stripe from 'stripe';

export async function createCheckoutSession(req, res) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const YOUR_DOMAIN = 'http://localhost:3000';
    const session = stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'T-shirt',
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    return session;
}
