import jwt from "jsonwebtoken";
import { connectToDB } from "@/utils/database";
import crypto from "crypto";
import SalesAgentKey from "@/models/agentKey";

const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key
let numberOfTries = 3;
let retryCountdown;

const getRandomKey = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  //   const length = 20; // Set the desired length of the key
  const length = Math.floor(Math.random() * (20 - 12 + 1)) + 12; // Set the desired length of the key
  console.log(`generating random key of length ${length}`);
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters[randomIndex];
  }

  return key;
};
export const GET = async (request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (retryCountdown && new Date() > retryCountdown) {
    numberOfTries = 3; // Reset the number of retries
    retryCountdown = null; // Reset the countdown timer
  }
  if (numberOfTries === 0)
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
        //    state: "redirect",
      }),
      {
        status: 401,
      }
    );
  }
  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];
  // Use the extracted parameters or fallback to default values
  //   console.log(token.length);

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
    // Verification Ends, Key Generation starts
    const agentKey = getRandomKey();

    console.log(agentKey);

    try {
      await connectToDB();
      const newAgentKey = new SalesAgentKey({
        key: agentKey,
        creationDate: new Date().toISOString(),
      });
      await newAgentKey.save();
      if (numberOfTries <= 1) {
        // If maximum number of tries reached, set the countdown timer
        retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 10 minutes
      }
      numberOfTries--;
      console.log("Key successfully saved");
      return new Response(
        JSON.stringify({
          success: true,
          key: agentKey,
          message: "Key Generated and saved",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error contacting database", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error Creating Agent" }),
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
