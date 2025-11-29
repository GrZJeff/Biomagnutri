import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email } = req.body;

    // Generar código aleatorio
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Configurar transporte con Gmail (usa contraseña de aplicación en .env)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de restablecimiento de contraseña",
      text: `Tu código de verificación es: ${resetCode}`,
    });

    // Aquí podrías guardar el código en tu base de datos asociado al usuario
    // Ejemplo: await User.updateOne({ email }, { resetCode });

    res.status(200).json({ message: "Código enviado", resetCode });
  } catch (error) {
    console.error("Error en sendResetCode:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}