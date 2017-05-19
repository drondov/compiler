const IS_DEBUG = false;

export function debugLog(...args) {
    if (IS_DEBUG) {
        console.log(...args);
    }
}