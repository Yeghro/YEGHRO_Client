import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { showConnectionStatus } from "./ui/index.js"; // Adjusted import path
import { subscribeToEventsForFollows } from "./subscriptions.js";
import { displayActiveUserProfile } from "./ui/profileDisplay.js"; // Import display function

export let ndk; // Module-level variable for NDK instance
export let nip07signer; // Module-level variable for the signer

const DEFAULT_RELAYS = ["wss://nostrpub.yeghro.site", "wss://relay.damus.io"];

export async function initializeNDK() {
  if (ndk) {
    console.log("NDK instance already initialized");
    return ndk;
  }

  console.log("Initializing NDK instance...");

  nip07signer = new NDKNip07Signer({
    waitTimeout: 2000, // waitTimeout should be in milliseconds
  });

  ndk = new NDK({
    explicitRelayUrls: DEFAULT_RELAYS,
    signer: nip07signer,
    autoConnectUserRelays: false, // We will handle connection manually
    autoFetchUserMutelist: true, // Ensure auto fetch is enabled
  });

  try {
    // Ensure the signer is ready and retrieve the user
    await ndk.signer.blockUntilReady();
    const user = await ndk.signer.user();
    console.log("User is ready:", user);

    // Set the active user
    ndk.activeUser = user;
    console.log("Active user set in NDK:", ndk.activeUser);

    // Initial connection to default relays
    await ndk.connect();
    console.log("Connected to default Nostr relays!");
    showConnectionStatus("Connected to default Nostr relays!");

    // Fetch the active user's metadata (kind 0)
    const userMetadata = await ndk.fetchEvent({
      kinds: [0], // Kind 0 for metadata
      authors: [user.pubkey],
      limit: 1,
    });

    // Fetch the active user's follow list
    const follows = await user.follows();
    const followCount = follows ? follows.size : 0;

    if (userMetadata) {
      console.log("Active user's metadata:", userMetadata);
      displayActiveUserProfile(userMetadata, followCount); // Display active user's profile
    }

    // Subscribe to events for follows
    await subscribeToEventsForFollows(ndk);
  } catch (error) {
    console.error("Error during initialization:", error);
    showConnectionStatus("Error during initialization");
  }

  return ndk;
}
