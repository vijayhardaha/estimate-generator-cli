/**
 * Import necessary Node.js modules and libraries
 */
import matter from "gray-matter"; // Parse fronPackage for parsing HTML tables to JSON
import pkg from "html-table-to-json"; // Package for parsing HTML tables to JSON
import { marked } from "marked"; // Parse Markdown to HTML
import {
  cleanPrice,
  currentDate,
  formatDate,
  parseDescription,
  parseNotes,
  slugifyObjectKeys,
} from "./utils.js";
import {
  calculateInvoiceTotals,
  calculateUnitTotals,
  validateAndFilterColumns,
  validateDataRows,
} from "./validation.js";
import { generateTableBody, generateTableFoot } from "./table.js";

// Parse Markdown to HTML
const { parse: parseTable } = pkg; // Destructure the 'parse' function from the 'pkg' package

/**
 * Replaces placeholders in an HTML string with values from the data object.
 *
 * @param {string} html - The HTML string containing placeholders.
 * @param {Object} data - The data object with key-value pairs to replace placeholders.
 * @returns {string} The HTML string with placeholders replaced by their corresponding values.
 */
export const replacePlaceholders = (html, data) => {
  // Use a regular expression to find all placeholders like {{placeholderName}}
  const regex = /{{(.*?)}}/g;

  // Use the `replace` method with a callback function to replace placeholders
  const replacedHtml = html.replace(regex, (match, placeholder) => {
    // Check if the data object contains the placeholder
    if (Object.prototype.hasOwnProperty.call(data, placeholder)) {
      // Replace the placeholder with the corresponding value
      return data[placeholder];
    }
    // If a placeholder is not found, leave it as is
    return match;
  });

  return replacedHtml;
};

/**
 * Parse and validate the table from Markdown content.
 *
 * @param {string} markdown - The Markdown content containing a table.
 * @returns {Array} The parsed and validated table data.
 * @throws {Error} If validation fails.
 */
const parseAndValidateTable = (markdown) => {
  // Parse the markdown content into JSON tables using the 'marked' library
  const jsonTables = parseTable(marked(markdown));

  // Extract the results array from the parsed tables or provide an empty array
  const tables = jsonTables && jsonTables.results ? jsonTables.results : [];

  // If no tables were found in the markdown content, throw an error
  if (tables.length === 0) {
    throw new Error("Please provide an estimate table in the markdown content.");
  }

  // Select the first table from the results and slugify its object keys
  const table = tables[0].map(slugifyObjectKeys);

  // Validate and filter the columns in the table
  const filteredTable = validateAndFilterColumns(table);

  // Validate the data rows in the filtered table
  validateDataRows(filteredTable);

  // Return the filtered and validated table
  return filteredTable;
};

/**
 * Organize developer information.
 *
 * @param {Object} data - The developer data.
 * @returns {Object} The organized developer information.
 */
const organizeDeveloperInfo = (data) => ({
  // Extract and organize the developer's name, default to an empty string if missing
  devName: data.devName || "",

  // Extract and organize the developer's email, default to an empty string if missing
  devEmail: data.devEmail || "",

  // Extract and organize the developer's Skype, default to an empty string if missing
  devSkype: data.devSkype || "",

  // Extract and organize the developer's Twitter, default to an empty string if missing
  devTwitter: data.devTwitter || "",

  // Extract and organize the developer's website, default to an empty string if missing
  devWebsite: data.devWebsite || "",

  // Extract and organize the developer's location, default to an empty string if missing
  devLocation: data.devLocation || "",
});

/**
 * Organize client-specific data.
 *
 * @param {Object} data - The client data.
 * @returns {Object} The organized client information.
 */
const organizeClientInfo = (data) => ({
  // Extract and organize the client's name, default to an empty string if missing
  clientName: data.clientName || "",

  // Extract and organize the client's company, default to an empty string if missing
  clientCompany: data.clientCompany || "",

  // Extract and organize the client's location, default to an empty string if missing
  clientLocation: data.clientLocation || "",

  // Extract and organize the client's email, default to an empty string if missing
  clientEmail: data.clientEmail || "",
});

