import { redirect } from "next/navigation";
import Agent from "@/models/agent";
import fs from "fs";
import { join } from "path";

import path from "path";
import { connectToDB } from "@/utils/database";
import nodemailer from "nodemailer";
import crypto from "crypto";
import SalesAgentKey from "@/models/agentKey";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sgMail from "@sendgrid/mail";
import { uploadFile } from "@/utils/driveUpload";
import { writeToLogFile } from "@/utils/saveError";
const SECRET_KEY = process.env.SITE_SECRET; // Replace with your actual secret key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
const passData = {
  id: "",
  type: "",
};
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
  passData.id = "";
  passData.type = "";
};
const validateMainName = (name) => {
  const minLength = inputLength.nameMinLength;
  const maxLength = inputLength.nameMaxLength;
  const nameRegex = /^[a-zA-Z ]+$/;
  try {
    let message = null;

    if (!name) {
      message = { error: "inputNull", type: "fNameNull" };
    } else if (!isValidExpression(name, nameRegex)) {
      message = { error: "validateError", type: "fNameValidateError" };
    } else if (!isWithinLengthRange(name, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "fNameVoidCharLength" };
    }

    return message ? message : "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};
const validateOtherName = (name) => {
  const minLength = inputLength.nameMinLength;
  const maxLength = inputLength.nameMaxLength;
  const nameRegex = /^[a-zA-Z ]+$/;

  try {
    let message = null;

    if (agency !== "company") {
      if (!name) {
        message = { error: "inputNull", type: "lNameNull" };
      } else if (!isValidExpression(name, nameRegex)) {
        message = { error: "validateError", type: "lNameValidateError" };
      } else if (!isWithinLengthRange(name, minLength, maxLength)) {
        message = { error: "minMaxInvalid", type: "lNameVoidCharLength" };
      }
    }

    return message ? message : "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
  try {
    if (!email) {
      return { error: "inputNull", type: "emailNull" };
    } else if (!isValidExpression(email, emailRegex)) {
      return { error: "validateError", type: "emailValidateError" };
    }

    return "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};
const validatePhoneNumber = (phoneNumber) => {
  const minLength = inputLength.numberMinLength;
  const maxLength = inputLength.numberMaxLength;
  const numberRegex = /^[0-9\+\-\ ]+$/;

  try {
    let message = null;

    if (!phoneNumber) {
      message = { error: "inputNull", type: "pNumberNull" };
    } else if (!isValidExpression(phoneNumber, numberRegex)) {
      message = { error: "validateError", type: "pNumberValidateError" };
    } else if (!isWithinLengthRange(phoneNumber, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "pNumberVoidCharLength" };
    }

    return message ? message : "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};
const validateCacNumber = (cacNo) => {
  const minLength = inputLength.numberMinLength;
  const maxLength = inputLength.numberMaxLength;
  const cacNoRegex = /^[0-9 ]+$/;

  try {
    let message = null;

    if (!cacNo) {
      message = { error: "inputNull", type: "cacNoNull" };
    } else if (!isValidExpression(cacNo, cacNoRegex)) {
      message = { error: "validateError", type: "cacNoValidateError" };
    } else if (!isWithinLengthRange(cacNo, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "cacNoVoidCharLength" };
    }

    return message ? message : "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};
const validateAddress = (address) => {
  const addressRegex = /^[a-zA-Z0-9\+\-\@ ]+$/;

  try {
    if (!address) {
      return { error: "inputNull", type: "addressNull" };
    } else if (!isValidExpression(address, addressRegex)) {
      return { error: "validateError", type: "addressValidateError" };
    }

    return "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};
const validateImage = (image) => {
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

    return "passCheck";
  } catch (error) {
    return "internalValidationError";
  }
};

// Function to save the image
const saveImage = async (imageFile, imageName) => {
  const folderId = process.env.GOOGLE_DRIVE_AGENT_FOLDER;
  const uploadFolder = "./data/uploads"; // Update this with your actual path

  // Get the file extension from the image file name
  const fileExtension = imageFile.name.split(".").pop();

  // Append the file extension to the image name
  const tempFileName = `${imageName}.${fileExtension}`;

  // Path to the temporary file
  const tempFilePath = join(uploadFolder, tempFileName);

  try {
    // Convert the image data to a Buffer
    const imageData = Buffer.from(await imageFile.arrayBuffer());

    // Write the image data to the temporary file
    fs.writeFileSync(tempFilePath, imageData);

    // Upload the temporary file to Google Drive
    await uploadFile(tempFilePath, imageName, folderId);

    // Return the temporary file path
    return `${folderId}/imageName`;
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error in Signup Saving image Function",
        backendServerUrl: "api/auth/signup",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
    return null; // Return null if there was an error
  } finally {
    // Delete the temporary file after uploading
    fs.unlinkSync(tempFilePath);
  }
};
// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST, // Use Hostinger's SMTP host
  port: process.env.EMAIL_SERVER_PORT,
  secure: true, // Set to true if using SSL
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
  // const msg = {
  //   to: email, // Change to your recipient
  //   from: 'michael', // Change to your verified sender
  //   subject: 'Sending with SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // }

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    // await sgMail.send(msg)

    return { verificationCode, expirationTime }; // Return the verification code so it can be verified later
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error in Signup Verification Code Generation",
        referrerUrl: request.headers.referer,
        backendServerUrl: "api/auth/signup",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
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

const validateCode = async (verificationCode) => {
  try {
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
    try {
      const errorData = {
        errorMessage: "Error in Verfication code Vallidation",
        backendServerUrl: "api/auth/signup",
        error: error, // Add your error message here
      };
       await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }
};

const isCodeExpired = (expirationTime) => {
  const currentTime = Date.now();
  return currentTime > expirationTime;
};

const generateAgencyKey = async (type) => {
  const token = jwt.sign({ keyId: process.env.ADMIN_KEY }, SECRET_KEY, {
    expiresIn: "1h",
  });
  try {
    // Make a GET request to the Paystack Transaction Verification API
    const uri = `${process.env.SITE_URL}/api/generate_key?type=${type}`;
    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Internal-API-Call": "true",
      },
    });

    // Check if the request was successful
    if (response.ok) {
      // Parse the response JSON
      const data = await response.json();
      // Return the transaction data
      return {
        success: true,
        agentKey: data?.key,
      };
    } else {
      // Handle error response
      try {
        const errorData = {
          errorMessage: "Error generating agency key: signup route",
          referrerUrl: response?.headers?.referer,
          backendServerUrl: response?.url,
          error: error, // Add your error message here
          requestData: response, // Include the request data here
        };
        await writeToLogFile({ errorData });
      } catch (err) {
        console.error("Error writing to log file:", err);
      }
      return {
        success: false,
        errorStatus: response.status,
      };
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "An error occurred while generating agent key:",
        referrerUrl: response?.headers?.referer,
        backendServerUrl: "api/auth/signup",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
    return {
      success: false,
      errorStatus: 500,
    };
  }
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

  try {
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
        const searchParams = request.nextUrl.searchParams;
        // const query = searchParams.get('query')
        const resendVerification = searchParams.get("retry");
        const email = formData?.email;
        const maskedEmail = maskEmail(email);
        try {
          if (resendVerification) {
            const verificationMessage = await sendVerificationCode(email)
              .then((result) => {
                return result;
              })
              .catch((error) => {
                console.log("Error in send verification", error);
              });

            verificationData.code = verificationMessage.verificationCode;
            verificationData.expTime = verificationMessage.expirationTime;
            if (numberOfTries <= 1) {
              // If maximum number of tries reached, set the countdown timer
              retryCountdown = new Date(Date.now() + 10 * 60 * 1000); // Set countdown timer for 30 minutes
            }
            numberOfTries--;

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
          try {
            const errorData = {
              errorMessage: "error sending verification code",
              referrerUrl: request.headers.referer,
              backendServerUrl: request.url,
              error: error, // Add your error message here
              requestData: request, // Include the request data here
            };
            await writeToLogFile({ errorData });
          } catch (err) {
            console.error("Error writing to log file:", err);
          }
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
    try {
      const errorData = {
        errorMessage: "Error getting access status(Get signup route)",
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
    } catch (error) {}

    // Check if the request body contains JSON data
    let requestBody = null;
    try {
      requestBody = await request.json();
    } catch (error) {}
    // Determine the submission state based on the presence of formData
    const submissionState = newFormData ? "initial" : "verification";

    if (submissionState == "initial") {
      try {
        // const newFormData = await request.formData();
        // const formDataKeys = Object.keys(formData);
        // const formDataMatch = formDataKeys.every(
        //   (key) => formData[key] === newFormData.get(key)
        // );

        // const agency = newFormData.get("agency");

        if (numberOfTries === 0)
          return new Response(
            JSON.stringify({
              error: "Max Number of Tries in 10 minutes used up",
              errorType: "maxTriesOverlapped",
            }),
            { status: 403 }
          );
        // if (!passData.id) passData = newFormData.get("passKeyData");
        if (!passData.id) {
          const passKeyData = newFormData.get("passKeyData");
          passData.id = passKeyData ? JSON.parse(passKeyData).keyId : null;
          passData.type = passKeyData ? JSON.parse(passKeyData).keyType : null;
        }
        if (!passData.id) {
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
              const keyExist = await SalesAgentKey.findById(passData.id);

              if (!keyExist) {
                return new Response(
                  JSON.stringify({
                    error: "PassKey is absent!",
                    errorType: "keyAbsent",
                  }),
                  { status: 403 }
                );
              }
              if (keyExist.type == "agency" && agency == "company") {
                resetData();
                return new Response(
                  JSON.stringify({
                    error: "Agency cannot create other agency!",
                    errorType: "unauthorizedCreation",
                  }),
                  { status: 403 }
                );
              }
              const nameType = agency === "company" ? "Company" : "Agent";
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

              if (existingAgent) {
                const agentId = existingAgent._id;
                // const returnRef = `${process.env.SITE_URL}/?r=${agentId}`;

                if (passData.type !== "agency") {
                  try {
                    await SalesAgentKey.findByIdAndDelete(passData.id);
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
                }
                resetData();
                return new Response(
                  JSON.stringify({
                    success: true,
                    status: "verified",
                    ref: agentId,
                    key: existingAgent.key,
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
                  return result;
                })
                .catch((error) => {
                  console.log("Error in send verification", error);
                });
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
            } catch (error) {
              try {
                const errorData = {
                  errorMessage:
                    "Error Performing Database Validation(initial signup/continue on abrupt leave)",
                  referrerUrl: request.headers.referer,
                  backendServerUrl: request.url,
                  error: error, // Add your error message here
                  requestData: request, // Include the request data here
                };
                await writeToLogFile({ errorData });
              } catch (err) {
                console.error("Error writing to log file:", err);
              }
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

        //     //
        agency = newFormData.get("agency");
        if (!agency || !["company", "individual"].includes(agency)) {
          return new Response(
            JSON.stringify({
              error: "Agency is not valid",
              errorType: "agencyInvalid",
            }),
            { status: 400 }
          );
        }
        // Define validation rules based on agency type

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

        // Validate form data
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

        // Check for internal server error
        // Check if any value in the errors object is equal to the desired error value
        if (
          Object.values(errors).some(
            (error) => error === "internalValidationError"
          )
        ) {
          // Handle the case where the desired error value is found
          return new Response("Internal server error", { status: 500 });
        }

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

        // Form data is valid, proceed with processing
        try {
          await connectToDB();
          const keyExist = await SalesAgentKey.findById(passData.id);

          if (!keyExist) {
            return new Response(
              JSON.stringify({
                error: "PassKey is absent!",
                errorType: "keyAbsent",
              }),
              { status: 403 }
            );
          }
          if (keyExist.type == "agency" && agency == "company") {
            resetData();

            return new Response(
              JSON.stringify({
                error: "Agency cannot create other agency!",
                errorType: "unauthorizedCreation",
              }),
              { status: 403 }
            );
          }
          const nameType = agency === "company" ? "Company" : "Agent";

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

          if (existingAgent) {
            const agentId = existingAgent._id;
            // const returnRef = `${process.env.SITE_URL}/?r=${agentId}`;
            if (passData.type !== "agency") {
              try {
                await SalesAgentKey.findByIdAndDelete(passData.id);
              } catch (error) {
                return new Response(
                  JSON.stringify({ success: true, type: "awaitConfirmation" }),
                  {
                    status: 500,
                  }
                );
              }
            }
            resetData();

            return new Response(
              JSON.stringify({
                success: true,
                status: "verified",
                ref: agentId,
                key: existingAgent.key,
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
              return result;
            })
            .catch((error) => {
              console.log("Error in send verification", error);
            });

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
        } catch (error) {
          try {
            const errorData = {
              errorMessage:
                "Error Performing Database Validation(initial signup)",
              referrerUrl: request.headers.referer,
              backendServerUrl: request.url,
              error: error, // Add your error message here
              requestData: request, // Include the request data here
            };
            await writeToLogFile({ errorData });
          } catch (err) {
            console.error("Error writing to log file:", err);
          }
          return new Response("Error Performing Database Validation", {
            status: 500,
          });
        }
      } catch (error) {
        try {
          const errorData = {
            errorMessage: "Error storing agent signup data(initial signup)",
            referrerUrl: request.headers.referer,
            backendServerUrl: request.url,
            error: error, // Add your error message here
            requestData: request, // Include the request data here
          };
          await writeToLogFile({ errorData });
        } catch (err) {
          console.error("Error writing to log file:", err);
        }
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

      if (!passData.id) {
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
        if (numberOfTries <= 1) {
          // If maximum number of tries reached, set the countdown timer
          retryCountdown = new Date(Date.now() + 30 * 60 * 1000); // Set countdown timer for 30 minutes
        }
        numberOfTries--;
        const email = formData?.email;
        const verificationMessage = await sendVerificationCode(email)
          .then((result) => {
            return result;
          })
          .catch((error) => {
            console.log("Error in send verification", error);
          });

        verificationData.code = verificationMessage.verificationCode;
        verificationData.expTime = verificationMessage.expirationTime;
        return new Response(
          JSON.stringify({
            error: "Code is expired !",
            errorType: "expiredCode",
          }),
          { status: 400 }
        );
      }
      const savedVerificationCode = verificationData.code;
      const codeValidation = await validateCode(userVerificationCode);
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

      if (
        userVerificationCode.toString().trim() !==
        savedVerificationCode.toString().trim()
      ) {
        if (numberOfTries <= 1) {
          // If maximum number of tries reached, set the countdown timer
          retryCountdown = new Date(Date.now() + 30 * 60 * 1000); // Set countdown timer for 30 minutes
        }
        numberOfTries--;
        const verificationMessage = await sendVerificationCode(email)
          .then((result) => {
            return result;
          })
          .catch((error) => {
            console.log("Error in send verification", error);
          });

        verificationData.code = verificationMessage.verificationCode;
        verificationData.expTime = verificationMessage.expirationTime;
        return new Response(
          JSON.stringify({ error: "Code is wrong", errorType: "invalidCode" }),
          { status: 400 }
        );
      }
      // Save the image
      const imageFile = formData?.image;
      const imageName =
        agency === "company"
          ? `${formData?.companyName}_Logo`
          : `${formData?.fName}_${formData?.lName}_profilePicture`;
      const imagePath = await saveImage(imageFile, imageName);
      try {
        await connectToDB();
        const keyExist = await SalesAgentKey.findById(passData.id);

        if (!keyExist) {
          return new Response(
            JSON.stringify({
              error: "PassKey is absent!",
              errorType: "keyAbsent",
            }),
            { status: 403 }
          );
        }
        if (keyExist.type == "agency" && agency == "company") {
          resetData();

          return new Response(
            JSON.stringify({
              error: "Agency cannot create other agency!",
              errorType: "unauthorizedCreation",
            }),
            { status: 403 }
          );
        }
        const agencyKey =
          agency === "company" ? await generateAgencyKey("agency") : null;
        if (agencyKey === 500 || typeof agencyKey == "number") {
          return new Response(
            JSON.stringify({ success: false, type: "keyGenError" }),
            {
              status: 500,
            }
          );
        }
        const company = await Agent.findOne({ key: keyExist.key });
        const companyKey =
          agency !== "company" && keyExist.type == "agency"
            ? passData?.id
            : null;
        const companyRelationId =
          !company || company == null ? company : company?._id;

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
          key: agency == "company" ? agencyKey.agentKey : "",
          companyKeyId: companyKey,
          companyKey: keyExist.type == "agency" ? keyExist.key : null,
          companyRelation: company ? company._id : null,
          referral: `${agentName}_ref_120`,
          creationDate: new Date().toISOString(),
        });
        await newAgent.save();
        const agentId = newAgent._id;
        // const returnRef = `${process.env.SITE_URL}/?r=${agentId}`;
        const keyStillExist = await SalesAgentKey.findById(passData.id);
        if (!keyStillExist) {
          return new Response(
            JSON.stringify({
              error: "PassKey is absent!",
              errorType: "keyAbsent",
            }),
            { status: 403 }
          );
        }
        if (passData.type !== "agency") {
          try {
            await SalesAgentKey.findByIdAndDelete(passData.id);
          } catch (error) {
            return new Response(
              JSON.stringify({ success: true, type: "awaitConfirmation" }),
              {
                status: 500,
              }
            );
          }
        }

        resetData();
        return new Response(
          JSON.stringify({ success: true, ref: agentId, key: newAgent.key }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        try {
          const errorData = {
            errorMessage:
              "Error Performing Database Validation(verification code signup)",
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
    try {
      const errorData = {
        errorMessage: "Error in Agent Signup(POST) route",
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
      JSON.stringify({ message: "Internal Server Error", type: null }),
      { status: 500 }
    );
  }
};
