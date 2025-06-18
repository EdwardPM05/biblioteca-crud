// src/pages/LibrosPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal'; // Importar el modal

const API_URL = 'http://localhost:3000/api/libros';
const AUTORES_API_URL = 'http://localhost:3000/api/autores';

function LibrosPage() {
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [currentLibro, setCurrentLibro] = useState(null); // Para editar
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Formulario states
  const [titulo, setTitulo] = useState('');
  const [añoPublicacion, setAñoPublicacion] = useState('');
  const [genero, setGenero] = useState('');
  const [autorID, setAutorID] = useState('');
  const [cantidadDisponible, setCantidadDisponible] = useState('');

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [libroToDelete, setLibroToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [librosRes, autoresRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(AUTORES_API_URL)
      ]);
      setLibros(librosRes.data);
      setAutores(autoresRes.data);
      setMessage('');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMessage('Error al cargar libros o autores. Asegúrate de que el backend esté funcionando y CORS configurado.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!titulo || !autorID || cantidadDisponible === '' || isNaN(parseInt(cantidadDisponible))) {
        setMessage('Por favor, completa los campos obligatorios: Título, Autor y Cantidad Disponible (número).');
        setMessageType('error');
        return;
    }

    const libroData = {
      Titulo: titulo,
      AñoPublicacion: añoPublicacion ? parseInt(añoPublicacion) : null,
      Genero: genero,
      AutorID: parseInt(autorID),
      CantidadDisponible: parseInt(cantidadDisponible),
    };

    setIsLoading(true);
    try {
      if (currentLibro) {
        // Actualizar libro existente
        await axios.put(`${API_URL}/${currentLibro.LibroID}`, libroData);
        setMessage('Libro actualizado exitosamente!');
        setMessageType('success');
      } else {
        // Crear nuevo libro
        await axios.post(API_URL, libroData);
        setMessage('Libro añadido exitosamente!');
        setMessageType('success');
      }
      resetForm();
      fetchData(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar libro:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al guardar libro: ${error.response.data.message}`);
      } else {
        setMessage('Error al guardar libro. Verifica los datos.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (libro) => {
    setCurrentLibro(libro);
    setTitulo(libro.Titulo);
    setAñoPublicacion(libro.AñoPublicacion || '');
    setGenero(libro.Genero || '');
    setAutorID(libro.AutorID);
    setCantidadDisponible(libro.CantidadDisponible);
    setMessage(''); // Limpiar mensajes al editar
  };

  const handleDeleteClick = (libro) => {
    setLibroToDelete(libro);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!libroToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/${libroToDelete.LibroID}`);
      setMessage('Libro eliminado exitosamente!');
      setMessageType('success');
      fetchData(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al eliminar libro: ${error.response.data.message}`);
      } else {
        setMessage('Error al eliminar libro.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
      setLibroToDelete(null); // Limpiar el libro a eliminar
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setLibroToDelete(null);
  };

  const resetForm = () => {
    setCurrentLibro(null);
    setTitulo('');
    setAñoPublicacion('');
    setGenero('');
    setAutorID('');
    setCantidadDisponible('');
  };

  return (
    <section>
      <h2>{currentLibro ? 'Editar Libro' : 'Añadir Nuevo Libro'}</h2>
      {message && <p className={`mensaje-app ${messageType}`}>{message}</p>}
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="titulo">Título:</label>
          <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="añoPublicacion">Año de Publicación:</label>
          <input type="number" id="añoPublicacion" value={añoPublicacion} onChange={(e) => setAñoPublicacion(e.target.value)} />
        </div>
        <div>
          <label htmlFor="genero">Género:</label>
          <input type="text" id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} />
        </div>
        <div>
          <label htmlFor="autorID">Autor:</label>
          <select id="autorID" value={autorID} onChange={(e) => setAutorID(e.target.value)} required>
            <option value="">Selecciona un autor</option>
            {autores.map((autor) => (
              <option key={autor.AutorID} value={autor.AutorID}>
                {autor.Nombre} ({autor.Nacionalidad})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cantidadDisponible">Cantidad Disponible:</label>
          <input type="number" id="cantidadDisponible" value={cantidadDisponible} onChange={(e) => setCantidadDisponible(e.target.value)} required />
        </div>
        <button type="submit">{currentLibro ? 'Actualizar Libro' : 'Añadir Libro'}</button>
        {currentLibro && <button type="button" onClick={resetForm} style={{ backgroundColor: '#6c757d' }}>Cancelar Edición</button>}
      </form>

      <hr />

      <h2>Listado de Libros</h2>
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : libros.length === 0 ? (
        <p>No hay libros disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Año</th>
              <th>Género</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {libros.map((libro) => (
              <tr key={libro.LibroID}>
                <td>{libro.LibroID}</td>
                <td>{libro.Titulo}</td>
                <td>{libro.NombreAutor}</td>
                <td>{libro.AñoPublicacion}</td>
                <td>{libro.Genero}</td>
                <td>{libro.CantidadDisponible}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(libro)}>Editar</button>
                  <button className="delete" onClick={() => handleDeleteClick(libro)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message={`¿Estás seguro de que quieres eliminar el libro "${libroToDelete?.Titulo}"?`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
}

export default LibrosPage;