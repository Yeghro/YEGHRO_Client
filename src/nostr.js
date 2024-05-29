import NDK, { NDKNip07Signer, NDKRelayList } from "@nostr-dev-kit/ndk";
import { showConnectionStatus, displayProfile } from "./ui.js";

export let ndk; // Module-level variable for NDK instance
export let nip07signer; // Module-level variable for the signer

const DEFAULT_RELAYS = ["wss://nostrpub.yeghro.site"];

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

  // Ensure the signer is ready and retrieve the user
  const user = await ndk.signer.blockUntilReady();
  console.log("User is ready:", user);

  // Manually set the NDK instance on the user object if necessary
  if (!user.ndk) {
    user.ndk = ndk;
  }

  // Set the active user
  ndk.activeUser = user;
  console.log("Active user set in NDK:", ndk.activeUser);

  try {
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
      displayProfile(userMetadata);
    }

    // Fetch the active user's follow list and subscribe to their events
    const follows = await user.follows();
    console.log("Active user's follows:", follows);

    // Extract public keys from the follow list
    const pubkeys = Array.from(follows).map((follow) => follow.pubkey);

    // Subscribe to events from the follow list
    subscribeToEventsForFollows(pubkeys);

    // Fetch metadata for the follow list
    for (const pubkey of pubkeys) {
      const followMetadata = await ndk.fetchEvent({
        kinds: [0], // Kind 0 for metadata
        authors: [pubkey],
        limit: 1,
      });

      if (followMetadata) {
        console.log(`Fetched metadata for pubkey ${pubkey}:`, followMetadata);
        displayProfile(followMetadata);
      }
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    showConnectionStatus("Error during initialization");
  }

  return ndk;
}

async function subscribeToEventsForFollows(pubkeys) {
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60;

  const filters = pubkeys.map((pubkey) => ({
    kinds: [1], // Kind 1 for text events
    authors: [pubkey],
    since: oneWeekAgo,
  }));

  const subscription = ndk.subscribe(filters, { closeOnEose: true });
  subscription.on("event", (event) => {
    console.log("Received event:", event);
    // Add your event handling logic here
  });
}
