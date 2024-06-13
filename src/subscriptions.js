import { displayEvent, storeMetadata } from "./ui/index.js"; // Adjusted import path
import { NDKKind } from "@nostr-dev-kit/ndk"; // Assuming this is how NDKKind is imported

export async function subscribeToEventsForFollows(ndk, user) {
  if (!ndk) {
    throw new Error("NDK instance is not initialized");
  }

  try {
    // Fetch the follow list using the correct method signature
    const follows = await user.follows(undefined, false, NDKKind.Contacts);
    console.log("Fetched follow list:", follows);

    if (!follows || follows.size === 0) {
      console.warn("Follow list is empty");
      return;
    }

    // Extract public keys from the follow list
    const pubkeys = Array.from(follows).map((follow) => follow.pubkey);

    // Calculate the timestamp for one day ago
    const oneDayAgo = Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60;

    // Prepare a filter for subscribing to kind 0 (Metadata) events
    const metadataFilter = {
      kinds: [NDKKind.Metadata],
      authors: pubkeys,
    };

    console.log(
      "Prepared filter for subscribing to metadata events:",
      metadataFilter
    );

    // Create a subscription for metadata
    const metadataSubscription = ndk.subscribe([metadataFilter], {
      closeOnEose: true,
    });
    console.log("Metadata subscription started with filter:", metadataFilter);

    // Handle metadata events
    metadataSubscription.on("event", (event) => {
      storeMetadata(event.pubkey, event);
    });

    metadataSubscription.on("eose", () => {
      console.log("Metadata subscription ended (EOSE received)");
      // Once metadata subscription is complete, subscribe to text events
      setTimeout(() => subscribeToTextEvents(ndk, pubkeys, oneDayAgo), 1000); // Delay to ensure all metadata events are processed
    });

    metadataSubscription.on("error", (error) => {
      console.error("Metadata subscription error:", error);
    });
  } catch (error) {
    console.error("Error subscribing to events for follows:", error);
  }
}

// Function to subscribe to text (kind 1) events
async function subscribeToTextEvents(ndk, pubkeys, since) {
  try {
    // Prepare a filter for subscribing to kind 1 (Text) events
    const textFilter = {
      kinds: [NDKKind.Text],
      authors: pubkeys,
      since: since,
    };

    console.log("Prepared filter for subscribing to text events:", textFilter);

    // Create a subscription for text events
    const textSubscription = ndk.subscribe([textFilter], { closeOnEose: true });
    console.log("Text subscription started with filter:", textFilter);

    // Handle text events
    textSubscription.on("event", (event) => {
      displayEvent(event);
    });

    textSubscription.on("eose", () => {
      console.log("Text subscription ended (EOSE received)");
    });

    textSubscription.on("error", (error) => {
      console.error("Text subscription error:", error);
    });
  } catch (error) {
    console.error("Error subscribing to text events:", error);
  }
}
