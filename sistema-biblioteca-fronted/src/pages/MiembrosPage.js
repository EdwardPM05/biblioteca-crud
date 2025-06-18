// src/pages/MiembrosPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal';

const API_URL = 'http://localhost:3000/api/miembros';

function MiembrosPage() {
  const [miembros, setMiembros] = useState([]);
  const [currentMiembro, setCurrentMiembro] = useState(null); // Para editar
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Formulario states
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [direccion, setDireccion] = useState('');

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [miembroToDelete, setMiembroToDelete] = useState(null);

  useEffect(() => {
    fetchMiembros();
  }, []);

  const fetchMiembros = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setMiembros(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error al cargar miembros:', error);
      setMessage('Error al cargar miembros. Asegúrate de que el backend esté funcionando y CORS configurado.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!nombre || !dni || !correoElectronico) {
      setMessage('Nombre, DNI y Correo Electrónico son obligatorios.');
      setMessageType('error');
      return;
    }

    const miembroData = {
      Nombre: nombre,
      DNI: dni,
      Telefono: telefono || null,
      CorreoElectronico: correoElectronico,
      Direccion: direccion || null,
      FechaRegistro: currentMiembro ? currentMiembro.FechaRegistro : new Date().toISOString().split('T')[0] // Mantener fecha si edita, sino fecha actual
    };

    setIsLoading(true);
    try {
      if (currentMiembro) {
        // Actualizar miembro existente
        await axios.put(`${API_URL}/${currentMiembro.MiembroID}`, miembroData);
        setMessage('Miembro actualizado exitosamente!');
        setMessageType('success');
      } else {
        // Crear nuevo miembro
        await axios.post(API_URL, miembroData);
        setMessage('Miembro añadido exitosamente!');
        setMessageType('success');
      }
      resetForm();
      fetchMiembros(); // Recargar la lista
    } catch (error) {
      console.error('Error al guardar miembro:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al guardar miembro: ${error.response.data.message}`);
      } else {
        setMessage('Error al guardar miembro. Verifica los datos.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (miembro) => {
    setCurrentMiembro(miembro);
    setNombre(miembro.Nombre);
    setDni(miembro.DNI);
    setTelefono(miembro.Telefono || '');
    setCorreoElectronico(miembro.CorreoElectronico);
    setDireccion(miembro.Direccion || '');
    setMessage(''); // Limpiar mensajes al editar
  };

  const handleDeleteClick = (miembro) => {
    setMiembroToDelete(miembro);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!miembroToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/${miembroToDelete.MiembroID}`);
      setMessage('Miembro eliminado exitosamente!');
      setMessageType('success');
      fetchMiembros(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Error al eliminar miembro: ${error.response.data.message}`);
      } else {
        setMessage('Error al eliminar miembro.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
      setMiembroToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setMiembroToDelete(null);
  };

  const resetForm = () => {
    setCurrentMiembro(null);
    setNombre('');
    setDni('');
    setTelefono('');
    setCorreoElectronico('');
    setDireccion('');
  };

  return (
    <section>
      <h2>{currentMiembro ? 'Editar Miembro' : 'Añadir Nuevo Miembro'}</h2>
      {message && <p className={`mensaje-app ${messageType}`}>{message}</p>}
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="dni">DNI:</label>
          <input type="text" id="dni" value={dni} onChange={(e) => setDni(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono:</label>
          <input type="text" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div>
          <label htmlFor="correoElectronico">Correo Electrónico:</label>
          <input type="email" id="correoElectronico" value={correoElectronico} onChange={(e) => setCorreoElectronico(e.target.value)} required />
        </div>
        <div style={{gridColumn: 'span 2'}}> {/* Esta div ocupa ambas columnas */}
          <label htmlFor="direccion">Dirección:</label>
          <input type="text" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <button type="submit">{currentMiembro ? 'Actualizar Miembro' : 'Añadir Miembro'}</button>
        {currentMiembro && <button type="button" onClick={resetForm} style={{ backgroundColor: '#6c757d' }}>Cancelar Edición</button>}
      </form>

      <hr />

      <h2>Listado de Miembros</h2>
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : miembros.length === 0 ? (
        <p>No hay miembros disponibles.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {miembros.map((miembro) => (
              <tr key={miembro.MiembroID}>
                <td>{miembro.MiembroID}</td>
                <td>{miembro.Nombre}</td>
                <td>{miembro.DNI}</td>
                <td>{miembro.Telefono}</td>
                <td>{miembro.CorreoElectronico}</td>
                <td>{miembro.Direccion}</td>
                <td>{new Date(miembro.FechaRegistro).toLocaleDateString()}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(miembro)}>Editar</button>
                  <button className="delete" onClick={() => handleDeleteClick(miembro)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message={`¿Estás seguro de que quieres eliminar al miembro "${miembroToDelete?.Nombre}"? Se eliminarán sus préstamos.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
}

export default MiembrosPage;