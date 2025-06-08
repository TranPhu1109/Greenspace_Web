import { useEffect, useRef, useCallback } from 'react';
import signalRService from '../services/signalRService';

/**
 * Custom hook for managing SignalR connections and event listeners
 * Optimized for Vercel deployment with proper cleanup and error handling
 * 
 * @param {string} eventName - The SignalR event to listen for
 * @param {function} callback - The callback function to execute when event is received
 * @param {object} options - Configuration options
 * @param {boolean} options.autoConnect - Whether to auto-connect on mount (default: true)
 * @param {boolean} options.enabled - Whether the hook is enabled (default: true)
 * @param {array} options.dependencies - Dependencies for the callback (default: [])
 * @returns {object} - Connection state and control functions
 */
export const useSignalR = (eventName, callback, options = {}) => {
  const {
    autoConnect = true,
    enabled = true,
    dependencies = []
  } = options;

  const callbackRef = useRef(callback);
  const isListenerRegistered = useRef(false);
  const componentId = useRef(`SignalR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  // Stable callback that uses the ref
  const stableCallback = useCallback((...args) => {
    if (callbackRef.current && typeof callbackRef.current === 'function') {
      callbackRef.current(...args);
    }
  }, []);

  // Connect to SignalR
  const connect = useCallback(async () => {
    if (!enabled) return null;

    try {
      // Get user info from localStorage for user-specific connection
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      const userRole = user.roleName;

      console.log(`[${componentId.current}] 🔌 Connecting to SignalR for user: ${userId} (${userRole})...`);
      const connection = await signalRService.startConnection(userId, userRole);

      // Register event listener if not already registered
      if (eventName && !isListenerRegistered.current) {
        signalRService.on(eventName, stableCallback);
        isListenerRegistered.current = true;
        console.log(`[${componentId.current}] 📡 Registered listener for: ${eventName}`);
      }

      return connection;
    } catch (error) {
      console.error(`[${componentId.current}] ❌ Failed to connect to SignalR:`, error);
      throw error;
    }
  }, [enabled, eventName, stableCallback]);

  // Disconnect from SignalR
  const disconnect = useCallback(async () => {
    try {
      if (eventName && isListenerRegistered.current) {
        signalRService.off(eventName, stableCallback);
        isListenerRegistered.current = false;
        console.log(`[${componentId.current}] 🔇 Unregistered listener for: ${eventName}`);
      }
    } catch (error) {
      console.error(`[${componentId.current}] ❌ Error during disconnect:`, error);
    }
  }, [eventName, stableCallback]);

  // Get connection state
  const getConnectionState = useCallback(() => {
    return signalRService.getConnectionState();
  }, []);

  // Check if connected
  const isConnected = useCallback(() => {
    return signalRService.isConnected();
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (!enabled || !autoConnect) return;

    let isMounted = true;

    const initConnection = async () => {
      try {
        await connect();
      } catch (error) {
        if (isMounted) {
          console.error(`[${componentId.current}] ❌ Auto-connect failed:`, error);
        }
      }
    };

    initConnection();

    return () => {
      isMounted = false;
    };
  }, [enabled, autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`[${componentId.current}] 🧹 Cleaning up SignalR hook`);
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    getConnectionState,
    isConnected,
    componentId: componentId.current
  };
};

/**
 * Simplified hook for just listening to SignalR events
 * Most common use case - just listen to messageReceived events
 * 
 * @param {function} callback - The callback function to execute when messageReceived event is fired
 * @param {array} dependencies - Dependencies for the callback
 * @returns {object} - Connection state and control functions
 */
export const useSignalRMessage = (callback, dependencies = []) => {
  return useSignalR('messageReceived', callback, {
    autoConnect: true,
    enabled: true,
    dependencies
  });
};

/**
 * Hook for components that need to control SignalR connection manually
 * Useful for components that need to connect/disconnect based on certain conditions
 * 
 * @returns {object} - Connection control functions and state
 */
export const useSignalRConnection = () => {
  return useSignalR(null, null, {
    autoConnect: false,
    enabled: true
  });
};

export default useSignalR;
