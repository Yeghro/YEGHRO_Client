export function isValidURI(uri) {
  try {
    new URL(uri);
    return true;
  } catch (error) {
    return false;
  }
}
