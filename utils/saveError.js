import fs from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadFile } from "./driveUpload";

export const writeToLogFile = async ({ errorData }) => {
  const {
    errorMessage,
    backendServerUrl,
    error: receivedErrorData,
    referrerUrl,
    requestData,
  } = errorData;
  const webStatus = process.env.WEB_STATUS;
  const timestampIso = new Date().toISOString();
  const timestamp = new Date()
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(/[/:]/g, "_")
    .replace(",", " at"); // Replace colons with underscores

  const formatRequestData = (request) => {
    if (!request) return null;
    const data = {
      method: request.method,
      url: request.url.toString(),
      headers: {},
    };

    // Extract headers
    for (const [key, value] of request.headers) {
      data.headers[key] = value.toString();
    }

    // Access body content if possible (if applicable in your case)
    if (request.body && typeof request.body === "string") {
      // Handle string body format directly
      data.body = request.body;
    } else if (request.body && request.body.stream) {
      // Handle readable stream content (complex, potentially requires decoding)
      // ... (conversion logic for body content, potentially using streams or buffers)
      // This part might be framework-specific and depends on how your request body is handled.
    } else {
      // Body is not accessible or in a format we can't handle
      data.body = "Body not available";
    }

    return JSON.stringify(data, null, 2); // Indented for readability
  };

  const formatError = (error) => {
    // Prioritize error.stack for built-in Error objects
    if (error instanceof Error) {
      return error.stack; // Includes error message, file, line number, and stack trace
    } else {
      try {
        const parsedError = JSON.parse(error); // Attempt to parse as JSON
        if (parsedError && parsedError.message) {
          // If parsed successfully and has a message, use parsed error object
          return `${parsedError.name || "Non-Error Error"}: ${
            parsedError.message
          }\n${parsedError.stack || parsedError}`;
        } else {
          // Otherwise, fall back to plain stringification
          return JSON.stringify(error, null, 2); // Indented for readability
        }
      } catch (err) {
        // If parsing fails, return original error as a string
        return String(error);
      }
    }
  };

  const logMessage = `
  Timestamp: ${timestampIso} \n
  Referrer/Frontend Url: ${referrerUrl} \n
  Backend Receiver URL: ${backendServerUrl} \n
  Error Message: ${errorMessage} \n
  Error Object: ${formatError(receivedErrorData)}\n
  Request Data: ${formatRequestData(requestData)}, 
\n \n`;

  try {
    const fileName = `Tido ${webStatus} Log Message ${timestamp}_${uuidv4()}.txt`;
    const folderId = process.env.GOOGLE_DRIVE_LOG_FOLDER; // Specify the folder ID in Google Drive

    // Upload the log message directly to Google Drive
    uploadFile(logMessage, fileName, folderId, true);
  } catch (err) {
    console.error("Error uploading log message to Google Drive:", err.message);
  }
};
