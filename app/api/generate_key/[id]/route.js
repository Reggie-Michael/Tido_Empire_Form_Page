import jwt from "jsonwebtoken";
import { connectToDB } from "@/utils/database";
import SalesAgentKey from "@/models/agentKey";
import mongoose from "mongoose";
import { writeToLogFile } from "@/utils/saveError";

const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key
let numberOfTries = 3;
let retryCountdown;

const validateKey = async (key) => {
  try {
    const inputLength = key?.length;
    const containsNonAlphaNumeric = /[^a-zA-Z0-9]/.test(key);
    const minimumLength = 5;
    const maximumLength = 30;
    // Validation logic...
    if (!key) {
      return "keyNull";
    } else if (inputLength < minimumLength || inputLength > maximumLength) {
      return "minMaxInvalid";
    } else if (containsNonAlphaNumeric) {
      return "validateError";
    } else {
      return "pass";
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error validating key:",
        backendServerUrl: "Agent Key delete [id] api route",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }
};
export const DELETE = async (request, { params }) => {
  if (request.method !== "DELETE") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  const internalApiCall = request.headers.get("X-Internal-API-Call");
  if (retryCountdown && new Date() > retryCountdown) {
    numberOfTries = 3; // Reset the number of retries
    retryCountdown = null; // Reset the countdown timer
  }
  if (numberOfTries === 0 && !internalApiCall)
    return new Response(
      JSON.stringify({
        error: "Max Number of Tries in 10 minutes used up",
        errorType: "maxTriesOverlapped",
      }),
      { status: 403 }
    );
  // Extract query parameters from the request
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({
        error: "Authorization header missing",
        errorType: "authorizationHeaderMissing",
      }),
      {
        status: 401,
      }
    );
  }
  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];
  const key = params.id;

  try {
    // Verify the token
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorStatus: "tokenAbsent",
          state: "redirect",
          errorMessage:
            "This is a forbidden route need to input key to access this route",
        }),
        {
          status: 401,
        }
      );
    }

    const decodedToken = jwt.verify(token, SECRET_KEY);

    // Check if the decoded token matches the expected key
    const isValidKey = decodedToken.keyId === process.env.ADMIN_KEY;
    if (!isValidKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          state: "redirect",
          errorStatus: "invalidKey",
          errorMessage: "Your token is wrong. Please try again",
        }),
        {
          status: 400,
        }
      );
    }

    if (!key) {
      return new Response(
        JSON.stringify({
          error: "Key and Mode need to be present",
          errorType: "keyNull",
        }),
        { status: 400 }
      );
    }
    const returnErrorMessage = await validateKey(key);
    if (returnErrorMessage !== "pass") {
      if (numberOfTries <= 1) {
        // If maximum number of tries reached, set the countdown timer
        retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 10 minutes
      }
      numberOfTries--;
      return new Response(
        JSON.stringify({
          error: "Validation Error!",
          errorType: returnErrorMessage,
        }),
        { status: 400 }
      );
    }
    // Verification Ends, Key Deletion starts

    try {
      await connectToDB();
      const deletedKey = await SalesAgentKey.findOneAndDelete({ key });

      // Check if the key was found and deleted successfully
      if (!deletedKey) {
        return new Response(
          JSON.stringify({
            success: true,
            errorType: "keyNotFound",
            message: "Key not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Return a success response
      if (numberOfTries <= 1) {
        // If maximum number of tries reached, set the countdown timer
        retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 10 minutes
      }
      numberOfTries--;
      return new Response(
        JSON.stringify({
          success: true,

          message: "Key deleted successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      try {
        const errorData = {
          errorMessage: "Error contacting database",
          referrerUrl: request.headers.referer,
          backendServerUrl: request.url,
          error: error, // Add your error message here
          requestData: request, // Include the request data here
        };
        await writeToLogFile({ errorData });
      } catch (err) {
        console.error("Error writing to log file:", err);
      }
      return new Response(
        JSON.stringify({ success: false, message: "Error deleting Agent Key" }),
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle token verification errors
    if (error.name === "TokenExpiredError") {
      // Return error response for expired token
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorStatus: "expiredKey",
          state: "redirect",
          errorMessage: "Your token has expired. Please try again",
        }),
        {
          status: 400,
        }
      );
    } else {
      // Return error response for invalid token
      try {
        const errorData = {
          errorMessage: "Error Deleting Key",
          referrerUrl: request.headers.referer,
          backendServerUrl: request.url,
          error: error, // Add your error message here
          requestData: request, // Include the request data here
        };
        await writeToLogFile({ errorData });
      } catch (err) {
        console.error("Error writing to log file:", err);
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorStatus: "serverError",
          errorMessage: "An unexpected error occurred. Please try again later",
        }),
        {
          status: 500,
        }
      );
    }
  }
};
