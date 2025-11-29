export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email, code } = req.body;

    // Aquí deberías comparar el código con el guardado en tu BD
    // Ejemplo: const user = await User.findOne({ email });
    // if (user.resetCode !== code) return res.status(400).json({ error: "Código inválido" });

    // Simulación: aceptamos cualquier código "123456"
    if (code === "123456") {
      return res.status(200).json({ message: "Código verificado correctamente" });
    } else {
      return res.status(400).json({ error: "Código inválido" });
    }
  } catch (error) {
    console.error("Error en verifyCode:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}