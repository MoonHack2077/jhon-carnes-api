import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, 
    passwordHash: { type: String, required: true }, 
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true }, 
    birthday: { type: Date }, 
    role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], required: true }, 
    isActive: { type: Boolean, default: true } 
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;