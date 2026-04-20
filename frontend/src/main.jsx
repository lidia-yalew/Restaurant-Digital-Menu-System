import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './stayle/index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './config/AuthContext';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
          <AuthProvider>
      <App />
    </AuthProvider>
    </StrictMode>
  </BrowserRouter>,
);
