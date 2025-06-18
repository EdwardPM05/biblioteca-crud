// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

// Importa tu logo principal
import biblioteca from '../img/biblioteca.png';

// ¡Importa tus nuevos íconos aquí!
import libros from '../img/libros.png';      // Asegúrate de que las rutas y nombres de archivo coincidan
import shakespeare from '../img/shakespeare.png';    // con tus imágenes
import multitud from '../img/multitud.png';  // Por ejemplo, si son SVG, usa '.svg'
import pedir from '../img/pedir.png';// Si están en una subcarpeta, ajústa la ruta

function Navbar() {
  return (
    <nav className="navbar">

      <h2>Biblioteca</h2> {/* Título de la Biblioteca (opcional) */}
      <ul>
        <li>
          <NavLink to="/libros" activeClassName="active">
            {/* Reemplaza el <span> con la imagen */}
            <img src={libros} alt="Libros" className="nav-icon" />
            Libros
          </NavLink>
        </li>
        <li>
          <NavLink to="/autores" activeClassName="active">
            <img src={shakespeare} alt="Autores" className="nav-icon" />
            Autores
          </NavLink>
        </li>
        <li>
          <NavLink to="/miembros" activeClassName="active">
            <img src={multitud} alt="Miembros" className="nav-icon" />
            Miembros
          </NavLink>
        </li>
        <li>
          <NavLink to="/prestamos" activeClassName="active">
            <img src={pedir} alt="Préstamos" className="nav-icon" />
            Préstamos
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;