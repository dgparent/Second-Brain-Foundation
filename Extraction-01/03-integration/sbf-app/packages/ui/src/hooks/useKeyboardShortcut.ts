/**
 * useKeyboardShortcut Hook
 * 
 * Custom hook for handling keyboard shortcuts
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export const useKeyboardShortcut = (
  shortcut: KeyboardShortcut,
  callback: () => void,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrl, shift, alt, meta } = shortcut;
      
      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;
      const metaMatch = meta ? event.metaKey : !event.metaKey;
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcut, callback, enabled]);
};
