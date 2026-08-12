import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.config.js';

dotenv.config();
const app = express();
app.use(express.json());
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 5000;

app.get('/api/demo', (req, res) => {
    res.status(200).json({ success: true, message: "Hello from the backend!" })
})

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on server http://localhost:${PORT}`);
})

