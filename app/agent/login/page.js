"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Login() {
  const router = useRouter();
  const [passToken, setPassToken] = useState("");
  // const searchParams = useSearchParams();
  const verifyToken = async () => {
    try {
      const url = `/api/auth/key?token=${passToken}&role=sales agent`;
      // console.log(new URLSearchParams(dataToSend));
      // console.log(dataToSend.token);
      const response = await fetch(url);

      console.log(response);
      if (response.ok) {
        const data = await response.json();

        // console.log(data)
        if (data.success) {
          // Token is valid, perform additional actions
          console.log("Token is valid");
          // console.log(data);
          setPassToken(data.token);
          console.log(passToken);
          // Redirect or handle as needed
        }
      } else {
        // Handle other HTTP errors
        if (response.status == 400) {
          router.push(`/agent?errorStatus=${data.errorStatus}&mode=${data.mode}`);
        } else if (response.status == 401) {
          // alert("Forbidden route you will be redirected soon");
          setTimeout(() => {
            router.push(`/agent?mode=sales agent`);
          }, 1000);
        } else if (response.status == 500) {
          alert("Sorry please try again Later.");
        }
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };
  // const token = searchParams.get("token");

  // This will not be logged on the server when using static rendering
  // console.log(search)


  useEffect(() => {
    console.log("active")
    verifyToken();
    // console.log(passToken)
  }, []);
  useEffect(() => {
    // This block of code will run every time passToken changes
    console.log("passToken updated:", passToken);
    // Perform any actions that depend on the updated passToken value here
  }, [passToken]);

  return (
    <div>
      <h1>Login Page</h1>
      <p>{passToken}</p>
      {/* Your login form and logic go here */}
    </div>
  );
}
