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

    // --- CAMPOS ADICIONALES DE OPERACIÓN ---
    receivables: [{
        customerName: { type: String, required: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        isPaid: { type: Boolean, default: false }
    }],
    discounts: [{
        description: { type: String, required: true },
        originalAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true }
    }],
    collaborations: [{
        personName: { type: String, required: true },
        type: { type: String, enum: ['PRODUCT', 'CASH'], required: true },
        description: { type: String },
        value: { type: Number, required: true }
    }],
    payroll: [{
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amountPaid: {
            type: Number,
            required: true
        }
    }],
    damaged: {
        arepas: { type: Number, default: 0 },
        panes: { type: Number, default: 0 },
        bebidas: { type: Number, default: 0 }
    },
    sodaForSauce: { type: Number, default: 0 },

    // --- FIN DE CAMPOS ADICIONALES ---
    requestsForNextDay: [{ item: String, quantity: Number }],
    notes: String,
    meta: {
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;