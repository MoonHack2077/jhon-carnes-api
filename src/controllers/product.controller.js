import Product from '../models/product.model.js';

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const newProduct = new Product({ name, price, description });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
};

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

// Actualizar un producto por ID
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
};

// Eliminar un producto por ID
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};