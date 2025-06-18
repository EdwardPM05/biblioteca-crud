// src/pages/AutoresPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal';

const API_URL = 'http://localhost:3000/api/autores';

function AutoresPage() {
  const [autores, setAutores] = useState([]);
  const [currentAutor, setCurrentAutor] = useState(null); // Para editar
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Formulario states
  const [nombre, setNombre] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [autorToDelete, setAutorToDelete] = useState(null);

  useEffect(() => {
    fetchAutores();
  }, []);

  const fetchAutores = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setAutores(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error al cargar autores:', error);
      setMessage('Error al cargar autores. Asegúrate de que el backend esté funcionando y CORS configurado.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!nombre) {
      setMessage('El nombre del autor es obligatorio.');
      setMessageType('error');
      return;
    }

    const autorData = {
      Nombre: nombre,
      Nacionalidad: nacionalidad,
    };

    setIsLoading(true);
    try {
      if (currentAutor) {
        // Actualizar autor existente
        await axios.put(`${API_URL}/${currentAutor.AutorID}`, autorData);
        setMessage('Autor actualizado exitosamente!');
        setMessageType('success');
      } else {
        // Crear nuevo autor
        await axios.post(API_URL, autorData);
        setMessage('Autor añadido exitosamente!');
        setMessageType('success');
      }
      resetForm();
      fetchAutores(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar autor:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al guardar autor: ${error.response.data.message}`);
      } else {
        setMessage('Error al guardar autor. Verifica los datos.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (autor) => {
    setCurrentAutor(autor);
    setNombre(autor.Nombre);
    setNacionalidad(autor.Nacionalidad || '');
    setMessage(''); // Limpiar mensajes al editar
  };

  const handleDeleteClick = (autor) => {
    setAutorToDelete(autor);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!autorToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/${autorToDelete.AutorID}`);
      setMessage('Autor eliminado exitosamente!');
      setMessageType('success');
      fetchAutores(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar autor:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al eliminar autor: ${error.response.data.message}`);
      } else {
        setMessage('Error al eliminar autor.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
      setAutorToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setAutorToDelete(null);
  };

  const resetForm = () => {
    setCurrentAutor(null);
    setNombre('');
    setNacionalidad('');
  };

  return (
    <section>
      <h2>{currentAutor ? 'Editar Autor' : 'Añadir Nuevo Autor'}</h2>
      {message && <p className={`mensaje-app ${messageType}`}>{message}</p>}
      <form onSubmit={handleFormSubmit} className="single-column"> {/* Una sola columna para este formulario */}
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="nacionalidad">Nacionalidad:</label>
          <input type="text" id="nacionalidad" value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)} />
        </div>
        <button type="submit">{currentAutor ? 'Actualizar Autor' : 'Añadir Autor'}</button>
        {currentAutor && <button type="button" onClick={resetForm} style={{ backgroundColor: '#6c757d' }}>Cancelar Edición</button>}
      </form>

      <hr />

      <h2>Listado de Autores</h2>
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : autores.length === 0 ? (
        <p>No hay autores disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nacionalidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {autores.map((autor) => (
              <tr key={autor.AutorID}>
                <td>{autor.AutorID}</td>
                <td>{autor.Nombre}</td>
                <td>{autor.Nacionalidad}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(autor)}>Editar</button>
                  <button className="delete" onClick={() => handleDeleteClick(autor)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message={`¿Estás seguro de que quieres eliminar al autor "${autorToDelete?.Nombre}"? Se eliminarán todos los libros asociados.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
}

export default AutoresPage;