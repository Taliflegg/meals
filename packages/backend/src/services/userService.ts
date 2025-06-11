 

import bcrypt from 'bcryptjs';
import { databaseService } from './database';  

 
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

 
export async function registerUser(payload: RegisterPayload): Promise<Omit<User, 'password_hash'>> {
   
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

   
  const { password_hash, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
}

 
export async function getAllUsers(): Promise<Omit<User, 'password_hash'>[]> { // הסרתי password_hash מהטיפוס המוחזר
  const users = await databaseService.getAllUsers();
  return users.map(u => {
    const { password_hash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
}