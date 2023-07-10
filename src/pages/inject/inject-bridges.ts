import ExtensionBridge from '@/core/bridge/extension-bridge';

const CONTENT_SIDE_BRIDGE_NAME = 'ContentSide';
const BROWSER_SIDE_BRIDGE_NAME = 'BrowserSide';

/**
 * content_script.js Bridge
 */
export const contentExtensionBridge = new ExtensionBridge(
  CONTENT_SIDE_BRIDGE_NAME,
  BROWSER_SIDE_BRIDGE_NAME,
);

/**
 * inject browser Bridge
 */
export const browserExtensionBridge = new ExtensionBridge(
  BROWSER_SIDE_BRIDGE_NAME,
  CONTENT_SIDE_BRIDGE_NAME,
);
