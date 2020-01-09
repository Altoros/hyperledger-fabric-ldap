import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/auth';

import './favicon.ico';

const routing = (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

function renderApp() {
  render(routing, document.getElementById('root'));
}

renderApp();

if (module.hot) {
  module.hot.accept(renderApp);
}
