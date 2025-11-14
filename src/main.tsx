import { validateEnv } from './lib/env';

// Validar antes de renderizar
validateEnv();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
