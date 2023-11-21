import {
  calculatePercentage, cleanNumber, cleanPrice, formatPrice,
} from "./utils.js";

/**
 * Checks if an amount is valid (not null, not NaN, and greater than 0).
 *
 * @param {number} amount - The amount to check.
 * @returns {boolean} True if the amount is valid, otherwise false.
 */
const isValidAmount = (amount) => amount !== null && !Number.isNaN(cleanPrice(amount)) && amount > 0;

/**
 * Validates a price value by checking if it can be parsed as a valid number.
 *
 * @param {string|number} value - The price value to validate.
 * @returns {boolean} True if the value is a valid price, otherwise false.
 */
const validatePrice = (value) => {
  // Parse the value as a number
  const parsedValue = cleanPrice(value);

  // Check if the parsed value is not NaN
  return !Number.isNaN(parsedValue);
};

/**
 * Validates a quantity value by checking if it can be parsed as a valid integer.
 *
 * @param {string|number} value - The quantity value to validate.
 * @returns {boolean} True if the value is a valid quantity, otherwise false.
 */
const validateQty = (value) => {
  // Parse the value as a number
  const parsedValue = cleanNumber(value);

  // Check if the parsed value is not NaN and is an integer
  return !Number.isNaN(parsedValue) && Number.isInteger(parsedValue);
};

/**
 * Validates data rows by checking for price and quantity columns and filters the columns to expected names.
 *
 * @param {Array} data - The data to validate and filter.
 * @throws {Error} If there are missing or invalid columns in the data.
 * @returns {Array} The data with validated and filtered columns.
 */
export const validateAndFilterColumns = (data) => {
  // Expected column names
  const expectedColumns = ["item", "price", "qty"];

  // Create an array to store the validated data
  const validatedData = data.map((row) => {
    const validatedRow = {};

    // Iterate over the expected columns
    expectedColumns.forEach((column) => {
      if (Object.prototype.hasOwnProperty.call(row, column)) {
        // If the column exists, add it to the validated row
        validatedRow[column] = row[column];
      } else {
        // If the column is missing, throw an error
        throw new Error(`Missing expected column '${column}'`);
      }
    });

    return validatedRow;
  });

  return validatedData;
};

/**
 * Validates the data rows for price and quantity columns.
 *
 * @param {Array} data - An array of data rows to be validated.
 * @throws {Error} Throws an error if validation errors are found.
 */
export const validateDataRows = (data) => {
  // Create an array to store validation errors
  const errors = data.flatMap((row, index) => {
    const rowErrors = [];

    // Check if the "price" column exists and is not valid
    if (row.price !== undefined && !validatePrice(row.price)) {
      rowErrors.push(`Object ${index + 1}: Invalid Price`);
    }

    // Check if the "qty" column exists and is not valid
    if (row.qty !== undefined && !validateQty(row.qty)) {
      rowErrors.push(`Object ${index + 1}: Invalid Qty`);
    }

    return rowErrors; // An array of errors for the current row
  });

  // If there are errors, throw an error with all the error messages
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
};

/**
 * Calculates unit totals and formats prices and totals with and without tax.
 *
 * @param {Array} data - The data to calculate unit totals for.
 * @param {string} currency - The currency symbol.
 * @param {number} serviceTax - The service tax rate.
 * @returns {Array} The data with calculated unit totals and formatted prices.
 */
export const calculateUnitTotals = (data, currency, serviceTax = 1) => data.map((row) => {
  // Extract the values from the row
  const { price, qty } = row;

  // Helper function to format an amount with the specified currency
  const formatAmount = (amount) => formatPrice(amount, currency);

  // Calculate the unit total without tax
  const priceWithoutTax = cleanPrice(price);
  const totalWithoutTax = qty * priceWithoutTax;

  // Calculate the unit total with tax
  const taxRate = isValidAmount(serviceTax) ? cleanPrice(serviceTax) : 0;
  const priceWithTax = priceWithoutTax + calculatePercentage(priceWithoutTax, taxRate);
  const totalWithTax = qty * priceWithTax;

  // Format the values with and without tax
  const priceHtml = formatAmount(price);
  const totalHtml = formatAmount(totalWithoutTax);
  const priceHtmlWithTax = formatAmount(priceWithTax);
  const totalHtmlWithTax = formatAmount(totalWithTax);

  // Return the updated row
  return {
    ...row,
    price: priceWithoutTax,
    total: totalWithoutTax,
    priceHtml,
    totalHtml,
    priceWithTax,
    totalWithTax,
    priceHtmlWithTax,
    totalHtmlWithTax,
  };
});

/**
 * Calculates invoice totals based on the extracted data.
 *
 * @param {Object} data - The extracted invoice data.
 * @returns {Object} The calculated invoice totals.
 */
export const calculateInvoiceTotals = (data) => {
  // Helper function to calculate an amount, with a default value of 0 if not valid
  const calculateAmount = (value, defaultValue = 0) => (isValidAmount(value) ? cleanPrice(value) : defaultValue);

  // Extract currency option
  const { currency } = data;

  // Calculate tax, otherFee, and discount with defaults if not valid
  const tax = calculateAmount(data?.tax);
  const otherFee = calculateAmount(data?.otherFee);
  const discount = calculateAmount(data?.discount);

  // Calculate subtotal as the sum of 'totalWithTax' from each row
  const subtotal = data?.tables.reduce((acc, row) => acc + row.totalWithTax, 0);

  // Calculate tax amount, other fee amount, discount amount, and total
  const taxAmt = calculatePercentage(subtotal, tax);
  const otherFeeAmt = calculatePercentage(subtotal, otherFee);
  const total = subtotal + taxAmt + otherFeeAmt - discount;

  // Helper function to format an amount with the specified currency
  const formatAmount = (amount) => formatPrice(amount, currency);

  // Return an object with calculated totals, each formatted with currency
  return {
    subtotal,
    tax,
    taxAmt,
    discount,
    otherFee,
    otherFeeAmt,
    total,
    subtotalHtml: formatAmount(subtotal),
    taxAmtHtml: formatAmount(taxAmt),
    otherFeeAmtHtml: formatAmount(otherFeeAmt),
    discountHtml: formatAmount(discount),
    totalHtml: formatAmount(Math.round(total)),
  };
};
