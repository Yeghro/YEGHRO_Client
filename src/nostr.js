import NDK, { NDKNip07Signer, NDKRelayList } from "@nostr-dev-kit/ndk";
import { showConnectionStatus } from "./ui/index.js"; // Adjusted import path
import {
  handleFetchedEvents,
  subscribeToEventsForFollows,
} from "./eventManager.js";

export let ndk; // Module-level variable for NDK instance
export let nip07signer; // Module-level variable for the signer

const DEFAULT_RELAYS = ["wss://nostrpub.yeghro.site", "wss://relay.damus.io"];
const metadataMap = new Map(); // Map to store metadata

export async function initializeNDK() {
  if (ndk) {
    console.log("NDK instance already initialized");
    return ndk;
  }

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

    if (userMetadata) {
      console.log("Active user's metadata:", userMetadata);
      metadataMap.set(user.pubkey, userMetadata); // Store user metadata
    }

    // Fetch the active user's follow list and subscribe to their events
    const follows = await user.follows();
    console.log("Active user's follows:", follows);

    // Extract public keys from the follow list
    const pubkeys = Array.from(follows).map((follow) => follow.pubkey);

    // Fetch metadata for the follow list and store in metadataMap
    for (const pubkey of pubkeys) {
      const followMetadata = await ndk.fetchEvent({
        kinds: [0], // Kind 0 for metadata
        authors: [pubkey],
        limit: 1,
      });

      if (followMetadata) {
        console.log(`Fetched metadata for pubkey ${pubkey}:`, followMetadata);
        metadataMap.set(pubkey, followMetadata); // Store follow metadata
      }
    }

    // Subscribe to events from the follow list
    subscribeToEventsForFollows(ndk, pubkeys, metadataMap);
  } catch (error) {
    console.error("Error during initialization:", error);
    showConnectionStatus("Error during initialization");
  }

  return ndk;
}
