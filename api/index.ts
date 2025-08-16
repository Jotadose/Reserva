import { VercelRequest, VercelResponse } from '@vercel/node';
import app from './bookings';

export default (req: VercelRequest, res: VercelResponse) => {
  // Delegate to Express app
  app(req, res);
};
