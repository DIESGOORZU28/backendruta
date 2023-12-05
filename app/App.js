const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');
const controllers = require('./controllers');
const verifyToken = require('./middlewares/verifyToken');
const stripe = require('stripe')('sk_test_51O5Gz0FqzLAtNtxMKvc4IiuLwwY8djJrjXVtuFiiI6oF7YNe0mOJPY3nRtHNrM1aVUT6bQth9SvKEfEBvUAwiMPG00FXcslwub'); // Reemplaza con tu clave secreta de Stripe

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://la-ruta-magica-del-cafe.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas para el primer servidor
app.get('/user', verifyToken, controllers.getUserById);
app.post('/register', controllers.register);
app.post('/login', controllers.login);

// Rutas y configuración para el segundo servidor (Stripe)
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
    // Lógica específica de Stripe para crear una sesión de checkout
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



// Conexión a la base de datos para el primer servidor
connectToDatabase();

// Inicio del servidor en el puerto 5000
const PORT1 = process.env.PORT || 5000;
app.listen(PORT1, () => {
  console.log(`Primer servidor funcionando en el puerto ${PORT1}`);
});

// Inicio del segundo servidor en el puerto 4000
const PORT2 = process.env.PORT_STRIPE || 4000;
app.listen(PORT2, () => {
  console.log(`Segundo servidor iniciado en el puerto ${PORT2}`);
});

module.exports = app;
