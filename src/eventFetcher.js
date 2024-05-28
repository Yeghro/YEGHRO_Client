import { ndk } from "./nostr.js";

export async function fetchEventsForFollows() {
  if (!ndk) {
    console.error("NDK instance is not initialized");
    return;
  }

  const user = ndk.activeUser;
  if (!user) {
    console.error("Active user is not set");
    return;
  }

  try {
    // Fetch the follow list using the correct method signature
    const follows = await user.follows(undefined, false, 3); // Assuming NDKKind.Contacts = 3
    console.log("Fetched follow list:", follows);

    if (!follows || follows.size === 0) {
      console.warn("Follow list is empty");
      return;
    }

    // Prepare filters for fetching events of kind 1 for all pubkeys in the follow list
    const filters = Array.from(follows).map((follow) => ({
      kinds: [1],
      authors: [follow.pubkey], // Ensure using the correct property
    }));

    console.log("Prepared filters for fetching events:", filters);

    // Fetch events for all follow pubkeys
    const events = await ndk.fetchEvents(filters);
    console.log("Fetched events for follows:", events);

    return events;
  } catch (error) {
    console.error("Error fetching events for follows:", error);
  }
}
