#!/usr/bin/env node

/**
 * Import necessary Node.js modules and libraries
 */
import ora from "ora"; // Library for console spinner
import nodeHtmlToImage from "node-html-to-image"; // Library for converting HTML to image
import yargs from "yargs"; // Command-line argument parsing library
import { hideBin } from "yargs/helpers"; // Helper for hiding the script name in command-line arguments
import buildHtml from "./lib/template.js";
import { getOutputImageName } from "./lib/utils.js";
import { isValidMarkdownFile } from "./lib/file.js";

/**
 * Generate an image from a markdown file.
 */
(async () => {
  // Parse command-line arguments and provide usage information
  const { argv } = yargs(hideBin(process.argv))
    .command("$0 [markdown]", "Generate image from a markdown file.", (yarg) => {
      yarg
        .positional("markdown", {
          describe: "Path to a Markdown file.",
        })
        .option("type", {
          alias: "t",
          type: "string",
          default: "png",
          description: "Image type to generate (jpeg or png).",
        });
    })
    .help();

  // Initialize a spinner for visual feedback
  const spinner = ora("Image generation started...").start();

  try {
    // Retrieve command-line arguments
    const { markdown, type } = argv;

    // Update spinner text to indicate progress
    spinner.text = "Retrieving Markdown content...";

    // Check if the Markdown file path exists
    if (!isValidMarkdownFile(markdown)) {
      throw new Error("Please provide a valid markdown file path.");
    }

    // Check if the provided image type is valid
    if (!["png", "jpeg"].includes(type)) {
      throw new Error("Invalid image type. Use 'png' or 'jpeg'.");
    }

    // Generate the HTML content from the provided Markdown file
    const html = buildHtml(markdown);

    // Get the output image name based on the specified type
    const output = getOutputImageName(type);

    // Update the spinner text to indicate image generation
    spinner.text = "Generating image from Markdown...";

    // Generate the image using nodeHtmlToImage with specified type, HTML content, and output filename
    await nodeHtmlToImage({
      type, html, output, quality: 100,
    });

    // Indicate the successful image generation
    spinner.succeed(`Image successfully created! \nOutput Path: [${output}]\nTo open the image, hold Ctrl (or Command on Mac) and click on it.`);
  } catch (error) {
    // Handle and log any errors
    const errorMessage = error.message || error;
    // eslint-disable-next-line no-console
    spinner.fail(`Error: ${errorMessage}`);
    process.exit(1);
  } finally {
    // Stop the spinner
    spinner.stop();
  }
})();
