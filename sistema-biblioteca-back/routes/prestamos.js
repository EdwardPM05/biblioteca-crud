const express = require('express');
const router = express.Router();

// Realizar un préstamo
router.post('/', async (req, res) => {
    const { LibroID, MiembroID } = req.body;
    if (!LibroID || !MiembroID) {
        return res.status(400).json({ message: 'LibroID y MiembroID son obligatorios para un préstamo' });
    }

    const connection = await req.pool.getConnection(); // Obtener una conexión del pool
    try {
        await connection.beginTransaction(); // Iniciar transacción

        // 1. Verificar si el libro existe y hay disponibilidad
        const [libros] = await connection.query('SELECT CantidadDisponible FROM Libro WHERE LibroID = ? FOR UPDATE', [LibroID]);
        if (libros.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        if (libros[0].CantidadDisponible <= 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'No hay unidades disponibles de este libro para préstamo' });
        }

        // 2. Verificar si el miembro existe
        const [miembros] = await connection.query('SELECT MiembroID FROM Miembro WHERE MiembroID = ?', [MiembroID]);
        if (miembros.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }

        // 3. Registrar el préstamo
        const [prestamoResult] = await connection.query(
            'INSERT INTO Prestamo (LibroID, MiembroID, FechaPrestamo) VALUES (?, ?, CURDATE())',
            [LibroID, MiembroID]
        );

        // 4. Decrementar la cantidad disponible del libro
        await connection.query('UPDATE Libro SET CantidadDisponible = CantidadDisponible - 1 WHERE LibroID = ?', [LibroID]);

        await connection.commit(); // Confirmar transacción
        res.status(201).json({ message: 'Préstamo realizado exitosamente', PrestamoID: prestamoResult.insertId });

    } catch (err) {
        await connection.rollback(); // Revertir transacción en caso de error
        res.status(500).json({ message: 'Error al realizar el préstamo', error: err.message });
    } finally {
        connection.release(); // Liberar la conexión de vuelta al pool
    }
});

// Registrar una devolución
router.post('/devolver', async (req, res) => {
    const { PrestamoID } = req.body;
    if (!PrestamoID) {
        return res.status(400).json({ message: 'PrestamoID es obligatorio para la devolución' });
    }

    const connection = await req.pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verificar si el préstamo existe y no ha sido devuelto
        const [prestamos] = await connection.query('SELECT LibroID, FechaDevolucion FROM Prestamo WHERE PrestamoID = ? FOR UPDATE', [PrestamoID]);
        if (prestamos.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }
        if (prestamos[0].FechaDevolucion !== null) {
            await connection.rollback();
            return res.status(400).json({ message: 'Este préstamo ya ha sido devuelto' });
        }

        const libroID = prestamos[0].LibroID;

        // 2. Actualizar la fecha de devolución del préstamo
        const [updateResult] = await connection.query('UPDATE Prestamo SET FechaDevolucion = CURDATE() WHERE PrestamoID = ?', [PrestamoID]);
        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({ message: 'Error al actualizar la fecha de devolución del préstamo' });
        }

        // 3. Incrementar la cantidad disponible del libro
        await connection.query('UPDATE Libro SET CantidadDisponible = CantidadDisponible + 1 WHERE LibroID = ?', [libroID]);

        await connection.commit();
        res.json({ message: 'Libro devuelto exitosamente', PrestamoID: PrestamoID });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: 'Error al procesar la devolución', error: err.message });
    } finally {
        connection.release();
    }
});

// Obtener todos los préstamos (con detalles de libro y miembro)
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.pool.query(`
            SELECT
                p.PrestamoID,
                p.FechaPrestamo,
                p.FechaDevolucion,
                l.Titulo AS TituloLibro,
                l.Genero AS GeneroLibro,
                a.Nombre AS NombreAutor,
                m.Nombre AS NombreMiembro,
                m.DNI AS DNIMiembro,
                m.CorreoElectronico AS CorreoMiembro
            FROM
                Prestamo p
            JOIN
                Libro l ON p.LibroID = l.LibroID
            JOIN
                Autor a ON l.AutorID = a.AutorID
            JOIN
                Miembro m ON p.MiembroID = m.MiembroID
            ORDER BY
                p.FechaPrestamo DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener préstamos', error: err.message });
    }
});

// Obtener préstamos de un miembro específico
router.get('/miembro/:MiembroID', async (req, res) => {
    const { MiembroID } = req.params;
    try {
        const [rows] = await req.pool.query(`
            SELECT
                p.PrestamoID,
                p.FechaPrestamo,
                p.FechaDevolucion,
                l.Titulo AS TituloLibro,
                l.Genero AS GeneroLibro,
                a.Nombre AS NombreAutor
            FROM
                Prestamo p
            JOIN
                Libro l ON p.LibroID = l.LibroID
            JOIN
                Autor a ON l.AutorID = a.AutorID
            WHERE
                p.MiembroID = ?
            ORDER BY
                p.FechaPrestamo DESC
        `, [MiembroID]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron préstamos para este miembro' });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener préstamos del miembro', error: err.message });
    }
});

// Obtener el historial de préstamos de un libro específico
router.get('/libro/:LibroID', async (req, res) => {
    const { LibroID } = req.params;
    try {
        const [rows] = await req.pool.query(`
            SELECT
                p.PrestamoID,
                p.FechaPrestamo,
                p.FechaDevolucion,
                m.Nombre AS NombreMiembro,
                m.DNI AS DNIMiembro,
                m.CorreoElectronico AS CorreoMiembro
            FROM
                Prestamo p
            JOIN
                Miembro m ON p.MiembroID = m.MiembroID
            WHERE
                p.LibroID = ?
            ORDER BY
                p.FechaPrestamo DESC
        `, [LibroID]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron préstamos para este libro' });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener historial de préstamos del libro', error: err.message });
    }
});


module.exports = router;