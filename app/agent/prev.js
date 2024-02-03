"use client";
import Navbar from "@/components/Navbar";
import { faEye, faEyeSlash, faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "@material-tailwind/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "../loading";
// import { useRouter } from 'next/router';
import "animate.css";

export default function KeySubmission() {
  let errorText;
  const minimumLength = 5;
  const maximumLength = 30;
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState("");
  const [role, setRole] = useState("");
  const [readyForVerification, setReadyForVerification] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({
    errorState: false,
    invalidKey: false,
    invalidRole: false,
    expiredKey: false,
    keyNull: false,
    roleNull: false,
    keyAbsent: false,
    minMaxInvalid: false,
    validateError: false,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const errorStatus = searchParams.get("errorStatus");
  // console.log(mode);

  const errorMessage = () => {
    if (error.errorState) {
      if (error.invalidKey) {
        return "The inputted key is wrong. Please try again or confirm the key from Tido Empire";
      }
      if (error.invalidRole) {
        return "The role is not valid. Please Input valid mode";
      }
      if (error.expiredKey) {
        return "The inputted key is expired as it is over one hour. Please try again";
      }
      if (error.keyNull) {
        return "The Key cannot be null. Please fill in the key";
      }
      if (error.roleNull) {
        return "The Role cannot be null. Please fill in the role";
      }

      if (error.keyAbsent) {
        return `The visited route is a protected route. Please input ${
          role === "sales agent" || (role === "admin" && role)
        } key to continue`;
      }
      if (error.validateError) {
        return "Input must only contain letters and digits";
      }
      if (error.minMaxInvalid) {
        return `Key must contain a minimum length of ${minimumLength} and max of ${maximumLength} `;
      }
      return "Please try again later";
    }
    return null; // Return null for no error
  };

  const setErrorStatus = (val) => {
    setError((prev) => ({
      ...prev, // Spread the previous state
      errorState: true, // Set common error state to true
      invalidKey: val === "invalidKey", // Set specific error based on val
      invalidRole: val === "invalidRole",
      expiredKey: val === "expiredKey",
      keyNull: val === "keyNull",
      roleNull: val === "roleNull",
      keyAbsent: val === "keyAbsent",
      minMaxInvalid: val === "minMaxInvalid",
      validateError: val === "validateError",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("clicked", key);
    try {
      console.log(validateKey());
      if (!validateKey()) return;
      const response = await fetch("/api/auth/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, role }),
      });

      console.log(response);

      // setKey("")
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // Key is valid, redirect to login page with token
        router.push(`/agent/login`);
      } else {
        // Key is invalid, handle accordingly (e.g., show error message)
        if (response.status == 400) {
          // alert("Forbidden route you will be redirected soon");
          setErrorStatus(data.errorType);
          console.log(error);
        }
        console.error(data.error);
      }
    } catch (error) {
      console.error("An error occurred", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyChange = (e) => {
    const value = e.target.value;
    setKey(value);
    if (key.length < 2) setReadyForVerification(true);
    console.log(readyForVerification);
  };

  const handleModeChange = (e) => {
    const selectedValue = e.target.value;
    // console.log(selectedValue);
    setRole(selectedValue);

    // Perform any other actions based on the selected value if needed
    // ...
  };
  const validateKey = useCallback(() => {
    let allInputsValid = true;
    const inputLength = key?.length;

    // Validation logic...

    // Check if key is missing
    if (!key) {
      setError((prev) => ({
        ...prev,
        errorState: true,
        keyNull: true,
      }));
      allInputsValid = false;
    }

    // Check if role is missing or invalid
    if (!role || (role !== "sales agent" && role !== "admin")) {
      setError((prev) => ({
        ...prev,
        errorState: true,
        invalidRole: true,
      }));
      allInputsValid = false;
    }

    // Check if key length is invalid
    if (!(inputLength >= minimumLength && inputLength <= maximumLength)) {
      setError((prev) => ({
        ...prev,
        errorState: true,
        minMaxInvalid: true,
      }));
      allInputsValid = false;
    }

    // Check if key contains non-alphanumeric characters
    const containsNonAlphaNumeric = /[^a-zA-Z0-9]/.test(key);
    if (containsNonAlphaNumeric) {
      setError((prev) => ({
        ...prev,
        errorState: true,
        validateError: true,
      }));
      allInputsValid = false;
    }

    // Clear any previous error state if all validations pass
    if (allInputsValid) {
      setError((prev) => ({
        ...prev,
        errorState: false,
        invalidKey: false,
        invalidRole: false,
        keyNull: false,
        roleNull: false,
        keyAbsent: false,
        minMaxInvalid: false,
        validateError: false,
      }));
    }

    return allInputsValid;
  }, [key, role, minimumLength, maximumLength]);

  useEffect(() => {
    // Simulate fetching data
    console.log("mounted");
    setTimeout(() => {
      // Once data is loaded, update loading state
      setIsLoading(false);
    }, 1000); // Simulated delay of 2 seconds
  }, []);
  useEffect(() => {
    // Validation when key, role, minimumLength, or maximumLength changes
    readyForVerification && validateKey();

    // Cleanup function to clear error state
    return () => {
      setError((prev) => ({
        ...prev,
        errorState: false,
        invalidKey: false,
        invalidRole: false,
        keyNull: false,
        roleNull: false,
        keyAbsent: false,
        minMaxInvalid: false,
        validateError: false,
      }));
    };
  }, [validateKey]);

  useEffect(() => {
    if (mode === "sales agent" || mode === "admin") {
      setRole(mode);
    }
    if (errorStatus) {
      setErrorStatus(errorStatus);
    }
    router.push("/agent");
  }, [mode, errorStatus]);

  // useEffect(() => {

  //   // router.push("/agent");
  // }, [, router]);

  useEffect(() => {
    if (role === "sales agent" || role === "admin") {
      // Clear the error state
      setError((prev) => ({
        ...prev,
        errorState: false,
        roleNull: false,
      }));
      console.log(error);
    }
  }, [role]);

  return (
    <div className="w-full h-fit">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col h-dvh w-full items-center  gap-5">
          <Navbar className="text-black" />
          <div className="w-full flex items-end justify-end px-[2%]">
            <form
              className={`flex gap-4 items-center font-medium p-4 ${
                role == "" &&
                "border-2 border-red-600 animate__animated animate__flash animate__slower animate__repeat-2"
              }`}
            >
              <label htmlFor="mode" className="text-xl">
                Select Mode:
              </label>
              <select
                name="modeSelect"
                id="mode"
                title="set mode"
                onChange={handleModeChange}
                value={role}
                className="border-2 border-opacity-20 border-black focus:border-opacity-100 w-40"
              >
                {role === "" && <option value="">...</option>}
                <option value="sales agent">Sales Agent</option>
                <option value="admin">Admin</option>
              </select>
            </form>
          </div>
          <div className="flex flex-col items-center text-center gap-3 mt-40">
            <h4 className="text-2xl leading-3 font-medium">Welcome To </h4>
            <h1 className="text-7xl leading-7 text-blue-700 font-bold">
              Sales Agent Tab
            </h1>
            {/* <span className="text-2xl leading-3 font-medium">Tab</span> */}
          </div>
          <form className="flex flex-col gap-10 w-1/3" onSubmit={handleSubmit}>
            <div className="text-center text-xl font-medium">
              {role === "admin" || role === "sales agent" ? (
                <h3 className="capitalize">Enter {role} Key</h3>
              ) : role === "" ? (
                <p>Please select a role</p>
              ) : (
                <p>Please select a valid role</p>
              )}
            </div>
            <div
              className="w-full h-10 flex items-center border-2 border-opacity-20 border-black focus-within:border-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!role ? "Missing Role" : "Input Key"}
            >
              <input
                type={!passVisible ? "password" : "text"}
                name={`${role} key`}
                autoComplete="off"
                value={key}
                onChange={handleKeyChange}
                id="key"
                disabled={!role}
                className="flex-1 w-full h-full focus:outline-none outline-none border-none px-3"
              />
              <FontAwesomeIcon
                icon={!passVisible ? faEye : faEyeSlash}
                onClick={() => {
                  setPassVisible(!passVisible);
                }}
                className={`size-5 mr-2 ${
                  !key
                    ? "opacity-30 cursor-not-allowed"
                    : "opacity-100 cursor-pointer"
                }`}
                aria-disabled={!key}
              />
            </div>
            {error.errorState && (
              <div className="flex gap-2 items-center justify-center text-red-700 font-medium text-xl">
                <div className="size-2 p-4 rounded-full bg-gray-500/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faInfo} />
                </div>
                <p className="w-fit">{errorMessage()}</p>
              </div>
            )}

            <Button
              className={`bg-black border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 `}
              onClick={handleSubmit}
              // title={!validateKey() && "Ca"}
              disabled={!role || error.errorState}
              loading={submitting}
            >
              Submit Key
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
