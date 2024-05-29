export function showConnectionStatus(status) {
  const statusElement = document.getElementById("connectionStatus");
  if (!statusElement) {
    const newStatusElement = document.createElement("p");
    newStatusElement.id = "connectionStatus";
    newStatusElement.textContent = status;
    document.body.appendChild(newStatusElement);
  } else {
    statusElement.textContent = status;
  }
}
