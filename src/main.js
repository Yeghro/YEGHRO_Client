import {
  setupLoginButton,
  showConnectionStatus,
  displayEvent,
  displayProfile,
} from "./ui/index.js"; // Adjusted import path
import { initializeNDK } from "./nostr.js";
import { subscribeToEventsForFollows } from "./eventFetcher.js";

async function handleLoginButtonClick() {
  await initializeNDK();
  showConnectionStatus("Connected");
  const subscription = await subscribeToEventsForFollows();

  if (subscription) {
    subscription.on("event", (event) => {
      console.log("Received event:", event);
      if (event.kind === 1) {
        displayEvent(event);
      } else if (event.kind === 0) {
        displayProfile(event);
      }
    });
  }
}

setupLoginButton(handleLoginButtonClick);
