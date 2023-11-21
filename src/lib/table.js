/**
 * Generates the table body HTML from the given data.
 *
 * @param {Array} data - The data for the table body.
 * @returns {string} The table body HTML.
 */
export const generateTableBody = (data) => `<tbody>${data
  .map(
    (item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="text-start">${item.item}</td>
      <td>${item.priceHtmlWithTax}</td>
      <td>${item.qty}</td>
      <td>${item.totalHtmlWithTax}</td>
    </tr>`,
  )
  .join("")}</tbody>`;

/**
 * Generates the table footer HTML from the given data.
 *
 * @param {object} data - The data for generating the table footer.
 * @returns {string} The table footer HTML.
 */
export const generateTableFoot = (data) => {
  // Initialize an array to store the table footer rows
  const rows = [];

  /**
   * Generates a placeholder row in the table footer.
   *
   * @param {string} label - The label for the placeholder.
   * @param {string} value - The value to display in the placeholder.
   * @returns {string} The placeholder row HTML.
   */
  const placeholder = (label, value) => `
    <tr>
      <td></td>
      <td colspan="3" class="text-end">${label}:</td>
      <td>${value}</td>
    </tr>
  `;

  // If there is a subtotal, add a row for it
  if (data.subtotal > 0) {
    rows.push(placeholder("Subtotal", data.subtotalHtml));
  }

  // If there is tax, add a row for it
  if (data.tax > 0) {
    const taxLabel = `Tax (${data.tax}%)`;
    rows.push(placeholder(taxLabel, data.taxAmtHtml));
  }

  // If there is a discount, add a row for it
  if (data.discount > 0) {
    rows.push(placeholder("Discount", `-${data.discountHtml}`));
  }

  // If there is another fee, add a row for it
  if (data.otherFee > 0) {
    const otherFeeLabel = `Additional Fees (Paypal, Conversion, etc) (${data.otherFee}%)`;
    rows.push(placeholder(otherFeeLabel, data.otherFeeAmtHtml));
  }

  // Add a row for the total with a background and bold styling
  rows.push(`
    <tr class="fw-bold">
      <td colspan="2"></td>
      <td colspan="2" class="text-end bg-secondary text-success fs-5">Total:</td>
      <td class="bg-secondary text-success fs-5">${data.totalHtml}</td>
    </tr>
  `);

  // Return the footer HTML containing all the generated rows
  return `<tfoot>${rows.join("")}</tfoot>`;
};
