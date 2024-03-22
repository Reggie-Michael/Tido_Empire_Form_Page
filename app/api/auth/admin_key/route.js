import { writeToLogFile } from "@/utils/saveError";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key
let numberOfTries = 3;
let retryCountdown;

const tokenData = {
  keyId: "",
  verified: false,
};

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
        backendServerUrl: "Admin Key api route",
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
  if (numberOfTries === 0)
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
  // Use the extracted parameters or fallback to default values
  const passToken = token ? token : tokenData.keyId;

  try {
    // Verify the token
    if (!tokenData.verified && !passToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorType: "keyAbsent",
          errorMessage:
            "This is a forbidden route need to input key to access this route",
        }),
        {
          status: 401,
        }
      );
    }

    const decodedToken = jwt.verify(passToken, SECRET_KEY);

    // Check if the decoded token matches the expected key
    const isValidKey = decodedToken.keyId === process.env.ADMIN_KEY;

    if (isValidKey) {
      // Return success response if the key is valid
      const res = {
        token: passToken,
        success: true,
        error: false,
        errorMessage: "",
      };

      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Return error response if the key is invalid
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorType: "invalidKey",
          errorMessage: "Your token is wrong. Please try again",
        }),
        {
          status: 400,
        }
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
          errorType: "expiredKey",
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
          errorMessage: "Error Validating Admin Key",
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
          errorType: "serverError",
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
    const { key } = await request.json();

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
    console.log(returnErrorMessage)
    if (returnErrorMessage !== "pass") {
      if (numberOfTries <= 1) {
        // If maximum number of tries reached, set the countdown timer
        retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 30 minutes
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

    // Perform key verification logic here (e.g., check against a database)
    const isValidKey = key === process.env.ADMIN_KEY; // Replace with your validation logic

    if (!isValidKey) {
      if (numberOfTries <= 1) {
        // If maximum number of tries reached, set the countdown timer
        retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 30 minutes
      }
      numberOfTries--;
      return new Response(
        JSON.stringify({ error: "Invalid key", errorType: "invalidKey" }),
        {
          status: 400,
        }
      );
    }

    // Generate a JWT token with relevant information
    const token = jwt.sign({ keyId: key }, SECRET_KEY, {
      expiresIn: "1h",
    });

    tokenData.keyId = token;
    tokenData.verified = true;
    const res = {
      token: token,
      checkStatus: "verified",
      error: false,
      errorMessage: "",
    };

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error Validating Admin Key(post route)",
        referrerUrl: request.headers.referer,
        backendServerUrl: request.url,
        error: error, // Add your error message here
        requestData: request, // Include the request data here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
    return new Response("Internal Server Error", { status: 500 });
  }
};
