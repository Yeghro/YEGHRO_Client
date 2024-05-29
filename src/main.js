import {
  setupLoginButton,
  showConnectionStatus,
  displayEvent,
  displayProfile,
} from "./ui.js";
import { initializeNDK } from "./nostr.js";
import { subscribeToEventsForFollows } from "./eventFetcher.js";

// Function to handle login button click
async function handleLoginButtonClick() {
  await initializeNDK();
  showConnectionStatus("Connected");
  const subscription = await subscribeToEventsForFollows();

  if (subscription) {
    subscription.on("event", (event) => {
      console.log("Received event:", event); // Add logging for all received events
      if (event.kind === 1) {
        // Check if the event is of kind 1 (Text event)
        displayEvent(event); // Call displayEvent function with the event object
      } else if (event.kind === 0) {
        // Check if the event is of kind 0 (Metadata event)
        displayProfile(event); // Call displayProfile function with the event object
      }
    });
  }
}

// Set up login button event listener
setupLoginButton(handleLoginButtonClick);
