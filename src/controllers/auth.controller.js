import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Registro de un nuevo usuario (normalmente hecho por un Admin) ---
export const register = async (req, res) => {
  const { code, password, firstName, lastName, role } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const existingUser = await User.findOne({ code });
    if (existingUser) {
      return res.status(400).json({ message: 'El código de usuario ya está en uso.' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Crear el nuevo usuario
    const newUser = new User({
      code,
      passwordHash,
      firstName,
      lastName,
      role
    });

    // 4. Guardar en la base de datos
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};


// --- Inicio de sesión ---
export const login = async (req, res) => {
  const { code, password } = req.body;

  try {
    // 1. Buscar al usuario por su código
    const user = await User.findOne({ code });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // 2. Comparar la contraseña ingresada con la encriptada
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Crear el Token (JWT)
    const tokenPayload = {
      id: user._id,
      role: user.role,
      firstName: user.firstName
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1d' // El token expirará en 1 día
    });
    
    // 4. Enviar el token al cliente
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token
    });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};