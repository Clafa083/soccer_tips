// Shared utility functions for avatar handling

// Predefined avatar options (emojis)
export const AVATAR_OPTIONS = [
    '⚽', '🏆', '👤', '🔥', '⭐', '💎', '🎯', '🚀', 
    '🎲', '🎪', '🎨', '🎭', '🎪', '🌟', '⚡', '🌈'
];

/**
 * Check if the provided imageUrl is an emoji avatar
 * @param imageUrl - The image URL to check
 * @returns true if it's an emoji avatar, false otherwise
 */
export const isEmojiAvatar = (imageUrl: string): boolean => {
    return AVATAR_OPTIONS.includes(imageUrl);
};

/**
 * Get avatar props for Material-UI Avatar component
 * @param imageUrl - The image URL (could be emoji or HTTP URL)
 * @param fallbackText - Fallback text to display if not emoji or HTTP URL
 * @returns Object with either src prop or children content
 */
export const getAvatarProps = (imageUrl?: string, fallbackText?: string) => {
    if (!imageUrl) {
        return {
            children: fallbackText?.charAt(0).toUpperCase() || '?'
        };
    }

    if (isEmojiAvatar(imageUrl)) {
        return {
            children: imageUrl,
            sx: { fontSize: '24px' }
        };
    }

    if (imageUrl.startsWith('http')) {
        return {
            src: imageUrl,
            children: fallbackText?.charAt(0).toUpperCase() || '?'
        };
    }

    return {
        children: fallbackText?.charAt(0).toUpperCase() || '?'
    };
};