/**
 * Organize project-specific data.
 *
 * @param {Object} data - The project data.
 * @returns {Object} The organized project information.
 */
const organizeProjectInfo = (data) => ({
  // Extract and organize the project title, default to an empty string if missing
  title: data.title || "",

  // Convert the description to paragraphs and default to an empty string if missing
  description: parseDescription(data.description || ""),

  // Convert notes to an ordered list and default to an empty string if missing
  notes: parseNotes(data.notes || ""),

  // Format the date using the formatDate function if 'data.date' exists, or use the current date
  date: data.date ? formatDate(data.date) : currentDate(),
});

/**
 * Extracts invoice-related data from the provided data.
 *
 * @param {Object} data - The invoice data.
 * @param {string} content - The content with the table.
 * @returns {Object} The extracted invoice data.
 */
const extractInvoiceData = (data, content) => {
  // Extract and clean various data attributes from the 'data' object
  const serviceTax = cleanPrice(data.serviceTax || 0);
  const tax = cleanPrice(data.tax || 0);
  const otherFee = cleanPrice(data.otherFee || 0);
  const discount = cleanPrice(data.discount || 0);
  const currency = data.currency || "usd";

  // Parse and validate the table data from the 'content' with the specified currency
  const tableData = parseAndValidateTable(content, currency);

  // Calculate unit totals for the table data, considering service tax
  const tables = calculateUnitTotals(tableData, currency, cleanPrice(serviceTax));

  // Return an object containing the processed data
  return {
    tables,
    tax,
    otherFee,
    discount,
    currency,
  };
};

/**
 * Organize invoice-specific data.
 *
 * @param {Object} data - The invoice data.
 * @returns {Object} The organized invoice information.
 */
const organizeInvoiceInfo = (data) => {
  // Extract the 'content' property from 'data'
  const { content } = data;

  // Extract and organize invoice data using the 'extractInvoiceData' function
  const invoiceData = extractInvoiceData(data.data, content);

  // Calculate invoice totals based on the extracted data
  const invoiceTotals = calculateInvoiceTotals(invoiceData);

  // Return an object containing organized invoice information
  return {
    // CSS style for the invoice body to format it when rendering
    bodyStyle:
      "<style>body{margin:0 auto;width:1024px;transform:scale(4);transform-origin:left top;padding:35px}</style>",

    // Generate the HTML table body using 'generateTableBody'
    tableBody: generateTableBody(invoiceData.tables),

    // Generate the HTML table foot (totals) using 'generateTableFoot'
    tableFoot: generateTableFoot(invoiceTotals),

    // Extract the total HTML from 'invoiceTotals' for the final price
    totalPrice: invoiceTotals.totalHtml,
  };
};

/**
 * Extract and organize data from Markdown content for generating an invoice or content.
 *
 * @param {string} markdown - The Markdown content to extract data from.
 * @returns {Object} An object containing various data for invoice or content generation.
 * @throws {Error} If required data is missing or validation fails.
 */
export const getReplacementArgs = (markdown) => {
  // Parse the front matter from the provided Markdown content
  const parsedData = matter(markdown);

  // Organize developer information from the parsed data
  const devInfo = organizeDeveloperInfo(parsedData.data);

  // Organize client information from the parsed data
  const clientInfo = organizeClientInfo(parsedData.data);

  // Organize project information from the parsed data
  const projectInfo = organizeProjectInfo(parsedData.data);

  // Organize invoice information based on the parsed data
  const invoiceArgs = organizeInvoiceInfo(parsedData);

  // Combine all organized information into a single object
  const contentArgs = {
    ...devInfo,
    ...clientInfo,
    ...projectInfo,
    ...invoiceArgs,
  };

  // Return the final object containing replacement arguments
  return contentArgs;
};
