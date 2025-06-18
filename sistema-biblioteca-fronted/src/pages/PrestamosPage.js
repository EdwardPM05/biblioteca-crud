// src/pages/PrestamosPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRESTAMOS_API_URL = 'http://localhost:3000/api/prestamos';
const LIBROS_API_URL = 'http://localhost:3000/api/libros';
const MIEMBROS_API_URL = 'http://localhost:3000/api/miembros';

function PrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [libros, setLibros] = useState([]); // Libros disponibles para préstamo
  const [miembros, setMiembros] = useState([]); // Miembros para préstamo
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Formulario de préstamo
  const [selectedLibroID, setSelectedLibroID] = useState('');
  const [selectedMiembroID, setSelectedMiembroID] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prestamosRes, librosRes, miembrosRes] = await Promise.all([
        axios.get(PRESTAMOS_API_URL),
        axios.get(LIBROS_API_URL), // Obtener todos los libros para el dropdown
        axios.get(MIEMBROS_API_URL) // Obtener todos los miembros para el dropdown
      ]);
      setPrestamos(prestamosRes.data);
      // Filtrar libros que tienen cantidad_disponible > 0 para el dropdown de préstamo
      setLibros(librosRes.data.filter(libro => libro.CantidadDisponible > 0));
      setMiembros(miembrosRes.data);
      setMessage('');
    } catch (error) {
      console.error('Error al cargar datos de préstamos:', error);
      setMessage('Error al cargar datos. Asegúrate de que el backend esté funcionando y CORS configurado.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrestamoSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!selectedLibroID || !selectedMiembroID) {
      setMessage('Por favor, selecciona un libro y un miembro para el préstamo.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(PRESTAMOS_API_URL, {
        LibroID: parseInt(selectedLibroID),
        MiembroID: parseInt(selectedMiembroID),
      });
      setMessage('Préstamo realizado exitosamente!');
      setMessageType('success');
      setSelectedLibroID('');
      setSelectedMiembroID('');
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al realizar préstamo:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al realizar préstamo: ${error.response.data.message}`);
      } else {
        setMessage('Error al realizar préstamo. Verifica los datos.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevolucion = async (prestamoID) => {
    setMessage('');
    setMessageType('');
    setIsLoading(true);
    try {
      await axios.post(`${PRESTAMOS_API_URL}/devolver`, { PrestamoID: prestamoID });
      setMessage('Devolución registrada exitosamente!');
      setMessageType('success');
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al registrar devolución:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al registrar devolución: ${error.response.data.message}`);
      } else {
        setMessage('Error al registrar devolución.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2>Realizar Nuevo Préstamo</h2>
      {message && <p className={`mensaje-app ${messageType}`}>{message}</p>}
      <form onSubmit={handlePrestamoSubmit} className="single-column">
        <div>
          <label htmlFor="selectLibro">Libro:</label>
          <select id="selectLibro" value={selectedLibroID} onChange={(e) => setSelectedLibroID(e.target.value)} required>
            <option value="">Selecciona un libro</option>
            {libros.map((libro) => (
              <option key={libro.LibroID} value={libro.LibroID}>
                {libro.Titulo} ({libro.CantidadDisponible} disponibles)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="selectMiembro">Miembro:</label>
          <select id="selectMiembro" value={selectedMiembroID} onChange={(e) => setSelectedMiembroID(e.target.value)} required>
            <option value="">Selecciona un miembro</option>
            {miembros.map((miembro) => (
              <option key={miembro.MiembroID} value={miembro.MiembroID}>
                {miembro.Nombre} (DNI: {miembro.DNI})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Realizar Préstamo</button>
      </form>

      <hr />

      <h2>Préstamos Activos e Historial</h2>
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : prestamos.length === 0 ? (
        <p>No hay préstamos registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID Préstamo</th>
              <th>Libro</th>
              <th>Autor</th>
              <th>Miembro</th>
              <th>DNI Miembro</th>
              <th>Fecha Préstamo</th>
              <th>Fecha Devolución</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((prestamo) => (
              <tr key={prestamo.PrestamoID}>
                <td>{prestamo.PrestamoID}</td>
                <td>{prestamo.TituloLibro}</td>
                <td>{prestamo.NombreAutor}</td>
                <td>{prestamo.NombreMiembro}</td>
                <td>{prestamo.DNIMiembro}</td>
                <td>{new Date(prestamo.FechaPrestamo).toLocaleDateString()}</td>
                <td>{prestamo.FechaDevolucion ? new Date(prestamo.FechaDevolucion).toLocaleDateString() : 'Pendiente'}</td>
                <td>
                  {!prestamo.FechaDevolucion && (
                    <button className="edit" onClick={() => handleDevolucion(prestamo.PrestamoID)}>Devolver</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default PrestamosPage;