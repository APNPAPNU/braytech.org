import React from 'react';
import { NavLink } from 'react-router-dom';



const Header = () => {
  return (
    <header>
      <div className="logo">
        <NavLink to="/" exact>Braytech</NavLink>
      </div>
      <ul>
        <li>
          <NavLink to="/progression">Progression</NavLink>
        </li>
      </ul>
    </header>
  )
}

export default Header;