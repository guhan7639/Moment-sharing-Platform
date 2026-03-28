import { BASE_URL } from '../constants';

/**
 * Formats an image URL to ensure it has the correct backend prefix if it's a relative path.
 * @param {string} url - The image URL or relative path.
 * @returns {string} - The formatted image URL.
 */
export const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Remove leading slash if it exists to avoid double slashes with BASE_URL
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL}/${cleanUrl}`;
};
