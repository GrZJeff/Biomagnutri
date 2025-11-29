const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configuración de nodemailer (usa tus credenciales reales en .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ---------------- REGISTRO ----------------
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const userExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role ? role.toLowerCase() : 'user'
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// ---------------- LOGIN ----------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    // Login especial para admin fijo
    if (role && role.toLowerCase() === "admin") {
      if (email.trim().toLowerCase() !== "admin@biomagnutri.com" || password !== "123456") {
        return res.status(403).json({ message: "Acceso denegado: solo el administrador autorizado puede ingresar" });
      }

      const token = jwt.sign(
        { id: "admin-fixed-id", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        message: "Inicio de sesión exitoso como administrador",
        user: { id: "admin-fixed-id", name: "Administrador", email: "admin@biomagnutri.com", role: "admin" },
        token
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(400).json({ message: 'Rol incorrecto para este usuario' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// ---------------- RESTABLECER CONTRASEÑA ----------------

// Paso 1: enviar código
exports.sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Correo requerido" });

    console.log("Intentando enviar código a:", email);


    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${code}`
    });

    res.json({ message: "Código enviado a tu correo" });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar código", error: error.message });
  }
};

// Paso 2: verificar código
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user && user.resetCode === code) {
      return res.json({ success: true });
    }
    res.json({ success: false, message: "Código inválido" });
  } catch (error) {
    res.status(500).json({ message: "Error al verificar código", error: error.message });
  }
};

// Paso 3: restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = null; // limpiar código
    await user.save();

    res.json({ message: "Contraseña restablecida con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer contraseña", error: error.message });
  }
};