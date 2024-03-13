import SalesAgentKey from "@/models/agentKey";
import { connectToDB } from "@/utils/database";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const savedKeyData = {
  keyData: "",
  // keyType: "",
  verified: false,
};

// const resetData
const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key

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

  console.log("Request received");
  console.log("savedKeyData from get route", savedKeyData);

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
        console.log(typeof authHeader)

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
    //     console.log("passKey", passKey);
    const encodedKeyData = savedKeyData.keyData || passKey;
    console.log(!encodedKeyData, encodedKeyData);
    
    if (!encodedKeyData || encodedKeyData == "null") {
      console.log("returning unauthorized");
      return new Response(
        JSON.stringify({
          error: "No saved Data available!",
          errorType: "unauthorized",
        }),
        { status: 401 }
      );
    }
    const decodedKeyData = jwt.verify(encodedKeyData, SECRET_KEY);

    console.log(decodedKeyData)
    const keyId = decodedKeyData.keyId;
    const keyType = decodedKeyData.type;

    console.log(keyId, keyType)
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
      console.error("Error contacting database", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error verifying key" }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error getting access status", error);
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
     return new Response(
       JSON.stringify({
         success: false,
         error: true,
         errorStatus: "serverError",
         errorMessage:
           "An unexpected error occurred. Please try again later",
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
    console.log("request received");
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
    console.log("Key Processing");
    const { key } = await request.json();
    console.log(key);

    if (!key) {
      console.log("Key not present");
      return new Response(
        JSON.stringify({
          error: "Key and Mode need to be present",
          errorType: "keyNull2",
        }),
        { status: 400 }
      );
    }
    console.log("Key validating...");
    const returnErrorMessage = validateKey(key);
    console.log("Key validated", returnErrorMessage);
    if (returnErrorMessage !== "pass") {
      console.log("validation fail!");
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
    console.log("Key Processed");

    try {
      await connectToDB();
      // Check if the key exists
      const keyData = await SalesAgentKey.findOne({ key: key, expired: false });
      console.log(keyData)

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
      const keyToken = jwt.sign({ keyId: keyData._id, type: keyData.type }, SECRET_KEY, {
        expiresIn: "3h",
      });
      console.log("token generated");

      // savedKeyData.keyId = keyData.type;
      savedKeyData.keyData = keyToken;
      savedKeyData.verified = true;
      
      console.log("Key successfully saved");
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
      console.error("Error contacting database", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error verifying key" }),
        { status: 500 }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  } 
};
