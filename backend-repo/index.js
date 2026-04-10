import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';

import connectDB from './src/core/DB/connectDb.js';
import authRoutes from './src/routes/auth.routes.js';
import taskRoutes from './src/routes/task.routes.js';
import registerTaskSockets from './src/sockets/task.socket.js';
import { apiLimiter } from './src/core/middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.set('io', io);

registerTaskSockets(io);

app.get('/', (_req, res) => {
  res.json({ message: `Server running on port ${process.env.PORT || 8080}`, success: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({
    success: false,
    message: err?.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

connectDB().then(() => {
  httpServer.listen(process.env.PORT || 8080, () => {
    console.log(`Server running → http://localhost:${process.env.PORT || 8080}`);
  });
}).catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});
