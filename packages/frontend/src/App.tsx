import React, { useState, useEffect } from 'react';
import { Event } from '@eventix/shared';
import { apiService } from './services/api';  
import EventCard from './components/EventCard';
import SignupForm from './components/SignupForm';  
import './App.css';  

function App() {  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>('checking...');

  useEffect(() => {
    loadEvents();
    checkHealth();
  }, []);

   const checkHealth = async () => {
    try {
      const health = await apiService.checkHealth();
      setHealthStatus(health.success ? 'healthy' : 'unhealthy');
    } catch (err) {
      setHealthStatus('unhealthy');
    }
  };

  // פונקציה לטעינת אירועים מה-Backend
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await apiService.getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event: Event) => {
    try {
      const fullEvent = await apiService.getEvent(event.id);
      setSelectedEvent(fullEvent);
    } catch (err) {
      console.error('Failed to fetch event details:', err);
    }
  };

  const clearSelection = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eventix</h1>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Backend Status: <span style={{ 
            color: healthStatus === 'healthy' ? 'lightgreen' : 'salmon',
            fontWeight: 'bold'
          }}>{healthStatus}</span>
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* הצגת טופס ההרשמה בחלק העליון של העמוד */}
        <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
          <SignupForm />
        </div>

         {selectedEvent ? (
          <div>
            <button 
              onClick={clearSelection}
              style={{
                marginBottom: '20px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back to Events
            </button>
            <h2>Event Details</h2>
            <EventCard event={selectedEvent} />
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2>Events ({events.length})</h2>
              <button 
                onClick={loadEvents}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                Error: {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Loading events...
              </div>
            ) : events.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={handleEventClick}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No events found
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
 