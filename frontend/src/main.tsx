import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';

// Принудительно устанавливаем русский язык по умолчанию, если не выбран
if (!localStorage.getItem('language')) {
  localStorage.setItem('language', 'ru');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
