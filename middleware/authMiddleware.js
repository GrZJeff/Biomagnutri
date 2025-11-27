const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Token decodificado:", decoded);

      if (decoded.id === "admin-fixed-id" && decoded.role === "admin") {
        console.log("Admin hardcodeado detectado");
        req.user = { id: "admin-fixed-id", role: "admin", name: "Administrador" };
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado o token inválido' });
      }

      next();
    } catch (error) {
      console.error("Error al verificar token:", error.message);
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, token no encontrado' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }
};

module.exports = { protect, adminOnly };