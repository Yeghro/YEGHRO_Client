const requestQueue = [];
let isProcessingQueue = false;

function processQueue() {
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const { imgElement, src, retries, delay } = requestQueue.shift();
  setImageWithRetry(imgElement, src, retries, delay);

  setTimeout(processQueue, delay); // Process the next item after a delay
}

export function enqueueRequest(imgElement, src, retries = 3, delay = 1000) {
  requestQueue.push({ imgElement, src, retries, delay });
  if (!isProcessingQueue) {
    processQueue();
  }
}

export function setImageWithRetry(imgElement, src, retries = 3, delay = 1000) {
  imgElement.src = src;

  imgElement.onerror = function (event) {
    if (retries > 0) {
      console.log(`Retrying image load for ${src}, retries left: ${retries}`);
      enqueueRequest(imgElement, src, retries - 1, delay * 2);
    } else {
      console.log(
        `Failed to load image after retries, falling back to default for ${src}`
      );
      imgElement.src =
        "https://yeghro.site/wp-content/uploads/2024/03/nostr-300x300.webp"; // Set the default image URL
    }
  };

  imgElement.onload = function () {
    console.log(`Successfully loaded image: ${src}`);
  };
}
