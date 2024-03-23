import { google } from "googleapis";
import fs from "fs";
import stream from "stream";
import mime from "mime"; // Import the 'mime' library for MIME type detection

// Load service account credentials from environment variables
// Create an OAuth2 client with the service account credentials
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.GOOGLE_SERVICE_TYPE,
    project_id: process.env.GOOGLE_SERVICE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_SERVICE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Replace escaped newline characters with actual newlines
    client_email: process.env.GOOGLE_SERVICE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_SERVICE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_SERVICE_AUTH_URI,
    token_uri: process.env.GOOGLE_SERVICE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.GOOGLE_SERVICE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_SERVICE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_SERVICE_UNIVERSE_DOMAIN,
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// Create a Drive instance
const drive = google.drive({ version: "v3", auth });

// Function to upload a file to Google Drive
export async function uploadFile(
  fileData,
  fileName,
  folderId,
  actualFile = false,
  image = false
) {
  try {
    // Validate input parameters
    if (!fileData || !fileName || !folderId) {
      throw new Error(
        "Invalid input parameters. Please provide file data, file name, and folder ID."
      );
    }

    // Read the file content
    const tempFileContent = actualFile
      ? fileData
      : fs.createReadStream(fileData);
    const fileContent = image
      ? new stream.PassThrough().end(tempFileContent)
      : tempFileContent;
    // Detect MIME type based on file extension (assuming fileData is a path)
    let mimeType = "application/octet-stream";
    if (!actualFile) {
      mimeType = mime.getType(fileData); // Use 'mime' library
    }

    // Upload file to Drive
    const response = await drive.files.create({
      resource: {
        name: fileName,
        parents: [folderId], // Specify the parent folder ID
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: fileContent,
        fields: "id",
      },
    });

    // console.log("File uploaded:", response.data);
    // return response.data.id; // Return the uploaded file ID
  } catch (error) {
    console.error("Error uploading file:", error);
    // return null; // Return null on error
  }
}
