import * as signalR from "@microsoft/signalr";

// const HUB_URL = "/hub";
const HUB_URL = import.meta.env.VITE_SIGNALR_URL;

class SignalRService {
  constructor() {
    this.connection = null;
    this.connectionStarted = false;
    this.connectionPromise = null;
    this.listeners = new Map(); // Track listeners for cleanup
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isProduction = import.meta.env.PROD;
  }

  startConnection = async () => {
    // If connection is already being established, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, return existing connection
    if (this.connectionStarted && this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("SignalR connection already active.");
      return this.connection;
    }

    // Create new connection promise
    this.connectionPromise = this._createConnection();

    try {
      const connection = await this.connectionPromise;
      this.connectionPromise = null;
      return connection;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  };

  _createConnection = async () => {
    console.log("🔄 Creating new SignalR connection...");

    // Configure transport types with fallback for Vercel deployment
    const transportConfig = {
      skipNegotiation: false, // Let SignalR negotiate the best transport
      transport: signalR.HttpTransportType.WebSockets |
                 signalR.HttpTransportType.ServerSentEvents |
                 signalR.HttpTransportType.LongPolling,
      // Add headers for better compatibility
      accessTokenFactory: () => {
        // Add any auth token if needed
        return null;
      }
    };

    // For production (Vercel), add additional configuration
    if (this.isProduction) {
      transportConfig.withCredentials = false;
      transportConfig.headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, transportConfig)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Exponential backoff: 0, 2, 10, 30 seconds, then every 30 seconds
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        }
      })
      .configureLogging(this.isProduction ? signalR.LogLevel.Warning : signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    this._setupEventHandlers();

    try {
      await this.connection.start();
      this.connectionStarted = true;
      this.reconnectAttempts = 0;
      console.log("✅ SignalR Connected successfully");
      console.log(`🔗 Connection ID: ${this.connection.connectionId}`);
      console.log(`🚀 Transport: ${this.connection.transport?.name || 'Unknown'}`);

      return this.connection;
    } catch (err) {
      console.error("❌ SignalR Connection Error: ", err);
      this.connectionStarted = false;
      this._handleConnectionError(err);
      throw err;
    }
  };

  _setupEventHandlers = () => {
    if (!this.connection) return;

    // Handle connection closed
    this.connection.onclose(async (error) => {
      console.warn("🔌 SignalR Connection closed", error);
      this.connectionStarted = false;
      this.connectionPromise = null;

      // Clear all listeners on disconnect
      this.listeners.clear();

      if (error && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;

        // Wait before reconnecting
        setTimeout(() => {
          this.startConnection().catch(err => {
            console.error("❌ Reconnection failed:", err);
          });
        }, 2000 * this.reconnectAttempts); // Exponential backoff
      }
    });

    // Handle reconnecting
    this.connection.onreconnecting((error) => {
      console.log("🔄 SignalR Reconnecting...", error);
      this.connectionStarted = false;
    });

    // Handle reconnected
    this.connection.onreconnected((connectionId) => {
      console.log("✅ SignalR Reconnected", connectionId);
      this.connectionStarted = true;
      this.reconnectAttempts = 0;

      // Re-register all listeners
      this._reregisterListeners();
    });
  };

  _handleConnectionError = (error) => {
    console.error("🚨 SignalR Connection Error Details:", {
      message: error.message,
      stack: error.stack,
      hubUrl: HUB_URL,
      isProduction: this.isProduction,
      userAgent: navigator.userAgent
    });
  };

  _reregisterListeners = () => {
    console.log("🔄 Re-registering SignalR listeners after reconnection");
    for (const [eventName, callbacks] of this.listeners.entries()) {
      for (const callback of callbacks) {
        this.connection.on(eventName, callback);
      }
    }
  };

  stopConnection = async () => {
    if (this.connectionPromise) {
      try {
        await this.connectionPromise;
      } catch (error) {
        // Ignore errors when stopping
      }
    }

    if (this.connection && this.connectionStarted) {
      try {
        // Clear all listeners before stopping
        this.listeners.clear();

        await this.connection.stop();
        console.log("🛑 SignalR Connection stopped");
        this.connectionStarted = false;
        this.connectionPromise = null;
      } catch (err) {
        console.error("❌ Error stopping SignalR connection:", err);
      }
    }
  };

  // Method to add a listener for a specific event
  on = (eventName, callback) => {
    if (!callback || typeof callback !== 'function') {
      console.error("❌ SignalR: Invalid callback provided");
      return;
    }

    // Store the original callback for cleanup
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    // If connection exists, register immediately
    if (this.connection) {
      // Wrap the callback for better debugging (only in development)
      const wrappedCallback = this.isProduction ? callback : (...args) => {
        console.group(`🟢 SignalR Event: ${eventName}`);
        console.log("Received data:", args);
        console.groupEnd();
        callback(...args);
      };

      this.connection.on(eventName, wrappedCallback);
      console.log(`📡 [SignalR] Listening on event: "${eventName}"`);
    } else {
      console.warn(`⚠️ [SignalR] Connection not ready. Event "${eventName}" will be registered when connected.`);
    }
  };

  // Method to remove a listener for a specific event
  off = (eventName, callback) => {
    if (!this.connection) {
      console.warn("⚠️ SignalR connection not initialized.");
      return;
    }

    // Remove from our tracking
    if (this.listeners.has(eventName)) {
      if (callback) {
        this.listeners.get(eventName).delete(callback);
        if (this.listeners.get(eventName).size === 0) {
          this.listeners.delete(eventName);
        }
      } else {
        // Remove all listeners for this event
        this.listeners.delete(eventName);
      }
    }

    // Remove from SignalR connection
    if (callback) {
      this.connection.off(eventName, callback);
    } else {
      this.connection.off(eventName);
    }

    console.log(`🔇 [SignalR] Stopped listening on event: "${eventName}"`);
  };

  // Get connection state
  getConnectionState = () => {
    if (!this.connection) return 'Disconnected';

    const states = {
      [signalR.HubConnectionState.Disconnected]: 'Disconnected',
      [signalR.HubConnectionState.Connecting]: 'Connecting',
      [signalR.HubConnectionState.Connected]: 'Connected',
      [signalR.HubConnectionState.Disconnecting]: 'Disconnecting',
      [signalR.HubConnectionState.Reconnecting]: 'Reconnecting'
    };

    return states[this.connection.state] || 'Unknown';
  };

  // Check if connection is ready
  isConnected = () => {
    return this.connectionStarted &&
           this.connection?.state === signalR.HubConnectionState.Connected;
  };

}

// Export a singleton instance
const signalRService = new SignalRService();
export default signalRService; 