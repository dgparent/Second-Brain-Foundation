/**
 * User-Friendly Error Messages
 * 
 * Converts technical error messages into helpful, actionable user messages
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
  }>;
  helpLink?: string;
  technicalDetails?: string;
}

/**
 * Convert technical errors to user-friendly messages
 */
export function getUserFriendlyError(error: Error | string): UserFriendlyError {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  // File system errors
  if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file or directory')) {
    if (errorMessage.includes('vault')) {
      return {
        title: 'Vault folder not found',
        message: 'The vault folder you specified doesn\'t exist or can\'t be accessed.',
        actions: [
          { label: 'Choose a different folder', onClick: () => {} }, // Will be handled by caller
          { label: 'Create this folder', onClick: () => {} },
        ],
        helpLink: '/docs/06-guides/troubleshooting.md#vault-not-found',
        technicalDetails: errorMessage,
      };
    }
    return {
      title: 'File not found',
      message: 'A required file couldn\'t be found. This might mean your vault isn\'t set up correctly.',
      helpLink: '/docs/06-guides/troubleshooting.md#file-not-found',
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('EACCES') || errorMessage.includes('permission denied')) {
    return {
      title: 'Permission denied',
      message: 'Second Brain Foundation doesn\'t have permission to access this folder. Try choosing a different location or checking folder permissions.',
      helpLink: '/docs/06-guides/troubleshooting.md#permission-denied',
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('EEXIST') || errorMessage.includes('already exists')) {
    return {
      title: 'File already exists',
      message: 'A file or folder with this name already exists. Choose a different name or location.',
      technicalDetails: errorMessage,
    };
  }

  // Network errors
  if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection refused')) {
    return {
      title: 'Connection refused',
      message: 'Couldn\'t connect to the service. If you\'re using Ollama, make sure it\'s running.',
      actions: [
        { label: 'Check Ollama status', href: 'http://localhost:11434' },
        { label: 'Troubleshooting guide', href: '/docs/06-guides/troubleshooting.md#connection-issues' },
      ],
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
    return {
      title: 'Request timed out',
      message: 'The request took too long to complete. This might be due to a slow internet connection or the AI service being busy.',
      actions: [
        { label: 'Try again', onClick: () => {} },
        { label: 'Check connection', href: '/docs/06-guides/troubleshooting.md#timeout-errors' },
      ],
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('fetch failed') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
    return {
      title: 'Network error',
      message: 'Couldn\'t connect to the internet. Check your connection and try again.',
      actions: [
        { label: 'Retry', onClick: () => {} },
      ],
      technicalDetails: errorMessage,
    };
  }

  // API errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid API key')) {
    return {
      title: 'Invalid API key',
      message: 'Your API key is missing or invalid. Please check your settings.',
      actions: [
        { label: 'Update API key in Settings', onClick: () => {} },
        { label: 'Get an API key', href: 'https://platform.openai.com/api-keys' },
      ],
      helpLink: '/docs/06-guides/troubleshooting.md#api-key-issues',
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return {
      title: 'Too many requests',
      message: 'You\'ve hit the rate limit for your API key. Please wait a moment before trying again.',
      actions: [
        { label: 'Learn about rate limits', href: 'https://platform.openai.com/docs/guides/rate-limits' },
      ],
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('402') || errorMessage.includes('insufficient credits') || errorMessage.includes('quota')) {
    return {
      title: 'Insufficient credits',
      message: 'Your AI provider account has run out of credits. Please add funds to continue.',
      actions: [
        { label: 'Add credits', href: 'https://platform.openai.com/account/billing' },
      ],
      technicalDetails: errorMessage,
    };
  }

  if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
    return {
      title: 'Service unavailable',
      message: 'The AI service is temporarily unavailable. This usually resolves quickly.',
      actions: [
        { label: 'Try again', onClick: () => {} },
        { label: 'Check service status', href: 'https://status.openai.com/' },
      ],
      technicalDetails: errorMessage,
    };
  }

  // Module/dependency errors
  if (errorMessage.includes('MODULE_NOT_FOUND') || errorMessage.includes('Cannot find module')) {
    return {
      title: 'Missing dependency',
      message: 'A required software component is missing. Try reinstalling Second Brain Foundation.',
      actions: [
        { label: 'Reinstall guide', href: '/docs/06-guides/troubleshooting.md#reinstall' },
      ],
      technicalDetails: errorMessage,
    };
  }

  // Initialization errors
  if (errorMessage.includes('Failed to initialize') || errorMessage.includes('initialization')) {
    return {
      title: 'Initialization failed',
      message: 'Second Brain Foundation couldn\'t start properly. This is often due to configuration issues.',
      actions: [
        { label: 'Reset settings', onClick: () => {} },
        { label: 'Setup guide', href: '/docs/06-guides/getting-started.md' },
      ],
      helpLink: '/docs/06-guides/troubleshooting.md#initialization-errors',
      technicalDetails: errorMessage,
    };
  }

  // Parsing errors
  if (errorMessage.includes('JSON') || errorMessage.includes('parse') || errorMessage.includes('SyntaxError')) {
    return {
      title: 'Data format error',
      message: 'Received unexpected data from the AI service. This is usually temporary.',
      actions: [
        { label: 'Try again', onClick: () => {} },
      ],
      technicalDetails: errorMessage,
    };
  }

  // Vault/markdown errors
  if (errorMessage.includes('frontmatter') || errorMessage.includes('YAML')) {
    return {
      title: 'Invalid markdown format',
      message: 'One of your markdown files has incorrect frontmatter. Check the file mentioned in the error.',
      helpLink: '/docs/06-guides/troubleshooting.md#frontmatter-errors',
      technicalDetails: errorMessage,
    };
  }

  // Generic fallback
  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. If this persists, please report it.',
    actions: [
      { label: 'Try again', onClick: () => {} },
      { label: 'Report issue', href: 'https://github.com/YourOrg/SecondBrainFoundation/issues' },
    ],
    helpLink: '/docs/06-guides/troubleshooting.md',
    technicalDetails: errorMessage,
  };
}

/**
 * Format error for display in toast notification
 */
export function getErrorToastMessage(error: Error | string): string {
  const friendly = getUserFriendlyError(error);
  return `${friendly.title}: ${friendly.message}`;
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const recoverablePatterns = [
    'timeout',
    'ETIMEDOUT',
    'network',
    'ENOTFOUND',
    '500',
    '502',
    '503',
    'rate limit',
    '429',
  ];
  
  return recoverablePatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Check if error is a configuration issue
 */
export function isConfigurationError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const configPatterns = [
    'api key',
    '401',
    'unauthorized',
    'vault',
    'ENOENT',
    'permission denied',
    'EACCES',
    'Failed to initialize',
  ];
  
  return configPatterns.some(pattern =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}
