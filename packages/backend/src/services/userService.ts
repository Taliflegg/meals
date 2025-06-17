 // packages/backend/src/services/userService.ts

import bcrypt from 'bcryptjs'; // לייבוא ספריית ההצפנה
import jwt from 'jsonwebtoken'; // לייבוא ספריית JWT
import { databaseService } from './database'; // הנתיב הנכון ל-databaseService

// ודא שהמפתח הסודי של JWT זמין ממשתני הסביבה
const JWT_SECRET = process.env.JWT_SECRET;

// ממשק User (כפי שהוא נשמר במסד הנתונים)
export interface User {
  id?: string;
  name: string; // שם המשתמש
  email: string;
  password_hash: string; // סיסמה מוצפנת
  google_id?: string;
  language?: 'he' | 'en';
  created_at?: string;
  updated_at?: string;
}

// ממשק RegisterPayload (כפי שהתקבל מה-Frontend)
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  language?: 'he' | 'en';
}

/**
 * פונקציה לרישום משתמש חדש במערכת.
 * מצפינה את הסיסמה, יוצרת את המשתמש במסד הנתונים, ויוצרת JWT.
 * @param payload נתוני הרישום מה-Frontend.
 * @returns Promise המכיל את אובייקט המשתמש (ללא סיסמה מוצפנת) ואת טוקן הגישה (access token).
 * @throws Error אם הרישום נכשל (לדוגמה, משתמש כבר קיים, שגיאת מסד נתונים).
 */
export async function registerUser(payload: RegisterPayload): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
  // ודא שמפתח ה-JWT קיים
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  // 1. בדיקה אם משתמש קיים עם האימייל הזה
  const existingUser = await databaseService.getUserByEmail(payload.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2. הצפנת הסיסמה לפני שמירה למסד הנתונים
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  // 3. יצירת אובייקט המשתמש לשמירה במסד הנתונים
  const userToSave: Omit<User, 'id' | 'created_at' | 'updated_at' | 'google_id'> = {
    name: payload.username,
    email: payload.email,
    password_hash: hashedPassword,
    language: payload.language || 'en',
  };

  // 4. שמירה למסד הנתונים באמצעות DatabaseService
  const createdUser = await databaseService.createUser(userToSave);

  console.log('User registered in Supabase:', createdUser);

  // 5. יצירת טוקן JWT עבור המשתמש החדש
  // ה-payload של ה-JWT צריך להכיל מידע שיזהה את המשתמש (לרוב ה-ID שלו)
  const tokenPayload = { userId: createdUser.id, email: createdUser.email };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // הטוקן יהיה תקף לשעה

  // 6. החזרת פרטי המשתמש שנוצר (ללא הסיסמה המוצפנת) והטוקן
  const { password_hash, ...userWithoutPassword } = createdUser;
  return { user: userWithoutPassword, token: token };
}

/**
 * פונקציה לשליפת כל המשתמשים מטבלת הפרופיל הציבורית.
 * @returns Promise<Omit<User, 'password_hash'>[]> - מערך של אובייקטי משתמשים (ללא סיסמאות מוצפנות).
 * @throws Error אם יש שגיאת מסד נתונים.
 */
export async function getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
  const users = await databaseService.getAllUsers();
  // הסרת הסיסמה המוצפנת מהאובייקטים לפני החזרתם ללקוח
  return users.map(u => {
    const { password_hash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
}
