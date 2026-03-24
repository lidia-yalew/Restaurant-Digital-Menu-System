import React from 'react'
import { Outlet } from 'react-router-dom';
import Nav from '../layout/Nav.jsx';
function Layout() {
  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className=''>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout
