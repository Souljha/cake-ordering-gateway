import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Add global error handler for non-React errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering React app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>Failed to load the application</h2>
      <p>Please check the console for more details.</p>
    </div>
  `;
}