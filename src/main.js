import {
  setupLoginButton,
  showConnectionStatus,
  // displayEvent,
  // displayProfile,
} from "./ui/index.js";
import { initializeNDK, ndk, user } from "./nostr.js";
import { subscribeToEventsForFollows } from "./subscriptions.js";

async function handleLoginButtonClick() {
  await initializeNDK();
  showConnectionStatus("Connected");

  // Remove the login button and add an inspirational message
  const loginButton = document.getElementById("loginButton");
  if (loginButton) {
    loginButton.remove();
  }

  const sidebar = document.querySelector(".sidebar");
  const messageElement = document.createElement("p");
  messageElement.textContent = "Go Explore!"; // You can change this message as desired
  sidebar.appendChild(messageElement);

  await subscribeToEventsForFollows(ndk, user);
}

setupLoginButton(handleLoginButtonClick);
