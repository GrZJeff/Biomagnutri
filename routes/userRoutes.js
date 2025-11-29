const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendResetCode, verifyResetCode, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Registro y login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Perfil protegido
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    user: req.user
  });
});

// 🔑 Restablecimiento de contraseña
router.post('/send-reset-code', sendResetCode);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;