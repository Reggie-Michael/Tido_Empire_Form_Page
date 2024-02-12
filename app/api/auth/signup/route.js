import { redirect } from "next/navigation";
import Agent from "@/models/agent";
import fs from "fs";
import path from "path";
import { connectToDB } from "@/utils/database";
import nodemailer from "nodemailer";
import crypto from "crypto";
import SalesAgentKey from "@/models/agentKey";

const formData = {
  fName: "",
  lName: "",
  companyName: "",
  email: "",
  pNumber: "",
  image: "",
  cacNo: "",
  address: "",
};

let agency;
let passId;
const verificationData = {
  code: "",
  expTime: "",
};
let numberOfTries = 3;
let retryCountdown;
const inputLength = {
  nameMinLength: agency === "company" ? 4 : 2,
  nameMaxLength: agency === "company" ? 35 : 15,
  numberMinLength: 7,
  numberMaxLength: 25,
};
const isValidExpression = (name, regex) => regex.test(name);
const isWithinLengthRange = (str, minLength, maxLength) =>
  str.length >= minLength && str.length <= maxLength;

const resetData = () => {
  formData.fName = "";
  formData.lName = "";
  formData.companyName = "";
  formData.email = "";
  formData.pNumber = "";
  formData.image = "";
  formData.cacNo = "";
  formData.address = "";
  verificationData.code = "";
  verificationData.expTime = "";
  agency = "";
  passId= "";
};
const validateMainName = (name) => {
  const minLength = inputLength.nameMinLength;
  const maxLength = inputLength.nameMaxLength;
  const nameRegex = /^[a-zA-Z ]+$/;
  try {
    let message = null;
    console.log("validating main name");

    if (!name) {
      message = { error: "inputNull", type: "fNameNull" };
    } else if (!isValidExpression(name, nameRegex)) {
      message = { error: "validateError", type: "fNameValidateError" };
    } else if (!isWithinLengthRange(name, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "fNameVoidCharLength" };
    }
    console.log("Validated MainName");

    return message ? message : "passCheck";
  } catch (error) {
    console.error("Error validating mainName", error);
    return "internalValidationError";
  }
};
const validateOtherName = (name) => {
  const minLength = inputLength.nameMinLength;
  const maxLength = inputLength.nameMaxLength;
  const nameRegex = /^[a-zA-Z ]+$/;

  try {
    let message = null;
    console.log("Validating OtherName");

    if (agency !== "company") {
      if (!name) {
        message = { error: "inputNull", type: "lNameNull" };
      } else if (!isValidExpression(name, nameRegex)) {
        message = { error: "validateError", type: "lNameValidateError" };
      } else if (!isWithinLengthRange(name, minLength, maxLength)) {
        message = { error: "minMaxInvalid", type: "lNameVoidCharLength" };
      }
    }
    console.log("Validated OtherName");

    return message ? message : "passCheck";
  } catch (error) {
    console.error("Error validating otherName", error);
    return "internalValidationError";
  }
};
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
  console.log("Validating Email");
  try {
    if (!email) {
      return { error: "inputNull", type: "emailNull" };
    } else if (!isValidExpression(email, emailRegex)) {
      return { error: "validateError", type: "emailValidateError" };
    }
    console.log("Validated Email");

    return "passCheck";
  } catch (error) {
    console.error("Error validating email", error);
    return "internalValidationError";
  }
};
const validatePhoneNumber = (phoneNumber) => {
  const minLength = inputLength.numberMinLength;
  const maxLength = inputLength.numberMaxLength;
  const numberRegex = /^[0-9\+\-\ ]+$/;

  try {
    let message = null;
    console.log("Validating PNumber");

    if (!phoneNumber) {
      message = { error: "inputNull", type: "pNumberNull" };
    } else if (!isValidExpression(phoneNumber, numberRegex)) {
      message = { error: "validateError", type: "pNumberValidateError" };
    } else if (!isWithinLengthRange(phoneNumber, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "pNumberVoidCharLength" };
    }
    console.log("Validated Phone Number");

    return message ? message : "passCheck";
  } catch (error) {
    console.error("Error validating pNumber", error);
    return "internalValidationError";
  }
};
const validateCacNumber = (cacNo) => {
  const minLength = inputLength.numberMinLength;
  const maxLength = inputLength.numberMaxLength;
  const cacNoRegex = /^[0-9 ]+$/;

  try {
    let message = null;

    console.log("Validating CacNo");
    console.log(typeof cacNo);

    if (!cacNo) {
      console.log("No cacNo");
      message = { error: "inputNull", type: "cacNoNull" };
    } else if (!isValidExpression(cacNo, cacNoRegex)) {
      console.log("Cac Number validate error");
      message = { error: "validateError", type: "cacNoValidateError" };
    } else if (!isWithinLengthRange(cacNo, minLength, maxLength)) {
      console.log("cacNo length validate error");
      message = { error: "minMaxInvalid", type: "cacNoVoidCharLength" };
    }

    console.log("Validated CacNo");

    return message ? message : "passCheck";
  } catch (error) {
    console.error("error validating cacNo", error);
    return "internalValidationError";
  }
};
const validateAddress = (address) => {
  const addressRegex = /^[a-zA-Z0-9\+\-\@ ]+$/;
  console.log("Validating Address");

  try {
    if (!address) {
      return { error: "inputNull", type: "addressNull" };
    } else if (!isValidExpression(address, addressRegex)) {
      return { error: "validateError", type: "addressValidateError" };
    }

    console.log("Validated Address");

    return "passCheck";
  } catch (error) {
    console.error("Error validating Address", error);
    return "internalValidationError";
  }
};
const validateImage = (image) => {
  console.log("Validating Image");
  try {
    if (image) {
      const allowedImageTypes = ["jpg", "jpeg", "png"];

      const isAllowedImageType = (file) => {
        const fileType = file.type.toLowerCase();
        const fileExtension = fileType.split("/")[1];
        return allowedImageTypes.includes(fileExtension);
      };

      // Check file type
      if (!image.type.startsWith("image") && !isAllowedImageType(image)) {
        const message = { error: "validateError", type: "imageValidateError" };
        return message;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        const message = { error: "minMaxInvalid", type: "imageTooLarge" };
        return message;
      }

      // Optionally check image dimensions
      // For example, check if width and height are at least 100 pixels
      // const img = new Image();
      // img.onload = () => {
      //   if (img.width < 100 || img.height < 100) {
      //     setError("Image dimensions must be at least 100x100 pixels.");
      //     return;
      //   }
      // };
      // img.src = URL.createObjectURL(file);
    } else {
      const message = { error: "inputNull", type: "imageNull" };
      return message;
    }
    console.log("ValidatedImage");

    return "passCheck";
  } catch (error) {
    console.error("Error validating Image", error);
    return "internalValidationError";
  }
};

