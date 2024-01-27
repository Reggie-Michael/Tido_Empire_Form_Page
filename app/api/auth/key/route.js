import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const SECRET_KEY = process.env.NEXTAUTH_SECRET; // Replace with your actual secret key

const tokenData = {
  keyId: "",
  mode: "",
  verified: false,
};

const modeCheck = (value) => {
  if (value === "sales agent") {
    return process.env.SALES_AGENT_KEY;
  } else if (value === "admin") {
    return process.env.ADMIN_KEY;
  } else {
    return "default";
  }
};
const validateKey = (key, role) => {
  console.log("From validation:", " validation request received")
  let allInputsValid = true;
  const inputLength = key?.length;
  const minimumLength = 5;
  const maximumLength = 30;

  // Validation logic...

  // Check if key is missing
  console.log("From validation:", " checking key availability")
  if (!key) {
    allInputsValid = false;
    return "keyNull";
  }
  
  // Check if role is missing or invalid
  console.log("From validation:", " checking role availability")
  if (!role || (role !== "sales agent" && role !== "admin")) {
    allInputsValid = false;
    return "invalidRole";
  }
  
  // Check if key length is invalid
  console.log("From validation:", " checking input length")
  if (!(inputLength >= minimumLength && inputLength <= maximumLength)) {
    allInputsValid = false;
    return "minMaxInvalid";
  }
  
  // Check if key contains non-alphanumeric characters
  console.log("From validation:", " checking input pattern")
  const containsNonAlphaNumeric = /[^a-zA-Z0-9]/.test(key);
  if (containsNonAlphaNumeric) {
    allInputsValid = false;
    return "validateError";
  }

  if (allInputsValid) {
    return "pass";
  }
};

export const GET = async (request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Request received");
  // console.log(request)
  // Extract query parameters from the request
  const searchParams = request.nextUrl.searchParams
  // const query = searchParams.get('query')
  const token = searchParams.get('token');
  const role = searchParams.get('role');
  console.log(searchParams)
  // Use the extracted parameters or fallback to default values
  const passToken = token.length > 2 ? token : tokenData.keyId;
  const mode = role? role : tokenData.mode;
  console.log(passToken.length)                   
  console.log(mode)                   

  try {
    // Verify the token
    // console.log(tokenData);
    // console.log(passToken)
    console.log(!passToken)
    if (!tokenData.verified && !passToken) {
     
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorStatus: "keyAbsent",
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
    
    // Retrieve the key associated with the mode
    const passKey = modeCheck(mode);
    console.log(passKey)

    // Check if the decoded token matches the expected key
    const isValidKey = decodedToken.keyId === passKey;

    console.log(isValidKey)
    if (isValidKey) {
      // Return success response if the key is valid
      const res = {
        token: passToken,
        mode: mode,
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
          errorStatus: "invalidKey",
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
          errorStatus: "expiredKey",
          errorMessage: "Your token has expired. Please try again",
        }),
        {
          status: 404,
        }
      );
    } else {
      // Return error response for invalid token
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          errorStatus: "invalidKey",
          errorMessage: "Your token is invalid. Please try again",
        }),
        {
          status: 404,
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

    console.log("Key Processing");
    const { key, role } = await request.json();
    console.log(key, role)

    console.log("Key and Role validating...");
    const returnErrorMessage = validateKey(key, role);
    console.log("Key and Role validated");
    if (returnErrorMessage !== "pass") {
      console.log("validation fail!")
      return new Response(
        JSON.stringify({
          error: "Validation Error!",
          errorType: returnErrorMessage,
        }),
        { status: 400 }
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
    if (!role) {
      console.log(" Role not present");
      return new Response(
        JSON.stringify({
          error: "Key and Mode need to be present",
          errorType: "roleNull",
        }),
        { status: 400 }
      );
    }
    console.log("Key Processed");

    if (role !== "sales agent" && role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "Mode not Supported, input valid mode",
          errorType: "invalidMode",
        }),
        { status: 400 }
      );
    }

    const passKey = modeCheck(role);
    console.log(passKey);

    // const check = "process.env." + mode;
    // Perform key verification logic here (e.g., check against a database)
    const isValidKey = key === passKey; // Replace with your validation logic

    console.log(key, passKey);
    console.log(isValidKey);
    if (!isValidKey) {
      return new Response(
        JSON.stringify({ error: "Invalid key", errorType: "invalidKey" }),
        {
          status: 400,
        }
      );
    }

    // Generate a JWT token with relevant information
    console.log("token generating");
    const token = jwt.sign({ keyId: key, role: role }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log("token generated");

    tokenData.keyId = token;
    tokenData.mode = role;
    tokenData.verified = true;

    const res = {
      token: token,
      mode: role,
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
