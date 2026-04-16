/**
 * Test utilities and setup
 */
import '@testing-library/jest-dom';

// Mock import.meta for Vite
if (typeof global.import === 'undefined') {
    global.import = {};
}
global.import.meta = {
    env: {
        VITE_API_URL: 'http://localhost:8000',
        MODE: 'test',
        DEV: false,
        PROD: false,
        SSR: false,
    },
};

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
