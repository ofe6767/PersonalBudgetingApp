import React from 'react';
import { NavLink } from 'react-router-dom'; 
import './Navbar.css'; 

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink exact to="/dashboard" activeClassName="nav-active">
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/budgeting" activeClassName="nav-active">
            Budget Overview
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/transaction-entry" activeClassName="nav-active">
            Transaction Entry
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/report" activeClassName="nav-active">
            Report
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
