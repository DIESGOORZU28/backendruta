const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');

const controllers = require('./controllers');
const verifyToken = require('./middlewares/verifyToken');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/user', verifyToken, controllers.getUserById);
app.post('/register', controllers.register);
app.post('/login', controllers.login);


connectToDatabase();

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`SERVER FUNCIONANDO EN EL PUERTO ${PORT}`);
});

module.exports = app;
