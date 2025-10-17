"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!event.ctrlKey === !!shortcut.ctrlKey;
      const altMatch = !!event.altKey === !!shortcut.altKey;
      const shiftMatch = !!event.shiftKey === !!shortcut.shiftKey;
      
      return keyMatch && ctrlMatch && altMatch && shiftMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Common desktop app shortcuts
export const commonShortcuts = {
  openFolder: (action: () => void): KeyboardShortcut => ({
    key: 'o',
    ctrlKey: true,
    action,
    description: 'Open folder'
  }),
  
  refresh: (action: () => void): KeyboardShortcut => ({
    key: 'f5',
    action,
    description: 'Refresh'
  }),
  
  find: (action: () => void): KeyboardShortcut => ({
    key: 'f',
    ctrlKey: true,
    action,
    description: 'Find files'
  }),
  
  selectAll: (action: () => void): KeyboardShortcut => ({
    key: 'a',
    ctrlKey: true,
    action,
    description: 'Select all'
  }),
  
  delete: (action: () => void): KeyboardShortcut => ({
    key: 'delete',
    action,
    description: 'Delete selected'
  }),
  
  visualView: (action: () => void): KeyboardShortcut => ({
    key: '1',
    ctrlKey: true,
    action,
    description: 'Visual view'
  }),
  
  listView: (action: () => void): KeyboardShortcut => ({
    key: '2',
    ctrlKey: true,
    action,
    description: 'List view'
  }),
  
  toggleSidebar: (action: () => void): KeyboardShortcut => ({
    key: 'b',
    ctrlKey: true,
    action,
    description: 'Toggle sidebar'
  }),
  
  settings: (action: () => void): KeyboardShortcut => ({
    key: ',',
    ctrlKey: true,
    action,
    description: 'Settings'
  }),
  
  help: (action: () => void): KeyboardShortcut => ({
    key: 'f1',
    action,
    description: 'Help'
  }),
  
};
