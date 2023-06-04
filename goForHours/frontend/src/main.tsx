import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './RunningProcesses';
import TrackedProcesses from './TrackedProcesses';
import './style.css';

const container = document.getElementById('root');

const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <div id="App">
            <App />
            <TrackedProcesses />
        </div>
    </React.StrictMode>
);
