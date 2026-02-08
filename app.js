import express from 'express';
import complaintRoutes from './routes/complaint.route.js';
import logger from './middleware/logger.js';

const app = express();

app.use(express.json());
app.use(logger);


app.use(express.static('frontend'));

app.use('/complaints', complaintRoutes);

export default app;
