import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { showConnectionStatus } from "./ui/index.js"; // Adjusted import path
import { displayActiveUserProfile } from "./ui/index.js"; // Import display function

export let nip07signer; // Module-level variable for the signer
export let ndk; // Module-level variable for NDK instance
export let user; // Module-level variable for user

const DEFAULT_RELAYS = ["wss://relay.primal.net", "wss://purplepag.es"];

export async function initializeNDK() {
  console.log("Initializing NDK instance...");

  nip07signer = new NDKNip07Signer({
    waitTimeout: 2000, // waitTimeout should be in milliseconds
  });

  ndk = new NDK({
    explicitRelayUrls: DEFAULT_RELAYS,
    signer: nip07signer,
    autoConnectUserRelays: false, // We will handle connection manually
    autoFetchUserMutelist: true,
  });

  // Ensure the signer is ready and retrieve the user
  await ndk.signer.blockUntilReady();
  user = await ndk.signer.user();
  console.log("User is ready:", user);

  try {
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
  } catch (error) {
    console.error("Error during initialization:", error);
    showConnectionStatus("Error during initialization");
  }

  return { ndk, user };
}
