export function getAvatarProps(imageUrl?: string, name?: string) {
  if (imageUrl) {
    return { src: imageUrl, alt: name || "Avatar" };
  }
  return {
    children: name ? name.charAt(0) : "?",
    alt: name || "Avatar"
  };
}