// Function to save the image
const saveImage = async (imageFile, imageName) => {
  const uploadFolder = "./app/uploads"; // Update this with your actual path

  // Get the file extension from the image file name
  const fileExtension = imageFile.name.split(".").pop();

  // Append the file extension to the image name
  const imagePath = `${uploadFolder}/${imageName}.${fileExtension}`;

  try {
    // Convert the image data to a Buffer
    const imageData = Buffer.from(await imageFile.arrayBuffer());

    // Write the image data to the file
    fs.writeFileSync(imagePath, imageData);

    return imagePath;
  } catch (error) {
    console.error("Error saving image:", error);
    return null; // Return null if there was an error saving the image
  }
};
// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider here
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Function to generate a random verification code
// const generateVerificationCode = () => {
//   return Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit code
// };
const generateVerificationCode = () => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit code
  const timestamp = Date.now(); // Get current timestamp
  const expirationTime = timestamp + 10 * 60 * 1000; // Add ten minutes in milliseconds
  return { verificationCode, expirationTime };
};
// Function to send verification code to email
const sendVerificationCode = async (email) => {
  const { verificationCode, expirationTime } = generateVerificationCode();

  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to: email,
    subject: "Tido Sales Agent Verification Code",
    text: ` Your verification code is: ${verificationCode} \n You just requested to create a sales agent account from Tido Empire with this email. \n Ignore this email if you did not.`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Verification code sent successfully.");
    return { verificationCode, expirationTime }; // Return the verification code so it can be verified later
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw new Error("Failed to send verification code");
  }
};

const maskEmail = (email) => {
  // Split the email address into username and domain parts
  const [username, domain] = email.split("@");

  // Mask characters in the username, leaving the first three characters visible
  const maskedUsername =
    username.slice(0, 3) + username.slice(3).replace(/./g, "*");

  // Return the masked email address
  return maskedUsername + "@" + domain;
};

