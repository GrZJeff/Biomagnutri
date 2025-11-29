import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email, newPassword } = req.body;

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar en BD
    // Ejemplo: await User.updateOne({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Contraseña restablecida correctamente" });
  } catch (error) {
    console.error("Error en newPassword:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}