const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');
const controllers = require('./controllers');
const verifyToken = require('./middlewares/verifyToken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://la-ruta-magica-del-cafe.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas del servidor
app.get('/user', verifyToken, controllers.getUserById);
app.post('/register', controllers.register);
app.post('/login', controllers.login);

// Conexión a la base de datos
connectToDatabase();

// Inicio del servidor para la base de datos en el puerto 5000
const PORT1 = process.env.PORT || 5000;
app.listen(PORT1, () => {
  console.log(`Servidor para la base de datos funcionando en el puerto ${PORT1}`);
});

// Rutas y configuración para el servidor de Stripe
app.use(express.static("public"));
app.post("/checkout", async (req, res) => {
  const items = req.body.items;
  let arrayItems = [];
  items.forEach((item) => {
    arrayItems.push({
      price: item.id,
      quantity: item.quantity,
    });
  });

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: arrayItems,
      mode: "payment",
      success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/success",
      cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cancel",
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error al crear la sesión de Stripe:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Inicio del servidor para Stripe en el puerto 4000
const PORT2 = process.env.PORT_STRIPE || 4001;
app.listen(PORT2, () => {
  console.log(`Servidor para Stripe iniciado en el puerto ${PORT2}`);
});

module.exports = app;
