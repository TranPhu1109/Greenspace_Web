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
    this.currentUserId = null;
    this.currentUserRole = null;
  }

  startConnection = async (userId = null, userRole = null) => {
    // Get user info from localStorage if not provided
    if (!userId || !userRole) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      userId = userId || user.id;
      userRole = userRole || user.roleName;
    }

    // Check if we need to reconnect with different user
    const needsNewConnection = this.currentUserId !== userId || this.currentUserRole !== userRole;

    if (needsNewConnection && this.connectionStarted) {
      console.log(`🔄 User changed (${this.currentUserId} -> ${userId}), creating new connection...`);
      await this.stopConnection();
    }

    // Store current user info
    this.currentUserId = userId;
    this.currentUserRole = userRole;

    // If connection is already being established, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected with same user, return existing connection
    if (this.connectionStarted && this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log(`SignalR connection already active for user: ${userId}`);
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
      // Add headers for better compatibility and user identification
      accessTokenFactory: () => {
        // Add any auth token if needed
        return null;
      },
      // Add timeout configurations to handle connection ID issues
      timeout: 30000, // 30 seconds timeout
      // Add headers to help with connection tracking
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    // Add user identification to query string for server-side user tracking
    if (this.currentUserId && this.currentUserRole) {
      transportConfig.query = {
        userId: this.currentUserId,
        userRole: this.currentUserRole,
        timestamp: Date.now(), // Add timestamp to ensure unique connections
        sessionId: `${this.currentUserId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      };
    }

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
          console.log(`🔄 SignalR Auto-reconnect attempt ${retryContext.previousRetryCount + 1}`);

          // Handle "No Connection with that ID" errors by creating fresh connection
          if (retryContext.retryReason?.message?.includes('No Connection with that ID')) {
            console.log('🔄 Connection ID issue detected, creating fresh connection...');
            return 0; // Immediate retry with fresh connection
          }

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
      console.log(`👤 User: ${this.currentUserId} (${this.currentUserRole})`);
      console.log(`🔑 Session: ${transportConfig.query?.sessionId || 'N/A'}`);

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
      userAgent: navigator.userAgent,
      currentUser: this.getCurrentUser()
    });

    // Check for specific error types and provide helpful messages
    if (error.message?.includes('Unable to connect to the server')) {
      console.error("❌ SignalR Server Connection Failed:");
      console.error("   - Check if backend server is running");
      console.error("   - Verify SignalR Hub URL:", HUB_URL);
      console.error("   - Check CORS configuration on server");
      console.error("   - Verify network connectivity");
    }

    if (error.message?.includes('WebSocket failed to connect')) {
      console.error("❌ WebSocket Connection Failed:");
      console.error("   - WebSocket may be blocked by proxy/firewall");
      console.error("   - Server may not support WebSocket transport");
      console.error("   - Check if sticky sessions are enabled (load balancer)");
    }

    if (error.message?.includes('No Connection with that ID')) {
      console.error("❌ Connection ID Not Found:");
      console.error("   - Server may have restarted (common with Azure Container Apps)");
      console.error("   - Connection may have timed out during negotiate");
      console.error("   - Check server connection management");
      console.error("   - Will attempt to create new connection...");
    }

    if (error.message?.includes('404')) {
      console.error("❌ SignalR Hub Not Found (404):");
      console.error("   - Verify SignalR Hub endpoint:", HUB_URL);
      console.error("   - Check if SignalR is properly configured on server");
      console.error("   - Verify routing configuration");
    }
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

  // Reset connection for user logout/switch
  resetConnection = async () => {
    console.log('🔄 Resetting SignalR connection...');
    await this.stopConnection();
    this.currentUserId = null;
    this.currentUserRole = null;
    this.reconnectAttempts = 0;
    console.log('✅ SignalR connection reset completed');
  };

  // Get current user info
  getCurrentUser = () => {
    return {
      userId: this.currentUserId,
      userRole: this.currentUserRole
    };
  };

  // Health check for SignalR connection
  healthCheck = async () => {
    try {
      if (!this.connection) {
        return { status: 'disconnected', message: 'No connection instance' };
      }

      const state = this.getConnectionState();
      const isConnected = this.isConnected();

      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        connectionState: state,
        connectionId: this.connection.connectionId,
        hubUrl: HUB_URL,
        user: this.getCurrentUser(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Test connection to server
  testConnection = async () => {
    try {
      console.log('🔍 Testing SignalR connection to:', HUB_URL);

      // Try to fetch the hub endpoint to check if server is reachable
      const response = await fetch(HUB_URL.replace('/hub', '/api/health'), {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        console.log('✅ Server is reachable');
        return { reachable: true, status: response.status };
      } else {
        console.warn('⚠️ Server responded with error:', response.status);
        return { reachable: false, status: response.status };
      }
    } catch (error) {
      console.error('❌ Server is not reachable:', error.message);
      return { reachable: false, error: error.message };
    }
  };

}

// Export a singleton instance
const signalRService = new SignalRService();
export default signalRService; 