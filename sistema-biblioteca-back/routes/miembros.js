const express = require('express');
const router = express.Router();

// Obtener todos los miembros
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.pool.query('SELECT * FROM Miembro');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener miembros', error: err.message });
    }
});

// Obtener un miembro por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await req.pool.query('SELECT * FROM Miembro WHERE MiembroID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener miembro', error: err.message });
    }
});

// Crear un nuevo miembro
router.post('/', async (req, res) => {
    const { Nombre, DNI, Telefono, CorreoElectronico, Direccion } = req.body;
    if (!Nombre || !DNI || !CorreoElectronico) {
        return res.status(400).json({ message: 'Nombre, DNI y CorreoElectronico son campos obligatorios' });
    }
    try {
        const [result] = await req.pool.query(
            'INSERT INTO Miembro (Nombre, DNI, Telefono, CorreoElectronico, Direccion, FechaRegistro) VALUES (?, ?, ?, ?, ?, CURDATE())',
            [Nombre, DNI, Telefono, CorreoElectronico, Direccion]
        );
        res.status(201).json({ message: 'Miembro creado exitosamente', MiembroID: result.insertId, miembro: req.body });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            let field = 'DNI o Correo Electrónico';
            if (err.message.includes('DNI')) field = 'DNI';
            if (err.message.includes('CorreoElectronico')) field = 'Correo Electrónico';
            return res.status(409).json({ message: `Ya existe un miembro con ese ${field}.`, error: err.message });
        }
        res.status(500).json({ message: 'Error al crear miembro', error: err.message });
    }
});

// Actualizar un miembro
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Nombre, DNI, Telefono, CorreoElectronico, Direccion } = req.body;
    if (!Nombre && !DNI && !Telefono && !CorreoElectronico && !Direccion) {
        return res.status(400).json({ message: 'Al menos un campo para actualizar es requerido' });
    }
    try {
        const [result] = await req.pool.query(
            'UPDATE Miembro SET Nombre = COALESCE(?, Nombre), DNI = COALESCE(?, DNI), Telefono = COALESCE(?, Telefono), CorreoElectronico = COALESCE(?, CorreoElectronico), Direccion = COALESCE(?, Direccion) WHERE MiembroID = ?',
            [Nombre, DNI, Telefono, CorreoElectronico, Direccion, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Miembro no encontrado para actualizar' });
        }
        res.json({ message: 'Miembro actualizado exitosamente', MiembroID: id, changes: req.body });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            let field = 'DNI o Correo Electrónico';
            if (err.message.includes('DNI')) field = 'DNI';
            if (err.message.includes('CorreoElectronico')) field = 'Correo Electrónico';
            return res.status(409).json({ message: `Ya existe un miembro con ese ${field}.`, error: err.message });
        }
        res.status(500).json({ message: 'Error al actualizar miembro', error: err.message });
    }
});

// Eliminar un miembro
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await req.pool.query('DELETE FROM Miembro WHERE MiembroID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Miembro no encontrado para eliminar' });
        }
        res.json({ message: 'Miembro eliminado exitosamente', MiembroID: id });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar miembro', error: err.message });
    }
});

module.exports = router;