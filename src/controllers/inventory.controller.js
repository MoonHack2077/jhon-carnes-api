import Inventory from '../models/inventory.model.js';
import Purchase from '../models/purchase.model.js';

// Crear un nuevo registro de inventario
export const createInventory = async (req, res) => {
  // El frontend podría enviar los gastos en un campo aparte para procesarlos aquí
  const { expenses, ...inventoryData } = req.body;

  try {
    // 1. Crear el documento principal de inventario
    const newInventory = new Inventory({
      ...inventoryData,
      'meta.createdBy': req.user.id
    });
    await newInventory.save();

    // 2. Lógica especial: si se enviaron gastos, crearlos como documentos de 'Purchase'
    if (expenses && expenses.length > 0) {
      const purchasePromises = expenses.map(expense => {
        const purchaseDoc = new Purchase({
          date: newInventory.date,
          supplier: expense.category || 'Gasto diario',
          items: [{ name: expense.description, unitPrice: expense.amount, quantity: 1 }],
          total: expense.amount,
          fromInventory: true, // Marcamos que viene de un registro de inventario
          createdBy: req.user.id,
        });
        return purchaseDoc.save();
      });
      await Promise.all(purchasePromises);
    }

    res.status(201).json(newInventory);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear el inventario', error });
  }
};

// Obtener todos los inventarios
export const getInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find().sort({ date: -1 }).populate('meta.createdBy', 'firstName');
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los inventarios', error });
  }
};

// Actualizar un inventario
export const updateInventory = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            'meta.updatedBy': req.user.id
        };
        const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedInventory) return res.status(404).json({ message: 'Inventario no encontrado' });
        res.status(200).json(updatedInventory);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el inventario', error });
    }
};

// Eliminar un inventario (solo Admin)
export const deleteInventory = async (req, res) => {
  try {
    const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedInventory) return res.status(404).json({ message: 'Inventario no encontrado' });
    res.status(200).json({ message: 'Inventario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el inventario', error });
  }
};

// Obtener una plantilla para el nuevo inventario con datos del día anterior
export const getInventoryTemplate = async (req, res) => {
  try {
    // 1. Buscar el último inventario registrado, ordenando por fecha descendente
    const lastInventory = await Inventory.findOne().sort({ date: -1 });

    let template = {};

    if (lastInventory) {
      // 2. Si existe un inventario anterior, mapear los valores finales a los iniciales
      template = {
        start: {
          arepasInitial: lastInventory.end.arepasRemaining,
          panesInitial: lastInventory.end.panesRemaining,
          gaseosasInitial: lastInventory.end.gaseosasRemaining,
          aguasInitial: lastInventory.end.aguasRemaining,
        },
      };
    }
    // 3. Si no existe (es el primer inventario), se devolverá un objeto vacío
    //    y el frontend mostrará los campos en 0.

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar la plantilla de inventario', error });
  }
};