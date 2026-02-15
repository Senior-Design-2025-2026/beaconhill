/**
 * Dummy data for test mode. Shapes mirror the kind of item data returned from DynamoDB (e.g. via apiGet /items).
 * No AWS connection; data exists only in local state.
 */

let mockIdCounter = 0;

/**
 * Creates a single mock item object compatible with DynamoDB-style item shape.
 * @returns {Object} One mock item (id, name, type, value, createdAt).
 */
export function createMockItem() {
  mockIdCounter += 1;
  return {
    id: `mock-${Date.now()}-${mockIdCounter}`,
    name: `Item ${mockIdCounter}`,
    type: 'mock',
    value: Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Returns a small set of initial mock items for test mode (optional seed).
 * @returns {Array<Object>}
 */
export function getInitialMockItems() {
  return [
    createMockItem(),
    createMockItem(),
  ];
}
