import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Synchronous theme init — prevents flash of light theme
try {
  const stored = localStorage.getItem('silka-theme');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme && state.theme !== 'light') {
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }
} catch { /* fallback to light */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
