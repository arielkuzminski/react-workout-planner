import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { STORAGE_KEYS } from './constants/storage'
import { initializeAutoBackup } from './utils/autoBackup'

// Synchronous theme init - prevents flash of wrong theme
try {
  const stored = localStorage.getItem(STORAGE_KEYS.themeStore);
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme) {
      if (state.theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', state.theme);
      }
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
} catch {
  document.documentElement.setAttribute('data-theme', 'dark');
}

initializeAutoBackup();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
