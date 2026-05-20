import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Index.css' // Mantiene los estilos globales de Tailwind CSS instalados por Vite
import App from './Interface.jsx' // Importación correcta del componente de tu interfaz

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
