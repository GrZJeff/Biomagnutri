const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const Stripe = require('stripe'); // 👈 nuevo

dotenv.config();
console.log("JWT_SECRET cargado:", process.env.JWT_SECRET);

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Stripe con tu clave secreta
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

// ✅ Nueva ruta de pago con tarjeta
app.post('/api/pay', async (req, res) => {
  try {
    const { amount, currency, paymentMethodId } = req.body;

    // Crear un PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // en centavos, ej. 1000 = $10.00
      currency,
      payment_method: paymentMethodId,
      confirm: true
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error("Error en pago:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));