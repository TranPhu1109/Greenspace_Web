import * as signalR from "@microsoft/signalr";

// const HUB_URL = "/hub";
const HUB_URL = import.meta.env.VITE_SIGNALR_URL;

class SignalRService {
  constructor() {
    this.connection = null;
    this.connectionStarted = false;
  }

  startConnection = async () => {
    if (this.connectionStarted) {
      console.log("SignalR connection already started.");
      return this.connection;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Optional: configure transport types or other options
        // skipNegotiation: true, // Example option
        // transport: signalR.HttpTransportType.WebSockets // Example option
      })
      .withAutomaticReconnect() // Automatically attempts to reconnect if the connection is lost
      .configureLogging(signalR.LogLevel.Information) // Optional: configure logging level
      .build();

    try {
      await this.connection.start();
      this.connectionStarted = true;
      console.log("SignalR Connected.");

      this.connection.onclose(async (error) => {
        console.error("SignalR Connection closed.", error);
        this.connectionStarted = false;
        // Optional: implement custom logic on disconnection, like attempting to restart
        // await this.startConnection(); // Be careful with potential infinite loops
      });

      return this.connection;
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      this.connectionStarted = false;
      // Optional: attempt to reconnect after a delay
      // setTimeout(this.startConnection, 5000);
      throw err; // Rethrow error to be handled by the caller
    }
  };

  stopConnection = async () => {
    if (this.connection && this.connectionStarted) {
      try {
        await this.connection.stop();
        console.log("SignalR Connection stopped.");
        this.connectionStarted = false;
      } catch (err) {
        console.error("Error stopping SignalR connection:", err);
      }
    }
  };

  // Method to add a listener for a specific event
  on = (eventName, callback) => {
    if (!this.connection) {
      console.error("SignalR connection not initialized. Call startConnection first.");
      return;
    }
    
    // Wrap the callback to log the received data
    const wrappedCallback = (...args) => {
      console.group(`🟢 SignalR Event: ${eventName}`);
      console.log("Received data:", args);
      console.groupEnd();
      
      // Call the original callback
      callback(...args);
    };
    
    this.connection.on(eventName, wrappedCallback);
    console.log(`[SignalR] Listening on event: "${eventName}"`);
  };

  // Method to remove a listener for a specific event
  off = (eventName, callback) => {
    if (!this.connection) {
      console.error("SignalR connection not initialized.");
      return;
    }
    
    // Since we're wrapping callbacks, we need to be careful when removing them
    // For simplicity, we'll remove all handlers for this event
    this.connection.off(eventName);
    console.log(`[SignalR] Stopped listening on event: "${eventName}"`);
  };

}

// Export a singleton instance
const signalRService = new SignalRService();
export default signalRService; 