import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key
let numberOfTries = 3;
let retryCountdown;

const tokenData = {
  keyId: "",
  verified: false,
};

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
  console.log(tokenData);

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
  console.log("token", token);
  // Use the extracted parameters or fallback to default values
  const passToken = token ? token : tokenData.keyId;
  console.log(passToken.length);
  console.log(passToken, tokenData.keyId);

  try {
    // Verify the token
    // console.log(tokenData);
    // console.log(passToken)
    console.log(!passToken);
    if (!tokenData.verified && !passToken) {
     console.log("Access not verified")
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
    console.log(decodedToken);

    // Check if the decoded token matches the expected key
    const isValidKey = decodedToken.keyId === process.env.ADMIN_KEY;

    console.log(isValidKey);
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
    console.log("request received");
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
    console.log("Key Processing");
    const { key } = await request.json();
    console.log(key);

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
    console.log("Key Processed");

    // Perform key verification logic here (e.g., check against a database)
    const isValidKey = key === process.env.ADMIN_KEY; // Replace with your validation logic

    console.log(key, process.env.ADMIN_KEY);
    console.log(isValidKey);
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
    console.log("token generating");
    const token = jwt.sign({ keyId: key }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log("token generated");

    tokenData.keyId = token;
    tokenData.verified = true;

    console.log(tokenData);
    const res = {
      token: token,
      checkStatus: "verified",
      error: false,
      errorMessage: "",
    };

    console.log("response returning");
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
