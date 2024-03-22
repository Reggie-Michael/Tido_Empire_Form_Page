import SalesAgentKey from "@/models/agentKey";
import { connectToDB } from "@/utils/database";
import { writeToLogFile } from "@/utils/saveError";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const savedKeyData = {
  keyData: "",
  // keyType: "",
  verified: false,
};

// const resetData
const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key

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
        backendServerUrl: "Agent Key api route",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }
};

export const GET = async (request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  //   if (retryCountdown && new Date() > retryCountdown) {
  //     numberOfTries = 3; // Reset the number of retries
  //     retryCountdown = null; // Reset the countdown timer
  //   }


  try {
    //     if (numberOfTries === 0)
    //       return new Response(
    //         JSON.stringify({
    //           error: "Max Number of Tries in 10 minutes used up",
    //           errorType: "maxTriesOverlapped",
    //         }),
    //         { status: 403 }
    //       );
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || typeof authHeader !== "string") {
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
    const passKey = authHeader.split(" ")[1];
    const encodedKeyData = savedKeyData.keyData || passKey;

    if (!encodedKeyData || encodedKeyData == "null") {
      return new Response(
        JSON.stringify({
          error: "No saved Data available!",
          errorType: "unauthorized",
        }),
        { status: 401 }
      );
    }
    const decodedKeyData = jwt.verify(encodedKeyData, SECRET_KEY);

    const keyId = decodedKeyData.keyId;
    const keyType = decodedKeyData.type;

    try {
      await connectToDB();
      // Check if the key exists
      const keyData = await SalesAgentKey.findById(keyId);

      if (!keyData) {
        // Key does not exist
        return new Response(
          JSON.stringify({
            error: "Key does not exist in database!",
            errorType: "keyAbsent",
          }),
          { status: 400 }
        );
      }

      // Check if the key is expired
      if (keyData.expired || keyData.expirationDate <= new Date()) {
        // Key is expired
        // Update the key data to mark it as expired
        await SalesAgentKey.findByIdAndUpdate(
          { keyId },
          { $set: { expired: true } },
          { new: true }
        );
        return new Response(
          JSON.stringify({
            error:
              "Key is expired! Please Contact Tido Empire to verify Key status.",
            errorType: "expiredKey",
          }),
          { status: 400 }
        );
      }

      //  if (numberOfTries <= 1) {
      //    // If maximum number of tries reached, set the countdown timer
      //    retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 10 minutes
      //  }
      //  numberOfTries--;
      if (!savedKeyData.keyData) {
        savedKeyData.keyData = encodedKeyData;
      }
      return new Response(
        JSON.stringify({
          success: true,
          key: keyId,
          type: keyType,
          message: "Key verified successfully",
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
        JSON.stringify({ success: false, message: "Error verifying key" }),
        { status: 500 }
      );
    }
  } catch (error) {
   
    if (error.name === "TokenExpiredError") {
      // Return error response for expired token
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorType: "sessionExpired",
          errorMessage: "Your key session has expired. Please try again",
        }),
        {
          status: 400,
        }
      );
    } else {
      // Return error response for invalid token
      try {
        const errorData = {
          errorMessage: "Error in Agent Key Verification(Get)",
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

export const POST = async (request) => {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
      });
    }
    //   if (retryCountdown && new Date() > retryCountdown) {
    //     numberOfTries = 3; // Reset the number of retries
    //     retryCountdown = null; // Reset the countdown timer
    //   }
    //   if (numberOfTries === 0)
    //     return new Response(
    //       JSON.stringify({
    //         error: "Max Number of Tries in 10 minutes used up",
    //         errorType: "maxTriesOverlapped",
    //       }),
    //       { status: 403 }
    //     );
    const { key } = await request.json();

    if (!key) {
      return new Response(
        JSON.stringify({
          error: "Key and Mode need to be present",
          errorType: "keyNull2",
        }),
        { status: 400 }
      );
    }
    const returnErrorMessage = validateKey(key);
    if (returnErrorMessage !== "pass") {
      //     if (numberOfTr ies <= 1) {
      //       // If maximum number of tries reached, set the countdown timer
      //       retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 30 minutes
      //     }
      //     numberOfTries--;
      return new Response(
        JSON.stringify({
          error: "Key Validation Error!",
          errorType: returnErrorMessage,
        }),
        { status: 400 }
      );
    }

    try {
      await connectToDB();
      // Check if the key exists
      const keyData = await SalesAgentKey.findOne({ key: key, expired: false });

      if (!keyData) {
        // Key does not exist
        return new Response(
          JSON.stringify({
            error:
              "Key does not exist! Contact Tido Empire to verify Key status.",
            errorType: "keyNonExistent",
          }),
          { status: 400 }
        );
      }

      // Check if the key is expired
      if (keyData.expired || keyData.expirationDate <= new Date()) {
        // Key is expired
        // Update the key data to mark it as expired
        await SalesAgentKey.findOneAndUpdate(
          { key: key },
          { $set: { expired: true } },
          { new: true }
        );
        return new Response(
          JSON.stringify({
            error:
              "Key is expired! Please Contact Tido Empire to verify Key status.",
            errorType: expiredKey,
          }),
          { status: 400 }
        );
      }

      //  if (numberOfTries <= 1) {
      //    // If maximum number of tries reached, set the countdown timer
      //    retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 10 minutes
      //  }
      //  numberOfTries--;
      const keyToken = jwt.sign(
        { keyId: keyData._id, type: keyData.type },
        SECRET_KEY,
        {
          expiresIn: "3h",
        }
      );

      // savedKeyData.keyId = keyData.type;
      savedKeyData.keyData = keyToken;
      savedKeyData.verified = true;
      return new Response(
        JSON.stringify({
          success: true,
          key: keyToken,
          message: "Key verified successfully",
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
        JSON.stringify({ success: false, message: "Error verifying key" }),
        { status: 500 }
      );
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error in Agent Key Verification(Post)",
        referrerUrl: request.headers.referer,
        backendServerUrl: request.url,
        error: error, // Add your error message here
        requestData: request, // Include the request data here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};
