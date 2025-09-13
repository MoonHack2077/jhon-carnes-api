import User from '../models/user.model.js';

// Obtener todos los usuarios (sin la contraseña)
export const getUsers = async (req, res) => {
  try {
    // Usamos .select('-passwordHash') para excluir el campo de la respuesta
    const users = await User.find().select('-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
};

// Actualizar un usuario por ID
export const updateUser = async (req, res) => {
  try {
    // No permitimos actualizar la contraseña desde este endpoint
    const { passwordHash, ...updateData } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-passwordHash');
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
};

// Eliminar un usuario por ID
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
};

// NOTA: La creación de usuarios ya se maneja en auth.controller.js