const getFieldsToWatch = (agency) => {
  if (agency === "company") {
    return ["companyName", "email", "pNumber", "image", "cacNo", "address"];
  } else {
    return ["fName", "lName", "email", "pNumber", "image"];
  }
};

const inputVoid = () => {
  const fieldsToWatch = getFieldsToWatch(agency);
  return fieldsToWatch.some((field) => {
    const value = formData[field];
    return (typeof value === "string" && value.trim() === "") || value === null;
  });
};

const validateCode = (verificationCode) => {
  try {
    console.log("Validating verification code");
    const message = {
      codeValid: true,
      errorType: "",
    };
    const codeRegex = /^[0-9]{6}$/;

    if (!verificationCode) {
      message.codeValid = false;
      message.errorType = "codeNull";
    }
    if (!isValidExpression(verificationCode, codeRegex)) {
      message.codeValid = false;
      message.errorType = "codeValidateError";
    }
    if (verificationCode.length !== 6) {
      message.errorType = "codeValidateError";
    }

    return message;
  } catch (error) {
    console.error("Error Validation", error);
  }
};

const isCodeExpired = (expirationTime) => {
  const currentTime = Date.now();
  return currentTime > expirationTime;
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

  console.log("Request received");
  console.log("formData from get route", formData, agency);

  try {
    console.log("Particular Needed field is void", inputVoid());
    if (numberOfTries === 0)
      return new Response(
        JSON.stringify({
          error: "Max Number of Tries in 10 minutes used up",
          errorType: "maxTriesOverlapped",
        }),
        { status: 403 }
      );
    if (agency && formData) {
      if (!inputVoid()) {
        console.log("Resend verification route");
        const searchParams = request.nextUrl.searchParams;
        // const query = searchParams.get('query')
        const resendVerification = searchParams.get("retry");
        console.log("resendVerification", resendVerification);
        const email = formData?.email;
        const maskedEmail = maskEmail(email);
        try {
          if (resendVerification) {
            const verificationMessage = await sendVerificationCode(email)
              .then((result) => {
                console.log("Verification code:", result?.verificationCode);
                return result;
              })
              .catch((error) => {
                console.error("Error", error);
              });

            console.log("Verification Message", verificationMessage);
            verificationData.code = verificationMessage.verificationCode;
            verificationData.expTime = verificationMessage.expirationTime;
            if (numberOfTries <= 1) {
              // If maximum number of tries reached, set the countdown timer
              retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 30 minutes
            }
            numberOfTries--;
            console.log("Resend verification route closed");

            return new Response(
              JSON.stringify({
                authorized: true,
                status: "resendVerification",
                success: true,
                userEmail: maskedEmail,
              }),
              {
                status: 200,
              }
            );
          }
        } catch (error) {
          console.error(error);
        }
        return new Response(
          JSON.stringify({
            authorized: true,
            success: true,
            userEmail: maskedEmail,
          }),
          {
            status: 200,
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            authorized: false,
            success: false,
            error:
              "Your data is not saved. You will be redirected to where you wil be redirected to signup page again",
          }),
          {
            status: 400,
          }
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          authorized: false,
          success: false,
          error: "Need to Create an account first",
          errorType: "unauthorized",
        }),
        {
          status: 401,
        }
      );
    }
  } catch (error) {
    console.error("Error getting access status", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Error",
      }),
      {
        status: 500,
      }
    );
  }
};

