/**
 * Note: React automatically escapes text content in JSX, preventing XSS.
 * This file is kept for backward compatibility but SafeText is unnecessary.
 * Use regular JSX: <h1>{userInput}</h1> is already safe.
 */

import { escapeHtml } from '@/lib/utils/sanitization';

// Only export escapeHtml for cases where you truly need manual escaping
// (like setting innerHTML or HTML attributes manually)
export { escapeHtml };
