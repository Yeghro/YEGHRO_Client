import { displayEvent } from "./ui/index.js";

export async function subscribeToEventsForFollows(ndk, pubkeys, metadataMap) {
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;

  const filters = pubkeys.map((pubkey) => ({
    kinds: [1], // Kind 1 for text events
    authors: [pubkey],
    since: oneWeekAgo,
  }));

  const subscription = ndk.subscribe(filters, { closeOnEose: true });
  subscription.on("event", (event) => {
    console.log("Received event:", event);
    const metadata = metadataMap.get(event.pubkey); // Get metadata for the event's pubkey
    displayEvent(event, metadata); // Display event with metadata
  });
}

export function handleFetchedEvents(events, metadataMap) {
  events.forEach((event) => {
    const metadata = metadataMap.get(event.pubkey);
    displayEvent(event, metadata);
  });
}
