import { setupLoginButton } from "./ui.js";
import { initializeNDK } from "./nostr.js";
import { fetchEventsForFollows } from "./eventFetcher.js";

// Function to handle login button click
async function handleLoginButtonClick() {
  await initializeNDK();
  await fetchEventsForFollows();
}

// Set up login button event listener
setupLoginButton(handleLoginButtonClick);
