import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  parking: process.env.PARKING_SERVICE_URL || 'http://localhost:3003',
  booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  blog: process.env.BLOG_SERVICE_URL || 'http://localhost:3006',
  support: process.env.SUPPORT_SERVICE_URL || 'http://localhost:3007',
};

const proxyRequest = async (serviceUrl: string, req: express.Request, res: express.Response) => {
  try {
    const url = `${serviceUrl}${req.originalUrl}`;
    console.log(`Proxying to: ${url}`);

    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: { ...req.headers, host: undefined },
      params: req.query,
      validateStatus: () => true, // Allow all status codes to be handled as success
    });

    // Forward response headers
    Object.entries(response.headers).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value as string | string[]);
      }
    });

    res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error(`Proxy error: ${error.message}`);
    res.status(500).json({ message: 'Service unavailable' });
  }
};

app.use('/api/auth', (req, res) => proxyRequest(services.auth, req, res));
app.use('/api/users', (req, res) => proxyRequest(services.auth, req, res));

app.use('/api/parkings', (req, res) => proxyRequest(services.parking, req, res));
app.use('/api/sensors', (req, res) => proxyRequest(services.parking, req, res));

app.use('/api/bookings', (req, res) => proxyRequest(services.booking, req, res));

app.use('/api/tariffs', (req, res) => proxyRequest(services.payment, req, res));
app.use('/api/balance', (req, res) => proxyRequest(services.payment, req, res));
app.use('/api/transactions', (req, res) => proxyRequest(services.payment, req, res));
app.use('/api/subscriptions', (req, res) => proxyRequest(services.payment, req, res));

app.use('/api/blog', (req, res) => proxyRequest(services.blog, req, res));

app.use('/api/contact', (req, res) => proxyRequest(services.support, req, res));
app.use('/api/support', (req, res) => proxyRequest(services.support, req, res));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Gateway OK' });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Gateway running on port ${PORT}`);
  });
}

export { app };