/**
 * Import necessary Node.js modules and libraries
 */
import date from "date-and-time"; // Library for date and time formatting
import latinize from "latinize"; // Library for converting accented characters to their non-accented counterparts
import slugify from "slugify"; // Library for converting strings into URL-friendly slugs

/**
 * List of currency symbols and codes.
 */
const CURRENCIES = [
  { usd: "$" },
  { aud: "$" },
  { gbp: "£" },
  { eur: "€" },
  { inr: "₹" },
  { brl: "R$" },
  { cad: "$" },
  { hkd: "$" },
  { ils: "₪" },
  { jpy: "¥" },
  { mxn: "$" },
  { twd: "NT$" },
  { nzd: "$" },
  { php: "P" },
  { sgd: "$" },
  { thb: "฿" },
  { kes: "Ksh" },
  { ngn: "₦" },
];

/**
 * Formats a date string using a specified format.
 *
 * @param {string} dateString - The date string to format.
 * @param {string} format - The desired date format (default: "MMM DD, YYYY").
 * @returns {string} The formatted date.
 */
export const formatDate = (dateString, format = "MMM DD, YYYY") => date.format(new Date(dateString), format);

/**
 * Gets the current date formatted according to a specified format.
 *
 * @param {string} format - The desired date format (default: "MMM DD, YYYY").
 * @returns {string} The current date in the specified format.
 */
export const currentDate = (format = "MMM DD, YYYY") => date.format(new Date(), format);

/**
 * Checks if a value is empty or falsy.
 *
 * @param {any} value - The value to check for emptiness.
 * @returns {boolean} True if the value is empty or falsy, otherwise false.
 */
const isEmpty = (value) => value == null || value === "" || value === undefined;

/**
 * Converts a price string to a floating-point number.
 *
 * @param {string} price - The price string to clean.
 * @returns {number | null} The cleaned price as a floating-point number, or null if the input is empty or undefined.
 */
export const cleanPrice = (price) => (isEmpty(price) ? null : parseFloat(price));

/**
 * Converts a string to an integer.
 *
 * @param {string} num - The string to convert to an integer.
 * @returns {number | null} The integer representation of the string, or null if the input is empty or undefined.
 */
export const cleanNumber = (num) => (isEmpty(num) ? null : parseInt(num, 10));

/**
 * Converts a string to a URL-friendly slug.
 *
 * @param {string} string - The string to slugify.
 * @param {boolean} lower - Convert to lowercase (default: true).
 * @returns {string} The slugified string.
 */
export const generateSlug = (string, lower = true) => slugify(latinize(string), { lower });

/**
 * Slugify keys of an object.
 *
 * @param {Object} obj - The object with keys to slugify.
 * @returns {Object} An object with slugified keys.
 */
export const slugifyObjectKeys = (obj) => {
  // Create an empty object to store the slugified key-value pairs
  const slugifiedObj = {};

  // Iterate through the keys of the input object
  Object.keys(obj).forEach((key) => {
    // Generate a slugified version of the key by removing accents and converting to lowercase
    const slugifiedKey = slugify(latinize(key), { lower: true });

    // Assign the original value from the input object to the slugified key in the new object
    slugifiedObj[slugifiedKey] = obj[key];
  });

  // Return the new object with slugified keys
  return slugifiedObj;
};

/**
 * Converts newlines to HTML paragraphs.
 *
 * @param {string} inputString - The input string.
 * @returns {string} The input string converted to HTML paragraphs.
 */
export const parseDescription = (inputString) => {
  // Split the input string into lines, removing leading and trailing whitespace
  const lines = inputString
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");

  // If there are no lines left after filtering, return an empty string
  if (lines.length === 0) {
    return "";
  }

  // Convert each line into a paragraph wrapped in <p> tags and join them together
  const paragraphs = lines.map((line) => `<p>${line}</p>`).join("");

  // Wrap the paragraphs in a <div> with some margin to separate them
  return `<div class="my-4">${paragraphs}</div>`;
};

/**
 * Converts newlines to an HTML ordered list.
 *
 * @param {string} inputString - The input string.
 * @returns {string} The input string converted to an HTML ordered list.
 */
export const parseNotes = (inputString) => {
  // Split the input string into lines, removing leading and trailing whitespace
  const lines = inputString
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");

  // If there are no lines left after filtering, return an empty string
  if (lines.length === 0) {
    return "";
  }

  // Convert each line into a list item (<li>) and join them together
  const orderedList = lines.map((line) => `<li>${line}</li>`).join("");

  // Wrap the ordered list in a <h6> heading with a class "fw-bold"
  // and surround it with an ordered list (<ol>)
  return `<h6 class="fw-bold">Notes:</h6><ol>${orderedList}</ol>`;
};

/**
 * Get the currency symbol associated with a currency code.
 *
 * @param {string} currencyCode - The currency code.
 * @returns {string} The currency symbol, or an empty string if not found.
 */
const getCurrencySymbol = (currencyCode) => {
  // Convert the currency code to lowercase for case-insensitive lookup
  const code = currencyCode.toLowerCase();

  // Find the corresponding currency object in the CURRENCIES array
  const currencyObj = CURRENCIES.find((curr) => curr[code]);

  // Return the currency symbol, or an empty string if not found
  return currencyObj ? currencyObj[code] : "";
};

/**
 * Format a price value with an optional currency symbol.
 *
 * @param {number} value - The price value to format.
 * @param {string} currency - The currency code (default: "usd").
 * @returns {string} The formatted price, including the currency symbol (if available).
 */
export const formatPrice = (value, currency = "usd") => [getCurrencySymbol(currency), parseFloat(value).toFixed(2)]
  .filter(Boolean)
  .join("");

/**
 * Generate the output image filename based on the Date.now() and a provided image type.
 *
 * @param {string} type - The image type, either 'jpeg' or 'png'. Defaults to 'jpeg'.
 * @returns {string} The generated output image filename.
 */
export const getOutputImageName = (type = "jpeg") => {
  // Generate a unique slug combining "Estimate" and the current date and time
  const uniqueSlug = generateSlug(["Estimate Image", Date.now()].join(" "), false);

  // Combine the unique slug with the specified image type to form the filename
  return [uniqueSlug, type].join(".");
};

/**
 * Calculate the percentage of a value.
 *
 * @param {number} value - The value to calculate the percentage of.
 * @param {number} percent - The percentage to calculate.
 * @returns {number} The result of the percentage calculation.
 */
export const calculatePercentage = (value, percent) => {
  // Check if 'value' and 'percent' are valid numbers
  if (Number.isNaN(value) || Number.isNaN(percent)) {
    throw new Error("Both 'value' and 'percent' must be valid numbers.");
  }

  // Calculate the percentage and return the result
  return (value * percent) / 100;
};
