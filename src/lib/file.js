import fs from "fs"; // File system module
import path from "path"; // Import the 'path' module for working with file and directory paths.
import { fileURLToPath } from "url"; // Import the 'fileURLToPath' function from the 'url' module.

/**
 * Get the current filename (full file path).
 * @type {string}
 */
const currentFilename = fileURLToPath(import.meta.url);

/**
 * Get the directory of the current module.
 * @type {string}
 */
const currentModuleDirectory = path.dirname(currentFilename);

/**
 * Reads the content of a file at the specified path.
 *
 * @param {string} filePath - The path to the file to read.
 * @returns {string} The content of the file as a string.
 */
export const readFile = (filePath) => fs.readFileSync(filePath, "utf8");

/**
 * Checks if a file exists at the specified path.
 *
 * @param {string} filePath - The path to the file to check.
 * @returns {boolean} True if the file exists, otherwise false.
 */
export const fileExists = (filePath) => fs.existsSync(filePath);

/**
 * Resolve a path based on the __dirname of the current module.
 *
 * @param {...string} paths - One or more path segments to join and resolve.
 * @returns {string} The resolved path.
 */
export const resolvePath = (...paths) => path.resolve(currentModuleDirectory, ...paths);

/**
 * Check if the given file path is a valid Markdown file.
 *
 * @param {string} filePath - The file path to check.
 * @returns {boolean} True if it's a valid Markdown file, false otherwise.
 */
export const isValidMarkdownFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return false; // File doesn't exist
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    return false; // It's not a file
  }

  // Check if the file extension is '.md' (Markdown file)
  const fileExtension = path.extname(filePath).toLowerCase();
  return fileExtension === ".md";
};
