export function getMediaUrl(media) {
  if (!Array.isArray(media) || media.length === 0) {
    return "https://via.placeholder.com/400x300";
  }

  const first = media[0];

  if (typeof first === "string") {
    return first;
  }

  if (typeof first === "object" && first.url) {
    return first.url;
  }

  return "https://via.placeholder.com/400x300";
}
