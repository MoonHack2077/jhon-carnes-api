import Inventory from '../models/inventory.model.js';
import Purchase from '../models/purchase.model.js';
import Product from '../models/product.model.js';

export const getDashboardSummary = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    let finalStartDate, finalEndDate;

    // Si no se proveen fechas, se usa el mes actual por defecto.
    if (!startDate || !endDate) {
      const now = new Date();
      finalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      finalEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      // Ajusta las fechas recibidas para cubrir los días completos y evitar problemas de zona horaria.
      finalStartDate = new Date(startDate);
      finalStartDate.setUTCHours(0, 0, 0, 0);

      finalEndDate = new Date(endDate);
      finalEndDate.setUTCHours(23, 59, 59, 999);
    }

    // 1. Obtener los productos para tener sus precios a mano.
    const products = await Product.find();
    const productPrices = Object.fromEntries(products.map(p => [p.name, p.price]));

    // 2. Obtener todos los inventarios CERRADOS en el rango de fechas.
    const inventories = await Inventory.find({
      date: { $gte: finalStartDate, $lte: finalEndDate },
      status: 'CLOSED'
    });

    // 3. Inicializar los contadores.
    let totalIncome = { cash: 0, transfers: 0 };
    let suppliesUsed = { arepas: 0, panes: 0, bebidas: 0 }; // Incluye gaseosas y aguas
    let damagedTotals = { arepas: 0, panes: 0, bebidas: 0, sodaForSauce: 0 };
    let totalDiscounts = 0;
    let totalCourtesiesValue = 0;
    let totalCollaborationsValue = 0;

    // 4. Calcular métricas iterando sobre los inventarios.
    for (const inv of inventories) {
      totalIncome.cash += inv.finalCash || 0;
      totalIncome.transfers += inv.totalTransfers || 0;
      
      suppliesUsed.arepas += inv.start?.arepasNew || 0;
      suppliesUsed.panes += inv.start?.panesNew || 0;
      suppliesUsed.bebidas += (inv.start?.gaseosasNew || 0) + (inv.start?.aguasNew || 0);
      
      damagedTotals.arepas += inv.damaged?.arepas || 0;
      damagedTotals.panes += inv.damaged?.panes || 0;
      damagedTotals.bebidas += inv.damaged?.bebidas || 0;
      damagedTotals.sodaForSauce += inv.sodaForSauce || 0;

      inv.discounts.forEach(d => {
        totalDiscounts += (d.originalAmount || 0) - (d.finalAmount || 0);
      });

      inv.courtesies.forEach(c => {
        totalCourtesiesValue += (productPrices[c.name] || 0) * (c.quantity || 0);
      });

      inv.collaborations.forEach(c => {
        totalCollaborationsValue += c.value || 0;
      });
    }

    // 5. Calcular gastos totales desde la colección de Purchases en el mismo rango.
    const purchases = await Purchase.find({
      date: { $gte: finalStartDate, $lte: finalEndDate },
    });
    const totalExpenses = purchases.reduce((sum, p) => sum + p.total, 0);
    
    // 6. Calcular el balance final.
    const totalRevenue = totalIncome.cash + totalIncome.transfers;
    const balance = totalRevenue - totalExpenses;

    // 7. Devolver el objeto con todos los datos calculados.
    res.status(200).json({
      totalIncome,
      totalExpenses,
      suppliesUsed,
      damagedTotals,
      balance,
      totalDiscounts,
      totalCourtesiesValue,
      totalCollaborationsValue,
      range: { 
        startDate: finalStartDate.toISOString(),
        endDate: finalEndDate.toISOString()
      },
    });

  } catch (error) {
    console.error("Error en getDashboardSummary:", error);
    res.status(500).json({ message: 'Error al calcular el resumen del dashboard', error: error.message });
  }
};