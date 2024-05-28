import { setupLoginButton } from "./ui.js";
import { initializeNDK } from "./nostr.js";

// Function to handle login button click
function handleLoginButtonClick() {
  initializeNDK();
}

// Set up login button event listener
setupLoginButton(handleLoginButtonClick);
