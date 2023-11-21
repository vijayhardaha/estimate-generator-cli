/**
 * Import necessary Node.js modules and libraries
 */
import { getReplacementArgs, replacePlaceholders } from "./replacement.js";
import { fileExists, readFile, resolvePath } from "./file.js";

/**
 * Gets the HTML template for image generation.
 *
 * @throws {Error} Throws an error if the HTML or CSS file is missing.
 * @returns {string} The HTML template as a string with embedded CSS.
 */
const getHtmlTemplate = () => {
  // Resolve paths to HTML and CSS files
  const htmlFilePath = resolvePath("../template/index.html");
  const cssFilePath = resolvePath("../template/index.css");

  // Check if the HTML template file exists
  if (!fileExists(htmlFilePath)) {
    throw new Error("HTML template file is missing.");
  }

  // Check if the CSS file exists
  if (!fileExists(cssFilePath)) {
    throw new Error("CSS file is missing.");
  }

  // Read the content of the HTML and CSS files
  const htmlContent = readFile(htmlFilePath);
  const cssContent = readFile(cssFilePath);

  // Inject CSS content into the HTML template
  const htmlWithStyles = htmlContent.replace(
    "<link rel=\"stylesheet\" href=\"/index.css\">",
    `<style>${cssContent}</style>`,
  );

  return htmlWithStyles;
};

/**
 * Generates HTML content for image generation based on the provided Markdown file.
 *
 * @param {string} markdown - The path to the Markdown file.
 * @returns {string} The HTML content for image generation.
 */
const buildHtml = (markdown) => {
  // Read the content of the Markdown file
  const markdownText = readFile(markdown);

  // Get the HTML template for image generation
  const imageHtmlTemplate = getHtmlTemplate();

  // Extract content replacement data from the Markdown content
  const replacementArgs = getReplacementArgs(markdownText);

  // Replace placeholders in the HTML template with replacementArgs
  const finalHtmlContent = replacePlaceholders(imageHtmlTemplate, replacementArgs);

  return finalHtmlContent;
};

export default buildHtml;
