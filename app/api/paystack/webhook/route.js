import Agent from "@/models/agent";
import Customer from "@/models/customer";
import { connectToDB } from "@/utils/database";
import { writeToLogFile } from "@/utils/saveError";
import crypto from "crypto";
import mongoose from "mongoose";

const payStackSecretKey = process.env.PAYSTACK_API_SECRET_KEY;

// Function to retrieve transaction data from Paystack
const getTransactionData = async (referenceNo) => {
  try {
    // Make a GET request to the Paystack Transaction Verification API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${referenceNo}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${payStackSecretKey}`,
        },
      }
    );
    // Check if the request was successful
    if (response.ok) {
      // Parse the response JSON
      const data = await response.json();
      // Return the transaction data
      return data?.data;
    } else {
      // Handle error response

      try {
        const errorData = {
          errorMessage: response.status + " " + response.statusText,
          backendServerUrl: "Paystack Api route",
          // error: response , // Add your error message here
        };
        await writeToLogFile({ errorData });
      } catch (err) {
        console.error("Error writing to log file:", err);
      }
      if (response.status == 400) {
        return 400;
      } else {
        return null;
      }
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "An error occurred while retrieving transaction data:",
        backendServerUrl: "Paystack Api route",
        error: error, // Add your error message here
        // requestData: request, // Include the request data here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
    return null;
  }
};

const getReferrerData = async (agentId) => {
  try {
    if (!agentId || agentId == "null" || agentId == "undefined") return "admin";
    await connectToDB();
    const agentExist = await Agent.findById(agentId);
    if (agentExist !== null && agentExist !== undefined) {
      return agentId;
    } else {
      return "admin";
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error getting agent id",
        backendServerUrl: "Paystack Api route",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }
};

const saveCustomerData = async (agentId, customerData, shopLocation) => {
  try {
    const referrerId = agentId !== "admin" ? agentId : "";
    await connectToDB();
    console.log(customerData?.customer?.last_name?.trim(), typeof customerData?.customer?.last_name)
    if (agentId !== "admin") {
      const newCustomer = new Customer({
        referrer: referrerId,
        firstName: customerData?.customer?.first_name?.trim(),
        lastName: customerData?.customer?.last_name?.trim(),
        phoneNumber: customerData?.customer?.phone,
        email: customerData?.customer?.email,
        shopLocation: shopLocation || null,
        referenceNumber: customerData?.reference,
        purchaseDate: customerData?.paid_at,
      });
      await newCustomer.save();
      const customerId = newCustomer._id;
      return customerId;
    } else {
      const newCustomer = new Customer({
        firstName: customerData?.customer?.first_name,
        lastName: customerData?.customer?.last_name,
        phoneNumber: customerData?.customer?.phone,
        email: customerData?.customer?.email,
        shopLocation: shopLocation || null,
        referenceNumber: customerData?.reference,
        purchaseDate: customerData?.paid_at,
      });
      await newCustomer.save();
      const customerId = newCustomer._id;
      return customerId;
    }
  } catch (error) {
    console.log(error);
    try {
      const errorData = {
        errorMessage: "Error saving customer data",
        backendServerUrl: "Paystack Api route",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }
};

const updateAgentData = async (agentId, customerId) => {
  try {
    if (agentId !== "admin") {
      await connectToDB();
      const agentData = await Agent.findById(agentId);
      agentData.referredData.push(customerId);
      agentData.referredLength = agentData.referredLength + 1;
      await agentData.save();
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error updating agent info",
        backendServerUrl: "Paystack Api route",
        error: error, // Add your error message here
      };
      await writeToLogFile({ errorData });
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }
};

export const POST = async (req) => {
  try {
    if (req.method !== "POST") {
      const response = new Response(`Method ${req.method} Not Allowed`, {
        status: 405,
      });
      response.headers.set("Allow", "POST");
      return response;
    }
    const { referenceNo, refId, shopLocation: shopLoc } = await req.json();
    const shopLocation = shopLoc
      ? shopLoc.toString().replace(/[^a-zA-Z]/g, "")
      : null;

    // Perform necessary validation on the reference parameter
    if (!referenceNo) {
      return new Response("Reference parameter is missing", { status: 400 });
    }

    // Perform any additional validation or processing logic here

    // Log the reference for debugging purposes
    const response = await getTransactionData(referenceNo);
    if (response == 400) {
      return new Response("Invalid Reference", { status: 400 });
    }
    if (response.status === "success") {
      // Respond with a success message
      const referrerId = await getReferrerData(refId);
      const customerId = await saveCustomerData(
        referrerId,
        response,
        shopLocation
      );
      await updateAgentData(referrerId, customerId);
      return new Response("Callback received successfully", { status: 200 });
    } else if (response.status == "fail") {
      return new Response("Payment Unsuccessful", { status: 401 });
    }
  } catch (error) {
    try {
      const errorData = {
        errorMessage: "Error processing callback",
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
