/**
 * Mock data for local development and test mode.
 * Used by App for initial state and "Add mock item" when REACT_APP_MODE=test.
 */

export function getInitialMockItems() {
  return [];
}

export function createMockItem() {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
}
