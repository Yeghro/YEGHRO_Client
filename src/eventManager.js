import { displayEvent, storeMetadata } from "./ui/index.js"; // Adjusted import path

const BATCH_SIZE = 10; // Define a suitable batch size

export async function fetchEventsAndMetadataInBatches(ndk, pubkeys) {
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60;

  // Function to fetch events and metadata for a batch of pubkeys
  const fetchBatch = async (batch) => {
    try {
      const eventsPromises = batch.map((pubkey) =>
        ndk.fetchEvents({
          kinds: [1], // Kind 1 for text events
          authors: [pubkey],
          since: oneWeekAgo,
        })
      );

      const metadataPromises = batch.map((pubkey) =>
        ndk.fetchEvent({
          kinds: [0], // Kind 0 for metadata
          authors: [pubkey],
          limit: 1,
        })
      );

      const eventsResults = await Promise.all(eventsPromises);
      const metadataResults = await Promise.all(metadataPromises);

      eventsResults.forEach((events, index) => {
        const metadata = metadataResults[index];
        if (events && metadata) {
          storeMetadata(batch[index], metadata); // Store metadata for the pubkey
          events.forEach((event) => {
            displayEvent(event); // Display event with associated metadata
          });
        }
      });
    } catch (error) {
      console.error("Error fetching events and metadata in batch:", error);
    }
  };

  // Process pubkeys in batches
  for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
    const batch = pubkeys.slice(i, i + BATCH_SIZE);
    await fetchBatch(batch); // Wait for the batch to be processed before moving to the next
  }

  console.log("All batches processed");
}
