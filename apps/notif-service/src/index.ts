import express, { Application, Request, Response } from 'express';
import admin from 'firebase-admin';
import apn from 'apn';
import { config } from 'dotenv';
import { logger } from '@sbf/logging';

config();

const app: Application = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Initialize Firebase Admin (for Android/FCM)
// TODO: Initialize with service account
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Initialize APN (for iOS)
// TODO: Configure APN provider
// const apnProvider = new apn.Provider({
//   token: {
//     key: process.env.APN_KEY_PATH,
//     keyId: process.env.APN_KEY_ID,
//     teamId: process.env.APN_TEAM_ID
//   },
//   production: process.env.NODE_ENV === 'production'
// });

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notifications' });
});

// Send push notification
app.post('/notifications/send', async (req: Request, res: Response) => {
  try {
    const { userId, title, body, data, platform } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;
    
    logger.info({ 
      event: 'notification_send', 
      tenantId, 
      userId, 
      platform 
    });
    
    // TODO: Get device tokens from database for user
    // TODO: Send to FCM for Android
    // TODO: Send to APN for iOS
    
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Register device token
app.post('/notifications/register', async (req: Request, res: Response) => {
  try {
    const { userId, deviceToken, platform } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;
    
    logger.info({ 
      event: 'device_registered', 
      tenantId, 
      userId, 
      platform 
    });
    
    // TODO: Store device token in database
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ error });
    res.status(500).json({ error: 'Failed to register device' });
  }
});

app.listen(PORT, () => {
  logger.info(`SBF Notification Service listening on port ${PORT}`);
});

export default app;
