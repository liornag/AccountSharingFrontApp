function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360; // map to 0–359
  return `hsl(${hue}, 65%, 55%)`;   // nice pastel-ish color
}

export default stringToColor