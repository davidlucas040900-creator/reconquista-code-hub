import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'plyr/dist/plyr.css';
import './plyr-custom.css';

createRoot(document.getElementById('root')!).render(<App />);
