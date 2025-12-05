import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/process-voice', voiceRoutes);

export default app;