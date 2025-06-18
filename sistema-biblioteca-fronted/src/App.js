// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LibrosPage from './pages/LibrosPage';
import AutoresPage from './pages/AutoresPage';
import MiembrosPage from './pages/MiembrosPage';
import PrestamosPage from './pages/PrestamosPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* El Navbar ahora está fuera del header y es el primer elemento flex */}
        <Navbar />

        {/* El main contendrá todas las rutas y el título principal */}
        <main>
          {/* Título de la página principal, ahora dentro de main */}
          <Routes>
            {/* Redirigir a /libros por defecto */}
            <Route path="/" element={<Navigate to="/libros" replace />} />
            <Route path="/libros" element={<LibrosPage />} />
            <Route path="/autores" element={<AutoresPage />} />
            <Route path="/miembros" element={<MiembrosPage />} />
            <Route path="/prestamos" element={<PrestamosPage />} />
            {/* Puedes añadir una ruta 404 aquí si quieres */}
            <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;