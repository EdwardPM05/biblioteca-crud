const express = require('express');
const router = express.Router();

// Obtener todos los autores
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.pool.query('SELECT * FROM Autor');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener autores', error: err.message });
    }
});

// Obtener un autor por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await req.pool.query('SELECT * FROM Autor WHERE AutorID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener autor', error: err.message });
    }
});

// Crear un nuevo autor
router.post('/', async (req, res) => {
    const { Nombre, Nacionalidad } = req.body;
    if (!Nombre) {
        return res.status(400).json({ message: 'El nombre del autor es obligatorio' });
    }
    try {
        const [result] = await req.pool.query(
            'INSERT INTO Autor (Nombre, Nacionalidad) VALUES (?, ?)',
            [Nombre, Nacionalidad]
        );
        res.status(201).json({ message: 'Autor creado exitosamente', AutorID: result.insertId, autor: req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear autor', error: err.message });
    }
});

// Actualizar un autor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Nombre, Nacionalidad } = req.body;
    if (!Nombre && !Nacionalidad) {
        return res.status(400).json({ message: 'Al menos un campo para actualizar es requerido' });
    }
    try {
        const [result] = await req.pool.query(
            'UPDATE Autor SET Nombre = COALESCE(?, Nombre), Nacionalidad = COALESCE(?, Nacionalidad) WHERE AutorID = ?',
            [Nombre, Nacionalidad, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Autor no encontrado para actualizar' });
        }
        res.json({ message: 'Autor actualizado exitosamente', AutorID: id, changes: req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar autor', error: err.message });
    }
});

// Eliminar un autor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await req.pool.query('DELETE FROM Autor WHERE AutorID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Autor no encontrado para eliminar' });
        }
        res.json({ message: 'Autor eliminado exitosamente', AutorID: id });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar autor', error: err.message });
    }
});

module.exports = router;