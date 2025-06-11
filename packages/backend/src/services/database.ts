 
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

import { User, RegisterPayload } from '../services/userService';
import { Event } from '@eventix/shared';  

export class DatabaseService {
  private readonly eventsTableName = 'events';
  private readonly usersTableName = 'users'; // שם הטבלה למשתמשים
  private supabase: SupabaseClient | null = null;

   
  private readonly columnMapping = {
    toSnake: {
      mealType: 'meal_type',
      expectedCount: 'expected_count',
      actualCount: 'actual_count',
      createdBy: 'created_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
       
    } as const,
    toCamel: {
      meal_type: 'mealType',
      expected_count: 'expectedCount',
      actual_count: 'actual_count',
      created_by: 'createdBy',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      
      // google_id: 'googleId',
    } as const
  };

  private getClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = process.env.SUPABASE_URL as string;
       
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY as string;

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

   
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'google_id'>): Promise<User> {
    try {
       
      const userToInsert = {
        name: userData.name, 
        email: userData.email,
        password_hash: userData.password_hash,  
        language: userData.language,  
      };

      const { data, error } = await this.getClient()
        .from(this.usersTableName)
        .insert([userToInsert])
        .select() 
        .single(); 

      if (error) {
        console.error('Database error creating user:', error);
        throw new Error('Failed to create user in database');
      }

       
      return data as User;  
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

   
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from(this.usersTableName)
        .select('*')
        .eq('email', email)  
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // משתמש לא נמצא
        }
        console.error('Database error fetching user by email:', error);
        throw new Error('Failed to fetch user from database');
      }

      return data as User; 
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