import Papa from 'papaparse';

/**
 * Parse CSV text using PapaParse library
 * Handles complex edge cases like newlines in quoted fields, escaped quotes, etc.
 * @param {string} text - Raw CSV text
 * @returns {Array<Array<string>>} - 2D array of CSV data
 */
export const parseCSV = (text) => {
    const result = Papa.parse(text, {
        skipEmptyLines: true,
        // Don't use header option - we want raw array of arrays
        header: false,
        // Trim whitespace from fields
        trimHeaders: true,
        // Handle various newline formats
        newline: '',
        // Handle quoted fields properly
        quoteChar: '"',
        // Handle escaped quotes
        escapeChar: '"',
        // Detect delimiter automatically (comma, tab, etc.)
        delimiter: '',
        // Skip comments
        comments: false
    });

    if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
    }

    return result.data;
};
