const express = require("express");
const cors = require("cors");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const dotenv = require("dotenv");
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });

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
  const query = request.body;
  console.log("🚀 ~ :58 ~ query:", query);

  try {
    const data = await notion.databases.query({
      database_id: databaseId,
      filter: query.filter || {},
    });
    response.json({ message: "success1", data: data });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

// API tạo page
app.post("/update-exercise-notion", async function (request, response) {
  const query = request.body;

  const note = (
    query?.properties?.Notes.title[0].plain_text || ""
  ).toLowerCase();
  const listWorkout = note.split("+");
  const requestData = [];
  listWorkout.map((workout) => {
    const informations = workout.trim().split("-");

    let sets = informations.find((item) => item.endsWith("s"));
    sets = sets?.substring(0, sets.length - 1);
    let reps = informations.find((item) => item.endsWith("r"));
    reps = reps?.substring(0, reps.length - 1);
    let weight = informations.find((item) => item.endsWith("k"));
    weight = weight?.substring(0, weight.length - 1);
    let level = informations.find((item) => item.startsWith("m"));
    level = level?.substring(1, level.length);
    for (let index = 0; index < sets; index++) {
      requestData.push({
        parent: {
          database_id: query?.parent?.database_id || "",
        },
        properties: {
          Set: {
            number: index + 1,
          },
          Weight: {
            number: Number(weight),
          },
          Reps: {
            number: Number(reps),
          },
          Exercise: {
            relation: [
              { id: query?.properties?.Exercise.relation[0]?.id || "" },
            ],
          },
          Workout: {
            relation: [
              { id: query?.properties?.Workout.relation[0]?.id || "" },
            ],
          },
          Notes: {
            title: [
              {
                text: {
                  content: level ? `Mức ${level}` : "",
                },
              },
            ],
          },
          Date: {
            date: {
              start: query?.properties?.Date?.rollup?.array[0]?.date?.start,
              end: null,
              time_zone: null,
            },
          },
        },
      });
    }
  });
  const res = [];
  try {
    for (let i = 0; i < requestData.length; i++) {
      const data = await notion.pages.create(requestData[i]);
      res.push(data);
    }
    await notion.pages.update({
      page_id: query?.id,
      archived: true,
    });
    response.json({ message: "success!", data: res });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

// Chạy server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
