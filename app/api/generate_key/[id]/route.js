import jwt from "jsonwebtoken";
import { connectToDB } from "@/utils/database";
import SalesAgentKey from "@/models/agentKey";
import mongoose from "mongoose";

const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key
let numberOfTries = 3;
let retryCountdown;

const validateKey = (key) => {
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
    console.error("Error validating key:", error);
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
  console.log("Request received");
  // console.log(request)
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
  console.log(request);
  const  key  = params.id;
  console.log(key);

  try {
    // Verify the token
    // console.log(tokenData);
    // console.log(passToken)
    console.log(!token);
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
    console.log(decodedToken);

    // Check if the decoded token matches the expected key
    const isValidKey = decodedToken.keyId === process.env.ADMIN_KEY;

    console.log(isValidKey);
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
      console.log("Key not present");
      return new Response(
        JSON.stringify({
          error: "Key and Mode need to be present",
          errorType: "keyNull",
        }),
        { status: 400 }
      );
    }
    console.log("Key validating...");
    const returnErrorMessage = validateKey(key);
    console.log("Key validated", returnErrorMessage);
    if (returnErrorMessage !== "pass") {
      console.log("validation fail!");
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
    console.log("Key Processed");
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
      console.log("Key successfully deleted");
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
      console.error("Error contacting database", error);
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
