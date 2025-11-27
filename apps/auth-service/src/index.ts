import express, { Application, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { logger } from '@sbf/logging';

config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth' });
});

// Register
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, tenantId } = req.body;
    
    // TODO: Validate input
    // TODO: Check if user exists
    // TODO: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // TODO: Create user in database
    // TODO: Create tenant membership
    
    logger.info({ event: 'user_registered', email, tenantId });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Fetch user from database
    // TODO: Verify password
    // const isValid = await bcrypt.compare(password, user.hashedPassword);
    
    // Mock token generation
    const token = jwt.sign(
      { userId: 'mock-user-id', email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    logger.info({ event: 'user_login', email });
    
    res.json({ token, expiresIn: 86400 });
  } catch (error) {
    logger.error({ error });
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Verify token
app.post('/auth/verify', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  logger.info(`SBF Auth Service listening on port ${PORT}`);
});

export default app;
