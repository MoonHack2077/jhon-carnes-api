import jwt from 'jsonwebtoken';

// Middleware para verificar el Token JWT
export const verifyToken = (req, res, next) => {
    // 1. Obtener el token de la cabecera 'Authorization'
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'No se proveyó un token.' });
    }

    // El formato del header es "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Formato de token inválido.' });
    }

    // 2. Verificar la validez del token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'No autorizado. Token inválido o expirado.' });
        }

        // 3. Si el token es válido, guardamos los datos del usuario en el objeto 'request'
        req.user = decoded;
        next(); // Continúa con la siguiente función (el controlador)
    });
};

// Middleware para verificar si el rol es 'ADMIN'
// IMPORTANTE: Este middleware debe usarse SIEMPRE DESPUÉS de verifyToken
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next(); // El usuario es Admin, puede continuar
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};