import Purchase from '../models/purchase.model.js';

// Crear una nueva compra/gasto
export const createPurchase = async (req, res) => {
  try {
    const newPurchase = new Purchase({
      ...req.body,
      createdBy: req.user.id // Asignamos el ID del admin que la crea
    });
    await newPurchase.save();
    res.status(201).json(newPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la compra', error });
  }
};

// Obtener todas las compras
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('createdBy', 'firstName lastName');
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las compras', error });
  }
};

// Actualizar una compra
export const updatePurchase = async (req, res) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPurchase) return res.status(404).json({ message: 'Compra no encontrada' });
    res.status(200).json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la compra', error });
  }
};