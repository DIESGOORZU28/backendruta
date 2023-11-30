const express = require("express");
var cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51O5Gz0FqzLAtNtxMKvc4IiuLwwY8djJrjXVtuFiiI6oF7YNe0mOJPY3nRtHNrM1aVUT6bQth9SvKEfEBvUAwiMPG00FXcslwub"
);

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.post("/checkout", async (req, res) => {
  const items = req.body.items;
  let arrayItems = [];
  items.forEach((item) => {
    arrayItems.push({
      price: item.id,
      quantity: item.quantity,
    });
  });

  const session = await stripe.checkout.sessions.create({
    line_items: arrayItems,
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.send(
    JSON.stringify({
      url: session.url,
    })
  );
});

app.listen(4000, () => {
  console.log("Servidor iniciado en el puerto 4000");
});
