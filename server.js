const express = require("express");
const cors = require("cors");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")('sk_test_51QdA3qD5GjALdetb4ZZXb4STlsd9adOIlVUHqH6ya0c4F0d0SuJeaaOilobA0hTQgGLCtl1800mTSMiPfwwwcrFL00i3QFemAA');
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API tạo Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: req.body.productName,
                        },
                        unit_amount: req.body.price * 100, // Giá sản phẩm (cents)
                    },
                    quantity: req.body.quantity,
                },
            ],
            mode: "payment",
            success_url: `${req.headers.origin}/success`,
            cancel_url: `${req.headers.origin}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chạy server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
