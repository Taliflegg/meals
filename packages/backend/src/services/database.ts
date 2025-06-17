// packages/backend/src/services/database.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // **וודא ששורה זו היא הראשונה בראש הקובץ!**

// ייבא את ממשק User מ-userService.
// אם אתה משתמש בקובץ משותף כמו @eventix/shared, וודא שהממשקים מתואמים.
import { User } from '../services/userService';
import { Event } from '@eventix/shared';

export class DatabaseService {
  private readonly eventsTableName = 'events';
  private readonly usersTableName = 'users'; // שם הטבלה למשתמשים
  private supabase: SupabaseClient | null = null;

  // מיפוי בין camelCase ל-snake_case (השאר כפי שהיה, אם בשימוש)
  private readonly columnMapping = {
    toSnake: {
      mealType: 'meal_type',
      expectedCount: 'expected_count',
      actualCount: 'actual_count',
      createdBy: 'created_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      // ייתכן שתצטרך להוסיף כאן מיפויים לשדות בטבלת users אם שמותיהם שונים בין קוד ל-DB
      // לדוגמה, אם יש לך username בקוד אבל user_name ב-DB:
      // username: 'user_name',
      // googleId: 'google_id',
    } as const,
    toCamel: {
      meal_type: 'mealType',
      expected_count: 'expected_count',
      actual_count: 'actual_count',
      created_by: 'createdBy',
      created_at: 'createdAt',
      updated_at: 'updated_at',
      // לדוגמה: user_name: 'username',
      // google_id: 'googleId',
    } as const
  };

 getClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = process.env.SUPABASE_URL as string;
      // ננסה להשתמש ב-SERVICE_ROLE_KEY אם קיים, אחרת ב-ANON_KEY
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY as string;

      // **חשוב לאבחון:** הדפסת 5 התווים הראשונים של המפתח בשימוש
      console.log('Using Supabase Key (first 5 chars):', supabaseKey ? supabaseKey.substring(0, 5) : 'NONE');
      console.log('Using Supabase URL:', supabaseUrl);


      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration. Please check your environment variables.');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this.supabase;
  }

  canInitialize(): boolean {
    return this.getClient() !== null;
  }

  // --- מתודות עבור משתמשים (מותאמות לטבלה שלך) ---

  // פונקציה ליצירת משתמש חדש בטבלת 'users'
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      // אובייקט הנתונים שאנו שולחים ל-Supabase.
      // המפתחות חייבים להתאים לשמות העמודות בטבלה שלך.
      const userToInsert = {
        name: userData.name, // <-- תואם לעמודה 'name' ב-DB
        email: userData.email,
        password_hash: userData.password_hash, // <-- תואם לעמודה 'password_hash' ב-DB
        language: userData.language, // תואם לעמודה 'language' ב-DB
        google_id: (userData as User).google_id || null, // <-- הוספתי טיפול ב-google_id (אם קיים ב-userData או null)
        // created_at ו-updated_at יטופלו ע"י Supabase אם מוגדרים כ-DEFAULT NOW() בטבלה
      };

      const { data, error } = await this.getClient()
        .from(this.usersTableName)
        .insert([userToInsert])
        .select() // קבל את הרשומה המלאה שנוצרה מ-Supabase
        .single(); // מצפים לרשומה אחת

      if (error) {
        console.error('Database error creating user:', error);
        throw new Error('Failed to create user in database');
      }

      // Supabase יחזיר את האובייקט עם שמות העמודות כפי שהן ב-DB (snake_case)
      // אם תצטרך להמיר ל-camelCase, תצטרך להוסיף מיפוי כאן או להשתמש ב-utility function
      return data as User; // הנחה ש-Supabase מחזיר אובייקט User תקין
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // פונקציה לקבלת משתמש לפי אימייל
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from(this.usersTableName)
        .select('*')
        .eq('email', email) // חפש לפי עמודת 'email'
        .single();

      if (error) {
        // אם לא נמצא, Supabase יזרוק שגיאה עם קוד מסוים (לדוגמה PGRST116 אם השתמשת ב-single)
        if (error.code === 'PGRST116') {
          return null; // משתמש לא נמצא
        }
        console.error('Database error fetching user by email:', error);
        throw new Error('Failed to fetch user from database');
      }

      return data as User; // הנתונים שחזרו
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  // פונקציה לקבלת כל המשתמשים
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await this.getClient()
        .from(this.usersTableName)
        .select('*');

      if (error) {
        console.error('Database error fetching all users:', error);
        throw new Error('Failed to fetch all users from database');
      }
      return (data || []) as User[];
    } catch (error) {
      console.error('Error in getAllUsers (database):', error);
      throw error;
    }
  }

  // --- מתודות קיימות עבור אירועים (השאר אותן ללא שינוי, אלא אם מבנה טבלת events שונה) ---
  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await this.getClient()
        .from(this.eventsTableName)
        .select('*')
        .order('datetime', { ascending: true });

      if (error) {
        console.error('Database error fetching events:', error);
        throw new Error('Failed to fetch events from database');
      }
      return (data || []).map(event =>
        Object.fromEntries(
          Object.entries(event).map(([k, v]) => [
            (this.columnMapping.toCamel as Record<string, string>)[k] || k,
            v
          ])
        ) as unknown as Event
      );
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      const { data, error } = await this.getClient()
        .from(this.eventsTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Database error fetching event:', error);
        throw new Error('Failed to fetch event from database');
      }

      return Object.fromEntries(
        Object.entries(data).map(([k, v]) => [
          (this.columnMapping.toCamel as Record<string, string>)[k] || k,
          v
        ])
      ) as unknown as Event;
    } catch (error) {
      console.error('Error in getEventById:', error);
      throw error;
    }
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const snakeCaseEvent = Object.fromEntries(
        Object.entries(event).map(([k, v]) => [
          (this.columnMapping.toSnake as Record<string, string>)[k] || k,
          v
        ])
      );
      
      const { data, error } = await this.getClient()
        .from(this.eventsTableName)
        .insert([snakeCaseEvent])
        .select()
        .single();

      if (error) {
        console.error('Database error creating event:', error);
        throw new Error('Failed to create event in database');
      }

      return Object.fromEntries(
        Object.entries(data).map(([k, v]) => [
          (this.columnMapping.toCamel as Record<string, string>)[k] || k,
          v
        ])
      ) as unknown as Event;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  }

  async initializeSampleData(): Promise<void> {
    try {
      const events = await this.getAllEvents();
      
      if (events.length === 0) {
        console.log('Initializing database with sample events...');
        
        const sampleEvents = [
          {
            title: 'Team Dinner',
            description: 'Monthly team dinner at Italian restaurant',
            location: '123 Main St, City',
            datetime: new Date('2024-04-15T19:00:00'),
            language: 'en' as const,
            mealType: 'meat' as const,
            expectedCount: 10,
            actualCount: 0,
            createdBy: '00000000-0000-0000-0000-000000000001',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            title: 'Vegan Potluck',
            description: 'Bring your favorite vegan dish to share',
            location: '456 Park Ave, City',
            datetime: new Date('2024-04-20T18:00:00'),
            language: 'en' as const,
            mealType: 'vegan' as const,
            expectedCount: 15,
            actualCount: 0,
            createdBy: '00000000-0000-0000-0000-000000000002',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        for (const event of sampleEvents) {
          await this.createEvent(event);
        }
        console.log('Sample events initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }
}

export const databaseService = new DatabaseService();