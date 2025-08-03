/**
 * Utility functions for handling asset paths with Next.js basePath
 */

// Get the basePath from Next.js config
const getBasePath = () => {
  // In production (GitHub Pages), the basePath is '/Exams-Viewer-Beta'
  // In development, it's empty
  if (typeof window !== 'undefined') {
    // Client-side: check if we're on GitHub Pages domain
    if (window.location.hostname === 'johandevl.github.io') {
      return '/Exams-Viewer-Beta';
    }
  }
  
  // For server-side or development, check environment or use process.env.NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return '/Exams-Viewer-Beta';
  }
  
  return '';
};

/**
 * Get the correct path for a data asset, considering basePath
 * @param path - The relative path (e.g., '/data/manifest.json')
 * @returns The full path with basePath if needed
 */
export const getAssetPath = (path: string): string => {
  const basePath = getBasePath();
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
};

/**
 * Get the correct path for data files
 * @param dataPath - The data file path (e.g., 'manifest.json' or 'CIS-ITSM/exam.json')
 * @returns The full path to the data file
 */
export const getDataPath = (dataPath: string): string => {
  return getAssetPath(`data/${dataPath}`);
};