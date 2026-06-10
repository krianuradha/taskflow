import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../../backend/src/index.js';

export const config = {
  api: {
    // Disable Next.js body parsing so Express can handle it
    bodyParser: false,
    // Prevents warnings from Next.js about unresolved requests (Express handles the response)
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pass the request to the Express app
  return app(req, res);
}
