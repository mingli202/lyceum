export default function parseTimestamp(timestamp: number): string {
  const nowMs = Date.now();

  const diffS = (nowMs - timestamp) / 1000;

  // less than a minute ago
  if (diffS < 60) {
    return `${Math.floor(diffS)}s ago`;
  }
  if (diffS < 60 * 60) {
    return `${Math.floor(diffS / 60)}min ago`;
  }
  if (diffS < 60 * 60 * 24) {
    return `${Math.floor(diffS / 60 / 60)}hr ago`;
  }
  if (diffS < 60 * 60 * 24 * 7) {
    return `${Math.floor(diffS / 60 / 60 / 24)}d ago`;
  }
  if (diffS < 60 * 60 * 24 * 30) {
    return `${Math.floor(diffS / 60 / 60 / 24 / 7)} weeks ago`;
  }

  const date = new Date(timestamp);

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
