import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import complaintRoutes from './routes/complaint.route.js';
import authRoutes from './routes/auth.route.js';
import logger from './middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Default Route: Splash Screen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'splash.html'));
});

app.use(express.static('frontend'));

app.use('/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);

export default app;
