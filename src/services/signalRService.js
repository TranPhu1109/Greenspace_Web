import * as signalR from "@microsoft/signalr";

const HUB_URL = "/hub";

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
    this.connection.on(eventName, callback);
  };

  // Method to remove a listener for a specific event
  off = (eventName, callback) => {
    if (!this.connection) {
      console.error("SignalR connection not initialized.");
      return;
    }
    this.connection.off(eventName, callback);
  };

  // Optional: Method to invoke a hub method on the server
  // invoke = async (methodName, ...args) => {
  //   if (!this.connection || !this.connectionStarted) {
  //     console.error("SignalR connection not started.");
  //     throw new Error("SignalR connection not established.");
  //   }
  //   try {
  //     return await this.connection.invoke(methodName, ...args);
  //   } catch (err) {
  //     console.error(`Error invoking hub method ${methodName}:`, err);
  //     throw err;
  //   }
  // };
}

// Export a singleton instance
const signalRService = new SignalRService();
export default signalRService; 