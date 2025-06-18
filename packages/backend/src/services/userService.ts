 
import bcrypt from 'bcryptjs';  
import jwt from 'jsonwebtoken'; 
import { databaseService } from './database';  

 const JWT_SECRET = process.env.JWT_SECRET;

 export interface User {
  id?: string;
  name: string;  
  email: string;
  password_hash: string;  
  google_id?: string;
  language?: 'he' | 'en';
  created_at?: string;
  updated_at?: string;
}

 export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  language?: 'he' | 'en';
}

/**
 * פונקציה לרישום משתמש חדש במערכת.
  * @param payload  
 * @returns 
 * @throws  
 */
export async function registerUser(payload: RegisterPayload): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
   if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

   const existingUser = await databaseService.getUserByEmail(payload.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

   const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

   const userToSave: Omit<User, 'id' | 'created_at' | 'updated_at' | 'google_id'> = {
    name: payload.username,
    email: payload.email,
    password_hash: hashedPassword,
    language: payload.language || 'en',
  };

   const createdUser = await databaseService.createUser(userToSave);

  console.log('User registered in Supabase:', createdUser);

   const tokenPayload = { userId: createdUser.id, email: createdUser.email };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // הטוקן יהיה תקף לשעה

   const { password_hash, ...userWithoutPassword } = createdUser;
  return { user: userWithoutPassword, token: token };
}

/**
  * @returns  
 * @throws  
 */
export async function getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
  const users = await databaseService.getAllUsers();
   return users.map(u => {
    const { password_hash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
}
