import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic status route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Meeting Room Booking System API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Quick query to check DB availability
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'UP',
      database: 'Connected'
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'Disconnected',
      error: error.message || error
    });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  // Graceful DB check
  try {
    await prisma.$connect();
    console.log('📦 Database connection has been established successfully.');
  } catch (error) {
    console.warn('⚠️ Warning: Database connection failed. Ensure your database is running and DATABASE_URL in .env is correct.');
    console.warn('Prisma Client will retry connecting upon incoming requests.');
  }
});
