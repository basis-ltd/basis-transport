import express, { Application } from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import { AppDataSource } from './data-source';
import errorHandler from './middlewares/errors.middleware';
import routes from './routes';
import logger from './helpers/logger.helper';

// CREATE EXPRESS APP
const app: Application = express();

// Use morgan for HTTP request logging
app.use(morgan('dev'));  // Using 'dev' format for more detailed logs

// Set up middleware in the correct order
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Apply API routes (authentication and audit middleware are applied in routes/index.ts)
app.use('/api', routes);

// Error handling middleware should always be last
app.use(errorHandler);

// DATABASE CONNECTION
AppDataSource.initialize()
  .then(() => {
    logger.success(`${process.env.DB_NAME} connected`);
  })
  .catch((error) => {
    logger.error('Database connection failed', error);
  });

// ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Transport Management API' });
});

export default app;