export const POST = async (request) => {
  try {
    console.log("request received");
    console.log("formData", formData);
    // const submissionState = request.headers.get("Submission-State");
    // console.log(submissionState);
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
      });
    }
    if (retryCountdown && new Date() > retryCountdown) {
      numberOfTries = 3; // Reset the number of retries
      retryCountdown = null; // Reset the countdown timer
    }
    let newFormData = null;
    try {
      newFormData = await request.formData();
    } catch (error) {
      console.error("Error parsing request form:", error.message);
    }

    // Check if the request body contains JSON data
    let requestBody = null;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error("Error parsing request body as JSON:", error.message);
    }
    // Determine the submission state based on the presence of formData
    const submissionState = newFormData ? "initial" : "verification";

    if (submissionState == "initial") {
      try {
        console.log("form Processing");
        // const newFormData = await request.formData();
        const formDataKeys = Object.keys(formData);
        const formDataMatch = formDataKeys.every(
          (key) => formData[key] === newFormData.get(key)
        );

        console.log(newFormData);
        console.log(numberOfTries);
        // const agency = newFormData.get("agency");

        if (numberOfTries === 0)
          return new Response(
            JSON.stringify({
              error: "Max Number of Tries in 10 minutes used up",
              errorType: "maxTriesOverlapped",
            }),
            { status: 403 }
          );
        if (!passId) passId = newFormData.get("passKey");

        if (!passId) {
          return new Response(
            JSON.stringify({
              error: "PassKey is absent!",
              errorType: "KeyNull2",
            }),
            { status: 403 }
          );
        }

        // for retry before validation is done
        if (!inputVoid()) {
          numberOfTries--;
          if (!verificationData.code || !verificationData.expTime) {
            try {
              await connectToDB();
              const nameType = agency === "company" ? "Company" : "Agent";

              console.log("nameType", nameType);
              const existingAgentName = await Agent.findOne({
                mainName: formData?.fName || formData?.companyName,
              });
              const existingAgentOtherName = await Agent.findOne({
                otherName: formData?.lName,
              });

              const existingAgentEmail = await Agent.findOne({
                email: formData?.email,
              });
              const existingAgentPhoneNumber = await Agent.findOne({
                phoneNumber: formData?.pNumber,
              });

              const existingAgentCacNo = await Agent.findOne({
                cacNo: formData?.cacNo,
              });

              const existingAgent = await Agent.findOne({
                $and: [
                  { mainName: formData?.fName || formData?.companyName },
                  { otherName: formData?.lName },
                  { email: formData?.email },
                  { phoneNumber: formData?.pNumber },
                  { cacNo: formData?.cacNo },
                ],
              });

              console.log(existingAgent);
              if (existingAgent) {
                const agentId = existingAgent._id;
                console.log("Agent Exist and is being logged in");
                // const returnRef = `${process.env.SITE_URL}/?r=${agentId}`;

                try {
                  await SalesAgentKey.findByIdAndDelete(passId);
                } catch (error) {
                  return new Response(
                    JSON.stringify({
                      success: true,
                      type: "awaitConfirmation",
                    }),
                    {
                      status: 500,
                    }
                  );
                }
                resetData();
                return new Response(
                  JSON.stringify({
                    success: true,
                    status: "verified",
                    ref: agentId,
                  }),
                  {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                  }
                );
              }

              if (existingAgentName && existingAgentOtherName) {
                // If a document with the same name is found, return an error response
                const nameErrorType =
                  agency === "company" ? "nameExist" : "companyExist";
                console.log(nameErrorType);
                resetData();
                return new Response(
                  JSON.stringify({
                    error: `${nameType} name already exists"`,
                    errorType: nameErrorType,
                  }),
                  {
                    status: 400,
                  }
                );
              }

              if (existingAgentEmail) {
                // If a document with the same email is found, return an error response
                resetData();
                return new Response(
                  JSON.stringify({
                    error: `${nameType} email already exists"`,
                    errorType: "emailExist",
                  }),
                  {
                    status: 400,
                  }
                );
              }

              if (existingAgentPhoneNumber) {
                // If a document with the same email is found, return an error response
                resetData();
                return new Response(
                  JSON.stringify({
                    error: `${nameType} number already exists"`,
                    errorType: "pNumberExist",
                  }),
                  {
                    status: 400,
                  }
                );
              }

              if (agency === "company" && existingAgentCacNo) {
                // If a document with the same email is found, return an error response
                resetData();
                return new Response(
                  JSON.stringify({
                    error: `Company Cac Number already exists"`,
                    errorType: "cacNoExist",
                  }),
                  {
                    status: 400,
                  }
                );
              }
              const email = formData?.email;
              const verificationMessage = await sendVerificationCode(email)
                .then((result) => {
                  console.log("Verification code:", result?.verificationCode);
                  return result;
                })
                .catch((error) => {
                  console.error("Error", error);
                });

              console.log("Verification Message", verificationMessage);
              verificationData.code = verificationMessage.verificationCode;
              verificationData.expTime = verificationMessage.expirationTime;
              return new Response(
                JSON.stringify({
                  success: true,
                  status: "awaitingEmailVerification",
                }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                }
              );
              // try {
              // } catch (error) {
              //   console.error("error sending mail", error);
              // }
              // Find the existing prompt by ID
              // const existingPrompt = await Prompt.findById(params.id);

              // if (!existingPrompt) {
              //     return new Response("Prompt not found", { status: 404 });
              // }

              // // Update the prompt with new data
              // existingPrompt.prompt = prompt;
              // existingPrompt.tag = tag;

              // await existingPrompt.save();

              // return new Response("Successfully updated the Prompts", { status: 200 });
            } catch (error) {
              console.error("Error validating with database", error);
              return new Response("Error Performing Database Validation", {
                status: 500,
              });
            }
          }
          if (numberOfTries <= 1) {
            // If maximum number of tries reached, set the countdown timer
            retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 30 minutes
          }
          return new Response(
            JSON.stringify({
              success: true,
              status: "awaitingEmailVerification",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        agency = newFormData.get("agency");
        console.log("Checking Agency");
        if (!agency || !["company", "individual"].includes(agency)) {
          return new Response(
            JSON.stringify({
              error: "Agency is not valid",
              errorType: "agencyInvalid",
            }),
            { status: 400 }
          );
        }
        console.log(agency);
        // Define validation rules based on agency type
        console.log("Validation Rule called");

        const validationRules = {
          common: {
            email: validateEmail(newFormData.get("email")),
            pNumber: validatePhoneNumber(newFormData.get("pNumber")),
            image: validateImage(newFormData.get("image")),
          },
          company: {
            name: validateMainName(
              newFormData.get("companyName"),
              4,
              35,
              "companyName"
            ),
            cacNo: validateCacNumber(newFormData.get("cacNo")),
            address: validateAddress(newFormData.get("address")),
          },
          individual: {
            fName: validateMainName(newFormData.get("fName"), 2, 15, "fName"),
            lName: validateOtherName(newFormData.get("lName"), 2, 15, "lName"),
          },
        };
        console.log("Validating Form Data");

        // Validate form data
        console.log("Validating Form Data");
        const errors = {};
        const rules = validationRules[agency];
        Object.keys(rules).forEach((field) => {
          errors[field] = rules[field];
        });

        // Merge common validation errors
        const commonErrors = validationRules.common;
        Object.keys(commonErrors).forEach((field) => {
          if (!errors[field]) {
            errors[field] = commonErrors[field];
          }
        });

        // Check for validation errors
        const errorFields = Object.keys(errors).filter(
          (field) => errors[field] !== "passCheck"
        );

        console.log("errorFields", errorFields);
        console.log("errors", errors);

        // Check for internal server error
        console.log("checking for server error");
        // Check if any value in the errors object is equal to the desired error value
        if (
          Object.values(errors).some(
            (error) => error === "internalValidationError"
          )
        ) {
          // Handle the case where the desired error value is found
          console.log("returning 500");
          return new Response("Internal server error", { status: 500 });
        }

        console.log("checking for other error");
        if (errorFields.length > 0) {
          return new Response(
            JSON.stringify({ error: "Validation failed", errors }),
            { status: 400 }
          );
        }

        // Check for internal server error
        // if (errors.some((error) => error === 500)) {
        //   return new Response("Internal Server Error", { status: 500 });
        // }

        for (const entry of newFormData.entries()) {
          const [name, value] = entry;
          // formData.append(name, value);
          formData[name] = value;
        }
        console.log(agency);
        console.log(formData);

        // Form data is valid, proceed with processing
        try {
          await connectToDB();
          const nameType = agency === "company" ? "Company" : "Agent";

          console.log("nameType", nameType);
          const existingAgentName = await Agent.findOne({
            mainName: formData?.fName || formData?.companyName,
          });
          const existingAgentOtherName = await Agent.findOne({
            otherName: formData?.lName,
          });

          const existingAgentEmail = await Agent.findOne({
            email: formData?.email,
          });
          const existingAgentPhoneNumber = await Agent.findOne({
            phoneNumber: formData?.pNumber,
          });

          const existingAgentCacNo = await Agent.findOne({
            cacNo: formData?.cacNo,
          });

          const existingAgent = await Agent.findOne({
            $and: [
              { mainName: formData?.fName || formData?.companyName },
              { otherName: formData?.lName },
              { email: formData?.email },
              { phoneNumber: formData?.pNumber },
              { cacNo: formData?.cacNo },
            ],
          });

          console.log(existingAgent);
          if (existingAgent) {
            const agentId = existingAgent._id;
            console.log("Agent Exist and is being logged in");
            // const returnRef = `${process.env.SITE_URL}/?r=${agentId}`;
            try {
              await SalesAgentKey.findByIdAndDelete(passId);
            } catch (error) {
              return new Response(
                JSON.stringify({ success: true, type: "awaitConfirmation" }),
                {
                  status: 500,
                }
              );
            }
            resetData();

            return new Response(
              JSON.stringify({
                success: true,
                status: "verified",
                ref: agentId,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          if (existingAgentName && existingAgentOtherName) {
            // If a document with the same name is found, return an error response
            const nameErrorType =
              agency === "company" ? "nameExist" : "companyExist";
            console.log(nameErrorType);
            resetData();
            return new Response(
              JSON.stringify({
                error: `${nameType} name already exists"`,
                errorType: nameErrorType,
              }),
              {
                status: 400,
              }
            );
          }

          if (existingAgentEmail) {
            // If a document with the same email is found, return an error response
            resetData();
            return new Response(
              JSON.stringify({
                error: `${nameType} email already exists"`,
                errorType: "emailExist",
              }),
              {
                status: 400,
              }
            );
          }

          if (existingAgentPhoneNumber) {
            // If a document with the same email is found, return an error response
            resetData();
            return new Response(
              JSON.stringify({
                error: `${nameType} number already exists"`,
                errorType: "pNumberExist",
              }),
              {
                status: 400,
              }
            );
          }

          if (agency === "company" && existingAgentCacNo) {
            // If a document with the same email is found, return an error response
            resetData();
            return new Response(
              JSON.stringify({
                error: `Company Cac Number already exists"`,
                errorType: "cacNoExist",
              }),
              {
                status: 400,
              }
            );
          }
          const email = formData?.email;
          const verificationMessage = await sendVerificationCode(email)
            .then((result) => {
              console.log("Verification code:", result?.verificationCode);
              return result;
            })
            .catch((error) => {
              console.error("Error", error);
            });

          console.log("Verification Message", verificationMessage);
          verificationData.code = verificationMessage.verificationCode;
          verificationData.expTime = verificationMessage.expirationTime;
          return new Response(
            JSON.stringify({
              success: true,
              status: "awaitingEmailVerification",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
          // try {
          // } catch (error) {
          //   console.error("error sending mail", error);
          // }
          // Find the existing prompt by ID
          // const existingPrompt = await Prompt.findById(params.id);

          // if (!existingPrompt) {
          //     return new Response("Prompt not found", { status: 404 });
          // }

          // // Update the prompt with new data
          // existingPrompt.prompt = prompt;
          // existingPrompt.tag = tag;

          // await existingPrompt.save();

          // return new Response("Successfully updated the Prompts", { status: 200 });
        } catch (error) {
          console.error("Error validating with database", error);
          return new Response("Error Performing Database Validation", {
            status: 500,
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else if (submissionState == "verification") {
      if (retryCountdown && new Date() > retryCountdown) {
        numberOfTries = 3; // Reset the number of retries
        retryCountdown = null; // Reset the countdown timer
      }
      if (numberOfTries <= 1)
        return new Response(
          JSON.stringify({
            error: "Max Number of Tries in 10 minutes used up",
            errorType: "maxTriesOverlapped",
          }),
          { status: 403 }
        );
      // const requestBody = await request.json();
      console.log(requestBody, newFormData);

      if (!passId) {
        return new Response(
          JSON.stringify({
            error: "PassKey is absent!",
            errorType: "keyNull2",
          }),
          { status: 403 }
        );
      }

      if (!requestBody) {
        resetData();
        return new Response(
          JSON.stringify({
            error: "Code is Null !",
            errorType: "codeNull",
          }),
          { status: 400 }
        );
      }
      const userVerificationCode = requestBody?.verificationCode;
      if (!userVerificationCode)
        return new Response(
          JSON.stringify({
            error: "Code is Null !",
            errorType: "codeNull",
          }),
          { status: 400 }
        );
      if (isCodeExpired(verificationData.expTime)) {
        console.log("Code is expired", verificationData.expTime);
        if (numberOfTries <= 1) {
          // If maximum number of tries reached, set the countdown timer
          retryCountdown = new Date(Date.now() + 30 * 60 * 1000); // Set countdown timer for 30 minutes
        }
        numberOfTries--;
        return new Response(
          JSON.stringify({
            error: "Code is expired !",
            errorType: "expiredCode",
          }),
          { status: 400 }
        );
      }
      console.log("Verifying code");
      const savedVerificationCode = verificationData.code;
      const codeValidation = validateCode(userVerificationCode);
      console.log(codeValidation);
      if (!codeValidation.codeValid) {
        if (numberOfTries <= 1) {
          // If maximum number of tries reached, set the countdown timer
          retryCountdown = new Date(Date.now() + 30 * 60 * 1000); // Set countdown timer for 30 minutes
        }
        numberOfTries--;
        return new Response(
          JSON.stringify({
            error: "Validation Error!",
            errorType: codeValidation.errorType,
          }),
          { status: 400 }
        );
      }
      console.log("crosschecking verification");

      if (
        userVerificationCode.toString().trim() !==
        savedVerificationCode.toString()
      ) {
        console.log("crosschecking verification false");
        if (numberOfTries <= 1) {
          // If maximum number of tries reached, set the countdown timer
          retryCountdown = new Date(Date.now() + 30 * 60 * 1000); // Set countdown timer for 30 minutes
        }
        numberOfTries--;
        return new Response(
          JSON.stringify({ error: "Code is wrong", errorType: "invalidCode" }),
          { status: 400 }
        );
      }
      console.log("savingImage");
      // Save the image
      const imageFile = formData?.image;
      const imageName =
        agency === "company"
          ? `${formData?.companyName}_Logo`
          : `${formData?.fName}_${formData?.lName}_profilePicture`;
      const imagePath = await saveImage(imageFile, imageName);
      console.log(imagePath);
      try {
        await connectToDB();
        const keyExist = await SalesAgentKey.findById(passId);

        if (!keyExist) {
          return new Response(
            JSON.stringify({
              error: "PassKey is absent!",
              errorType: "keyAbsent",
            }),
            { status: 403 }
          );
        }
        const agentName = `${formData?.fName || formData?.companyName} ${
          formData?.lName
        }`;
        const newAgent = new Agent({
          mainName: formData?.fName || formData?.companyName,
          otherName: formData?.lName,
          agency: formData?.agency,
          email: formData?.email,
          phoneNumber: formData?.pNumber,
          email: formData?.email,
          cacNo: formData?.cacNo,
          image: imagePath,
          referral: `${agentName}_ref_120`,
          creationDate: new Date().toISOString(),
        });
        await newAgent.save();
        const agentId = newAgent._id;
        console.log(agentId);
        // const returnRef = `${process.env.SITE_URL}/?r=${agentId}`;
        const keyStillExist = await SalesAgentKey.findById(passId);
        if (!keyStillExist) {
          return new Response(
            JSON.stringify({
              error: "PassKey is absent!",
              errorType: "keyAbsent",
            }),
            { status: 403 }
          );
        }
        try {
          await SalesAgentKey.findByIdAndDelete(passId);
        } catch (error) {
          return new Response(
            JSON.stringify({ success: true, type: "awaitConfirmation" }),
            {
              status: 500,
            }
          );
        }

        resetData();
        return new Response(JSON.stringify({ success: true, ref: agentId }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
        // const combinedData = `${agentId}-${agentName}`;

        // Use the combined data as the secret key for hashing
        // const hash = crypto.createHmac("sha256", agentId.toString());
        // hash.update(combinedData);
        // const hashedData = hash.digest("hex");

        // // Now you can use the hashedData as needed
        // console.log("Hashed Data:", hashedData);

        // Find the existing prompt by ID
        // const existingPrompt = await Prompt.findById(params.id);

        // if (!existingPrompt) {
        //     return new Response("Prompt not found", { status: 404 });
        // }

        // // Update the prompt with new data
        // existingPrompt.prompt = prompt;
        // existingPrompt.tag = tag;

        // await existingPrompt.save();

        // return new Response("Successfully updated the Prompts", { status: 200 });
      } catch (error) {
        console.error("Error contacting database", error);
        return new Response(
          JSON.stringify({ message: "Error Creating Agent", type: null }),
          { status: 500 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          error: "Unknown submission state",
          errorType: "invalidSubmission",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Internal Server Error", type: null }),
      { status: 500 }
    );
  }
};
