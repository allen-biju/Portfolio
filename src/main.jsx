import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../style.css' // We can just import the existing style.css from the root for now, we will adapt it.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
