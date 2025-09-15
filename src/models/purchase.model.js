import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    supplier: { type: String, default: 'Varios' },
    items: [{
        name: String,
        unitPrice: Number,
        quantity: Number
    }],
    total: { type: Number, required: true },
    invoiceEvidenceUrl: { type: String },
    fromInventory: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;