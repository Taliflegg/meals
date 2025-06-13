import { Router } from 'express';
import { Event, EventsResponse, EventResponse } from '@eventix/shared';
import { databaseService } from '../services/database';


const router = Router();

// Fallback mock data (used if database is not available)
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Team Dinner',
    description: 'Monthly team dinner at Italian restaurant',
    location: '123 Main St, City',
    datetime: new Date('2024-04-15T19:00:00'),
    language: 'en',
    mealType: 'meat',
    expectedCount: 10,
    actualCount: 0,
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Vegan Potluck',
    description: 'Bring your favorite vegan dish to share',
    location: '456 Park Ave, City',
    datetime: new Date('2024-04-20T18:00:00'),
    language: 'en',
    mealType: 'vegan',
    expectedCount: 15,
    actualCount: 0,
    createdBy: 'user2',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Determine if we should use database or mock data
const useDatabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    let events: Event[];
    
    if (useDatabase) {
      events = await databaseService.getAllEvents();
    } else {
      console.log('Using mock data - database not configured');
      events = mockEvents;
    }

    const response: EventsResponse = {
      success: true,
      data: events
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Fallback to mock data if database fails
    const response: EventsResponse = {
      success: true,
      data: mockEvents
    };
    res.json(response);
  }
});

// GET /api/events/:id - Get specific event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let event: Event | null = null;
    
    if (useDatabase) {
      event = await databaseService.getEventById(id);
    } else {
      console.log('Using mock data - database not configured');
      event = mockEvents.find(event => event.id === id) || null;
    }
    
    if (!event) {
      const response = {
        success: false,
        error: 'Event not found',
      };
      return res.status(404).json(response);
    }
    
    const response: EventResponse = {
      success: true,
      data: event
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching event:', error);
    
    // Fallback to mock data if database fails
    const event = mockEvents.find(event => event.id === req.params.id);
    if (!event) {
      const response = {
        success: false,
        error: 'Event not found',
      };
      return res.status(404).json(response);
    }
    const response: EventResponse = {
      success: true,
      data: event
    };
    res.json(response);
  }
});

export default router;