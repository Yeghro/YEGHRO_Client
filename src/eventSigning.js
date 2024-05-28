export async function createAndSignEvent(kind, tags, content) {
  try {
    const user = ndk.activeUser;
    const event = {
      kind: kind,
      pubkey: user.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: content,
    };

    const signedEvent = await ndk.signer.sign(event);
    console.log("Event signed:", signedEvent);

    return signedEvent;
  } catch (error) {
    console.error("Error creating or signing event:", error);
  }
}
// Create and sign an event can be called in the future
// Example usage: createAndSignEvent(1, [], "Hello, Nostr!");
