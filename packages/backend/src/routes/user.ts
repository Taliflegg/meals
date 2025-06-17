 // packages/backend/src/routes/user.ts

import * as express from 'express'; // ייבוא express כמודול, פותר בעיות טיפוסים
import { Request, Response, NextFunction } from 'express'; // ייבוא טיפוסים ספציפיים ל-Express
import { registerUser, getAllUsers } from '../services/userService'; // ייבוא פונקציות השירות

const router = express.Router(); // יצירת מופע של Express Router

// POST /api/users/register - נקודת קצה לרישום משתמש חדש
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // שליפת הנתונים מגוף הבקשה
    const { username, email, password, language } = req.body;

    // ולידציה בסיסית של שדות חובה
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'חסרים שדות חובה: שם משתמש, אימייל, סיסמה.' });
    }

    // קריאה לפונקציית הרישום משכבת השירות
    // מצפים לקבל בחזרה גם את אובייקט המשתמש וגם את הטוקן
    const { user, token } = await registerUser({ username, email, password, language });

    // החזרת תגובת הצלחה עם הודעה, פרטי המשתמש והטוקן
    res.status(201).json({
      message: 'המשתמש נרשם בהצלחה!',
      user: user, // פרטי המשתמש שנוצר
      token: token, // טוקן הגישה החדש שנוצר
    });
  } catch (error: any) {
    console.error('שגיאה ברישום משתמש:', error); // הדפסת השגיאה ללוג השרת

    // טיפול בשגיאה ספציפית של "משתמש כבר קיים"
    if (error.message === "User already exists") {
      return res.status(409).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת. אנא נסה אימייל אחר.' });
    }

    // טיפול בשגיאות כלליות
    res.status(500).json({ message: error.message || 'שגיאה פנימית בשרת.' });
  }
});

// GET /api/users - נקודת קצה לקבלת כל המשתמשים (לדוגמה, למטרות בדיקה/ניהול)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers(); // קריאה לפונקציה משכבת השירות
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'שגיאה פנימית.' });
  }
});

export default router; // ייצוא הראוטר לשימוש ב-index.ts
