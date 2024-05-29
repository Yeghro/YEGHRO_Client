import { ndk, initializeNDK } from "./nostr.js";
import { NDKKind } from "@nostr-dev-kit/ndk"; // Assuming this is how NDKKind is imported

const BATCH_SIZE = 10; // Define a suitable batch size

export async function subscribeToEventsForFollows() {
  // Ensure NDK is initialized
  if (!ndk) {
    console.error("NDK instance is not initialized, initializing now...");
    await initializeNDK(); // Initialize NDK if not already done
  }

  const user = ndk.activeUser;
  if (!user) {
    console.error("Active user is not set, waiting for initialization...");
    await ndk.signer.blockUntilReady(); // Ensure the signer is ready
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

    // Fetch kind 0 events (profile information) for each pubkey
    await fetchProfileEvents(pubkeys);

    // Calculate the timestamp for one week ago
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

    // Prepare filters for subscribing to events of kind 1 for all pubkeys in the follow list
    const filters = pubkeys.map((pubkey) => ({
      kinds: [NDKKind.Text],
      authors: [pubkey],
      since: oneWeekAgo,
    }));

    console.log("Prepared filters for subscribing to events:", filters);

    // Ensure filters is an array
    const filtersArray = Array.isArray(filters) ? filters : [filters];

    // Function to create subscriptions in batches
    const createSubscriptionBatch = (batch) => {
      const subscription = ndk.subscribe(batch);
      console.log("Subscription started with filters:", batch);

      // Add detailed event logging
      subscription.on("event", (event) => {
        console.log("Received event from subscription:", event);
        if (event.kind === NDKKind.Text) {
          console.log("Text Event content:", event.content);
        }
      });

      subscription.on("eose", () => {
        console.log("Subscription ended (EOSE received)");
      });

      subscription.on("error", (error) => {
        console.error("Subscription error:", error);
      });

      return subscription;
    };

    // Process filters in batches
    for (let i = 0; i < filtersArray.length; i += BATCH_SIZE) {
      const batch = filtersArray.slice(i, i + BATCH_SIZE);
      return createSubscriptionBatch(batch); // Return the subscription object
    }

    console.log("All subscriptions started");
  } catch (error) {
    console.error("Error subscribing to events for follows:", error);
  }
}

async function fetchProfileEvents(pubkeys) {
  for (const pubkey of pubkeys) {
    try {
      const filter = {
        kinds: [NDKKind.Metadata],
        authors: [pubkey],
        limit: 1, // Fetch the latest event
      };

      const events = await ndk.fetchEvents(filter);
      if (events && events.length > 0) {
        console.log("Fetched profile event for pubkey:", pubkey, events[0]);
        // Call displayProfile function with the fetched event
        displayProfile(events[0]);
      } else {
        console.log("No profile event found for pubkey:", pubkey);
      }
    } catch (error) {
      console.error("Error fetching profile event for pubkey:", pubkey, error);
    }
  }
}
