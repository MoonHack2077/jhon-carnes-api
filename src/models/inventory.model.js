import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    baseCash: { type: Number, required: true },
    start: {
        arepasInitial: Number, arepasNew: Number, panesInitial: Number, panesNew: Number, 
        gaseosasInitial: Number, gaseosasNew: Number, aguasInitial: Number, aguasNew: Number
    },
    end: {
        arepasRemaining: Number, panesRemaining: Number, gaseosasRemaining: Number, aguasRemaining: Number
    },
    transfers: [{ time: String, amount: Number, reference: String }],
    courtesies: [{ productId: mongoose.Schema.Types.ObjectId, name: String, quantity: Number, estimatedValue: Number }],
    employeeConsumption: [{ productId: mongoose.Schema.Types.ObjectId, name: String, quantity: Number, estimatedValue: Number }],
    
    // --- NUEVOS CAMPOS ---
    
    // 1. Para registrar ventas fiadas (cuentas por cobrar)
    receivables: [{
        customerName: { type: String, required: true },
        description: { type: String, required: true }, // Ej: "1 Arepa de carne, 1 Coca-Cola"
        amount: { type: Number, required: true },
        isPaid: { type: Boolean, default: false } // Para seguimiento futuro
    }],

    // 2. Para registrar descuentos especiales
    discounts: [{
        description: { type: String, required: true }, // Ej: "Descuento a cliente frecuente"
        originalAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true }
    }],

    // 3. Para reconocer a colaboradores externos
    collaborations: [{
        personName: { type: String, required: true },
        type: { type: String, enum: ['PRODUCT', 'CASH'], required: true }, // Se le dio producto o dinero
        description: { type: String }, // Ej: "Ayuda en la parrilla", "Gaseosa por favor"
        value: { type: Number, required: true } // Valor del producto o el monto en efectivo
    }],

    // --- FIN DE NUEVOS CAMPOS ---

    requestsForNextDay: [{ item: String, quantity: Number }],
    notes: String,
    meta: {
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;