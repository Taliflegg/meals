 
import usersRouter from './routes/user';

import dotenv from 'dotenv';
// Load environment variables as early as possible
dotenv.config();

import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health';
import eventsRoutes from './routes/events';
import { databaseService } from './services/database';  

const app = express();

 const PORT = process.env.PORT ? parseInt(process.env.PORT as string, 10) : 3001; // ברירת מחדל ל-3001
const CORS_ORIGIN = process.env.CORS_ORIGIN;

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRouter);  

 

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${CORS_ORIGIN}`);

  // Initialize database with sample data if using Supabase
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    console.log('🗄️ Initializing database...');
    try {
       databaseService.getClient();  
      try {
        await databaseService.initializeSampleData();
        console.log('✅ Database initialized successfully');
      } catch (error) {
        console.error('❌ Database sample-data initialization failed:', error);  
      }
    } catch (error) {
      console.error('❌ Database not connected:', error);  
    }
  } else {
    console.log('📝 Using mock data - Supabase not configured');
  }
});
