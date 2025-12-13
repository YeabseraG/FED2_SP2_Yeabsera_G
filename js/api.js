export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  // DELETE / 204 responses have no body
  if (response.status === 204) {
    return null;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.errors?.[0]?.message ||
      data?.message ||
      "API error";
    throw new Error(message);
  }

  return data;
}
