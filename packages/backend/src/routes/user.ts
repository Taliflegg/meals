 // packages/backend/src/routes/user.ts

import * as express from 'express'; // Import express as a module
import { Request, Response, NextFunction } from 'express'; // Import specific Express types
import { registerUser, getAllUsers } from '../services/userService'; // Import user service functions

const router = express.Router(); // Create an Express Router instance

// POST /api/users/register - User registration endpoint
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, language } = req.body;

    // Basic validation for required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'חסרים שדות חובה: שם משתמש, אימייל, סיסמה.' });
    }

    // Call the registration service, expecting user data and a JWT token
    const { user, token } = await registerUser({ username, email, password, language });

    // Set the JWT token as an HttpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true, // Prevents client-side JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      // @ts-ignore // Temporarily ignore if 'sameSite' type is missing in your Express types
      sameSite: 'Lax', // CSRF protection
      maxAge: 3600000, // Cookie expiration: 1 hour (in milliseconds)
    });

    // Return success response with user details (token is in cookie)
    res.status(201).json({
      message: 'המשתמש נרשם בהצלחה!',
      user: user,
    });
  } catch (error: any) {
    console.error('Error during user registration:', error);

    // Handle specific "user already exists" error
    if (error.message === "User already exists") {
      return res.status(409).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת. אנא נסה אימייל אחר.' });
    }

    // Handle generic server errors
    res.status(500).json({ message: error.message || 'שגיאה פנימית בשרת.' });
  }
});

// GET /api/users - Endpoint to retrieve all users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers(); // Call service to get all users
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'שגיאה פנימית.' });
  }
});

export default router; // Export the router for use in index.ts
