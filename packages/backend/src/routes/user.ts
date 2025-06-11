 

import express from 'express';
 
import { registerUser, getAllUsers } from '../services/userService';

const router = express.Router();

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    
    const { username, email, password, language } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'חסרים שדות חובה: שם משתמש, אימייל, סיסמה.' });
    }

   
    const registrationPayload = {
      username: username,
      email: email,
      password: password,
      language: language  
    };

    
    await registerUser(registrationPayload);  
    // אם הרישום הצליח
    res.status(201).json({ message: 'המשתמש נרשם בהצלחה!' });
  } catch (error: any) {
    console.error('שגיאה ברישום משתמש:', error);

    
    if (error.message === "User already exists") {
      return res.status(409).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת. אנא נסה אימייל אחר.' });
    }

    
    res.status(500).json({ message: error.message || 'שגיאה פנימית בשרת.' });
  }
});

 
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'שגיאה פנימית.' });
  }
});

export default router;


