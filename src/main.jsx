import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Mantiene los estilos globales de Tailwind CSS instalados por Vite
import App from './App.jsx' // Importación del componente controlador de autenticación

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
