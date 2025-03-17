const express = require("express");
const cors = require("cors");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const dotenv = require("dotenv");
const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API tạo Stripe Checkout Session
// app.post("/create-checkout-session", async (req, res) => {
//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             // line_items: [
//             //     {
//             //         price_data: {
//             //             currency: "usd",
//             //             product_data: {
//             //                 name: req.body.productName,
//             //             },
//             //             unit_amount: req.body.price * 100, // Giá sản phẩm (cents)
//             //         },
//             //         quantity: req.body.quantity,
//             //     },
//             // ],
//             mode: "subscription",
//             line_items: [
//                 {
//                     price: "price_1QesqSD5GjALdetbBOBw3LaD",
//                     quantity: 1,
//                 },
//             ],
//             client_reference_id: req.body?.affiliateId || "",
//             // allow_promotion_codes: req.body?.affiliateId ? false : true,
//             allow_promotion_codes: true,
//             success_url: `${req.headers.origin}/success`,
//             cancel_url: `${req.headers.origin}/cancel`,
//         });

//         res.json({ url: session.url });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Query database
app.post("/databases/:databaseId", async function (request, response) {
    const databaseId = request.params.databaseId;
    const query = request.body

    try {
        const data = await notion.databases.query({
            database_id: databaseId,
            query: query
        })
        response.json({ message: "success!", data: data })
    } catch (error) {
        response.json({ message: "error", error })
    }
})

// API tạo page
app.post("/page", async function (request, response) {
    const query = request.body
    console.log("🚀 ~ query:", query)

    try {
        const data = await notion.pages.create(query)
        response.json({ message: "success!", data: data })
    } catch (error) {
        response.json({ message: "error", error })
    }
})

// Chạy server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
