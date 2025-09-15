import Inventory from '../models/inventory.model.js';
import Purchase from '../models/purchase.model.js';

// Crear un nuevo registro de inventario
export const createInventory = async (req, res) => {
  // El frontend podría enviar los gastos en un campo aparte para procesarlos aquí
  const { expenses, ...inventoryData } = req.body;

  try {
    // --- NUEVA LÓGICA ---
    // Antes de crear uno nuevo, cerramos cualquier otro inventario que esté activo.
    await Inventory.updateMany({ status: 'ACTIVE' }, { status: 'CLOSED' });
    // --- FIN DE LA NUEVA LÓGICA ---

    // 1. Crear el documento principal de inventario
    const newInventory = new Inventory({
      ...inventoryData,
      status: 'ACTIVE',
      'meta.createdBy': req.user.id
    });
    await newInventory.save();

    // 2. Lógica especial: si se enviaron gastos, crearlos como documentos de 'Purchase'
    // if (expenses && expenses.length > 0) {
    //   const purchasePromises = expenses.map(expense => {
    //     const purchaseDoc = new Purchase({
    //       date: newInventory.date,
    //       supplier: expense.category || 'Gasto diario',
    //       items: [{ name: expense.description, unitPrice: expense.amount, quantity: 1 }],
    //       total: expense.amount,
    //       fromInventory: true, // Marcamos que viene de un registro de inventario
    //       createdBy: req.user.id,
    //     });
    //     return purchaseDoc.save();
    //   });
    //   await Promise.all(purchasePromises);
    // }

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
    const updateData = req.body;

    // Forma segura de añadir la información de 'quién actualizó'
    // 1. Aseguramos que el objeto 'meta' exista.
    if (!updateData.meta) {
      updateData.meta = {};
    }
    // 2. Asignamos la propiedad 'updatedBy' dentro del objeto 'meta'.
    updateData.meta.updatedBy = req.user.id;

    // Mongoose ahora recibe un objeto limpio y sin conflictos
    const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedInventory) return res.status(404).json({ message: 'Inventario no encontrado' });
    
    res.status(200).json(updatedInventory);
  } catch (error) {
    // Si algo sale mal, devolvemos el error específico para depuración
    console.error(error); // Es bueno loguear el error completo en el servidor
    res.status(500).json({ message: 'Error al actualizar el inventario', error: error.message });
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
    // CAMBIO 1: Ahora busca el último inventario CERRADO.
    const lastInventory = await Inventory.findOne({ status: 'CLOSED' }).sort({ date: -1 });

    let template = {};

    if (lastInventory) {
      // CAMBIO 2: Usamos 'optional chaining' (?.) y '|| 0' para evitar errores
      // si un campo del inventario anterior estaba vacío.
      template = {
        start: {
          arepasInitial: lastInventory.end?.arepasRemaining || 0,
          panesInitial: lastInventory.end?.panesRemaining || 0,
          gaseosasInitial: lastInventory.end?.gaseosasRemaining || 0,
          aguasInitial: lastInventory.end?.aguasRemaining || 0,
        }
      };
    }
    
    res.status(200).json(template);
  } catch (error)
 {
    console.error("Error al generar plantilla:", error);
    res.status(500).json({ message: 'Error al generar la plantilla de inventario', error });
  }
};

// Obtener el inventario activo (si existe)
export const getActiveInventory = async (req, res) => {
  try {
    const activeInventory = await Inventory.findOne({ status: 'ACTIVE' });
    res.status(200).json(activeInventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el inventario activo', error });
  }
};

export const getInventoriesByMonth = async (req, res) => {
  try {
    const { year, month } = req.query; // Ej: year=2025, month=8 (Septiembre, es base 0)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 1);

    const inventories = await Inventory.find({
      date: { $gte: startDate, $lt: endDate }
    });
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inventarios del mes', error });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventario no encontrado' });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el inventario', error });
  }
};

export const closeInventory = async (req, res) => {
  try {
    // 1. Primero, actualizamos el inventario con los últimos datos del formulario
    const updatedInventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: 'CLOSED' }, // Guardamos el body Y cambiamos el estado
      { new: true }
    );

    if (!updatedInventory) return res.status(404).json({ message: 'Inventario no encontrado' });

    // 2. Ahora, con el inventario ya actualizado, movemos los gastos a Compras
    const purchasesFromInventory = await Purchase.find({ inventoryId: updatedInventory._id });
    // (Este paso es más una formalidad ahora que los creamos en tiempo real,
    // pero lo mantenemos por si se necesita lógica adicional en el futuro)

    res.status(200).json({ message: 'Inventario guardado y cerrado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cerrar el inventario', error: error.message });
  }
};