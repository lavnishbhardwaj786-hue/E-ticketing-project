import { useEffect, useState, useCallback } from 'react';

export const useWebSocket = (flightId) => {
  const [seatUpdates, setSeatUpdates] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!flightId) return;

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/ws/flights/${flightId}`;

    let ws = null;
    let reconnectTimeout = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`WebSocket connected for flight ${flightId}`);
          setConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Seat update received:', message);
            
            if (message.type === 'seat_booked' || message.type === 'seat_released') {
              setSeatUpdates((prev) => [...prev, message]);
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnected(false);
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (e) {
        console.error('Failed to create WebSocket:', e);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [flightId]);

  return { seatUpdates, connected };
};
