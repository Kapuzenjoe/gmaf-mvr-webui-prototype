import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

/**
 * Entry point for the React application.
 * Initializes the root DOM node and renders the top-level App component
 * inside React.StrictMode for development-time checks.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)