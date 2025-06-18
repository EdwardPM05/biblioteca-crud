const express = require('express');
const router = express.Router();

// Obtener todos los libros (con información del autor)
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.pool.query(`
            SELECT
                l.LibroID,
                l.Titulo,
                l.AñoPublicacion,
                l.Genero,
                l.CantidadDisponible,
                a.Nombre AS NombreAutor,
                a.Nacionalidad
            FROM
                Libro l
            JOIN
                Autor a ON l.AutorID = a.AutorID
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener libros', error: err.message });
    }
});

// Obtener un libro por ID (con información del autor)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await req.pool.query(`
            SELECT
                l.LibroID,
                l.Titulo,
                l.AñoPublicacion,
                l.Genero,
                l.CantidadDisponible,
                a.Nombre AS NombreAutor,
                a.Nacionalidad
            FROM
                Libro l
            JOIN
                Autor a ON l.AutorID = a.AutorID
            WHERE
                l.LibroID = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener libro', error: err.message });
    }
});

// Crear un nuevo libro
router.post('/', async (req, res) => {
    const { Titulo, AñoPublicacion, Genero, AutorID, CantidadDisponible } = req.body;
    if (!Titulo || !AutorID || CantidadDisponible === undefined) {
        return res.status(400).json({ message: 'Titulo, AutorID y CantidadDisponible son obligatorios' });
    }
    try {
        // Verificar que el AutorID existe
        const [autores] = await req.pool.query('SELECT AutorID FROM Autor WHERE AutorID = ?', [AutorID]);
        if (autores.length === 0) {
            return res.status(404).json({ message: 'AutorID no encontrado' });
        }

        const [result] = await req.pool.query(
            'INSERT INTO Libro (Titulo, AñoPublicacion, Genero, AutorID, CantidadDisponible) VALUES (?, ?, ?, ?, ?)',
            [Titulo, AñoPublicacion, Genero, AutorID, CantidadDisponible]
        );
        res.status(201).json({ message: 'Libro creado exitosamente', LibroID: result.insertId, libro: req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear libro', error: err.message });
    }
});

// Actualizar un libro
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { Titulo, AñoPublicacion, Genero, AutorID, CantidadDisponible } = req.body;

    if (!Titulo && !AñoPublicacion && !Genero && !AutorID && CantidadDisponible === undefined) {
        return res.status(400).json({ message: 'Al menos un campo para actualizar es requerido' });
    }

    try {
        if (AutorID !== undefined) {
            // Verificar que el nuevo AutorID exista si se está actualizando
            const [autores] = await req.pool.query('SELECT AutorID FROM Autor WHERE AutorID = ?', [AutorID]);
            if (autores.length === 0) {
                return res.status(404).json({ message: 'El AutorID proporcionado no existe' });
            }
        }

        const [result] = await req.pool.query(
            'UPDATE Libro SET Titulo = COALESCE(?, Titulo), AñoPublicacion = COALESCE(?, AñoPublicacion), Genero = COALESCE(?, Genero), AutorID = COALESCE(?, AutorID), CantidadDisponible = COALESCE(?, CantidadDisponible) WHERE LibroID = ?',
            [Titulo, AñoPublicacion, Genero, AutorID, CantidadDisponible, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Libro no encontrado para actualizar' });
        }
        res.json({ message: 'Libro actualizado exitosamente', LibroID: id, changes: req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar libro', error: err.message });
    }
});

// Eliminar un libro
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await req.pool.query('DELETE FROM Libro WHERE LibroID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Libro no encontrado para eliminar' });
        }
        res.json({ message: 'Libro eliminado exitosamente', LibroID: id });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar libro', error: err.message });
    }
});

module.exports = router;