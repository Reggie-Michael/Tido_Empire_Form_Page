import Agent from "@/models/agent";
import Customer from "@/models/customer";
import { connectToDB } from "@/utils/database";
import crypto from "crypto";

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

    //     console.log(response);
    // Check if the request was successful
    if (response.ok) {
      // Parse the response JSON
      const data = await response.json();
      // Return the transaction data
      console.log("returning data ");
      return data.data;
    } else {
      // Handle error response
      console.error("Error retrieving transaction data:", response.status);
      console.log(response);
      if (response.status == 400) {
        return 400;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error(
      "An error occurred while retrieving transaction data:",
      error
    );
    return null;
  }
};


const saveCustomerData = async (agentId, customerData) => {
  try {
    await connectToDB();
    const newCustomer = new Customer({
      referrer: agentId,
      firstName: customerData?.customer?.first_name,
      lastName: customerData?.customer?.last_name,
      phoneNumber: customerData?.customer?.phone,
      email: customerData?.customer?.email,
      referenceNumber: customerData?.reference,
      purchaseDate: customerData?.paid_at,
    });
    await newCustomer.save();
    const customerId = newCustomer._id;
    console.log("CustomerId", customerId);
    return customerId;
  } catch (error) {
    console.error("Error saving customer data", error);
  }
};

const getReferrerData = async (agentId) => {
  try {
    await connectToDB();
    const agentExist = await Agent.findById(agentId);
    if (agentExist !== null && agentExist !== undefined) {
      return agentId;
    } else {
      return "admin";
    }
  } catch (error) {
    console.error("Error getting agent id", error);
  }
};

const updateAgentData = async (agentId, customerId) => {
  try {
    console.log("From updateData:", agentId, customerId);
    if (agentId !== "admin") {
      await connectToDB();
      const agentData = await Agent.findById(agentId);
      agentData.referredData.push(customerId);
      agentData.referredLength = agentData.referredLength + 1;
      await agentData.save();
    }
  } catch (error) {
    console.error("Error updating agent info", error);
  }
};
export const GET = async (req) => {
  if (req.method === "GET") {
    try {
      console.log(req)
      const searchParams = req.nextUrl.searchParams;
      // const query = searchParams.get('query')
      const referenceNo = searchParams.get("reference");
      const refId = searchParams.get("refererId");

      console.log(referenceNo, refId);

      // Perform necessary validation on the reference parameter
      if (!referenceNo) {
        console.error("Reference parameter is missing");
        return new Response("Reference parameter is missing", { status: 400 });
      }

      // Perform any additional validation or processing logic here

      // Log the reference for debugging purposes
      console.log("Received reference:", referenceNo);
      const response = await getTransactionData(referenceNo);
      console.log("response from transaction data", response);
      if (response == 400) {
        console.error("Reference is invalid");
        return new Response("Invalid Reference", { status: 400 });
      }
      if (response.status === "success") {
        // Respond with a success message
        const referrerId = await getReferrerData(refId);
        const customerId = await saveCustomerData(referrerId, response);
        console.log(referrerId, customerId);
        await updateAgentData(referrerId, customerId);
        return new Response("Callback received successfully", { status: 200 });
      } else if (response.status == "fail") {
        return new Response("Payment Unsuccessful", { status: 401 });
      }
    } catch (error) {
      console.error("Error processing callback:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  } else {
    const response = new Response(`Method ${req.method} Not Allowed`, {
      status: 405,
    });
    response.headers.set("Allow", "GET");
    return response;
  }
};

// export const POST = async (req) => {
//   if (req.method === "POST") {
//     try {
//       const { reference } = await req.json();

//       // Verify event authenticity
//       const signature = req.headers["x-paystack-signature"];
//       const hmac = crypto.createHmac("sha512", payStackSecretKey);
//       const hash = hmac.update(JSON.stringify(req.body)).digest("hex");

//       if (signature !== hash) {
//         // Signature doesn't match, reject the request
//         console.error("Invalid Paystack signature");
//         return new Response(null, { status: 403 });
//       }

//       const event = await req.body;

//       const eventData = await event.data;
//       console.log(eventData);
//       const paymentReference = await event.data.reference;
//       console.log(paymentReference);
//       // Process payment reference and retrieve payment data

//       // Implement your payment processing logic here

//       return new Response(null, { status: 200 });
//     } catch (error) {
//       console.error("Error processing Paystack webhook:", error);
//       return new Response(null, { status: 500 });
//     }
//   } else {
//     const response = new Response(`Method ${req.method} Not Allowed`, {
//       status: 405,
//     });
//     response.headers.set("Allow", "POST");
//     return response;
//   }
// };
