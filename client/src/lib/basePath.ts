/**
 * Get the base path for the application
 * Returns '/risk29-dashboard/' for GitHub Pages, '/' otherwise
 */
export function getBasePath(): string {
  return import.meta.env.BASE_URL || '/';
}

/**
 * Get the full URL for a public asset
 * @param path - Path to the asset (e.g., 'risk_data.json')
 */
export function getAssetUrl(path: string): string {
  const basePath = getBasePath();
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure basePath ends with /
  const baseWithSlash = basePath.endsWith('/') ? basePath : basePath + '/';
  return baseWithSlash + cleanPath;
}
