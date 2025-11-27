const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Producto creado con éxito', product });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};