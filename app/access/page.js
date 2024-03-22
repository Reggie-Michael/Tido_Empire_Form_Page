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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationMessage from "@/components/Confirmation";

const AccessValidate = () => {
  const minimumLength = 5;
  const maximumLength = 30;
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [readyForVerification, setReadyForVerification] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({
    errorState: false,
    type: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const notify = (message) =>
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      className: "text-lg break-all w-[400px]",
    });

  const warn = (message) =>
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      className: "text-lg break-all w-[400px]",
    });

  const errorStatus = searchParams.get("errorStatus");
  const errorMessage = () => {
    switch (error.type) {
      case "invalidKey":
        return "The inputted key is wrong. Please Try again Later.";
      case "expiredKey":
        return "The inputted key is expired. Please Contact Tido Empire.";
      //   case "maxTriesOverlapped":
      //     return "Number of Tries elapsed. Please Try again Later.";
      case "unauthorized":
        return "Visited Route is Protected! Please fill in key first.";
      case "unauthorizedCreation":
        return "Agency cannot create other Agencies!";
      case "sessionExpired":
        return "Session has Expired! Please fill in key again.";
      case "keyAbsent":
        return "Key does not exist! Please try a new key.";
      case "keyNull":
        return "The Key cannot be null. Please fill in the key";
      case "keyNull2":
        return "The Key has reset. Please fill in the key again";
      case "validateError":
        return "Input must only contain letters and digits";
      case "minMaxInvalid":
        return `Key must contain a minimum length of ${minimumLength} and max of ${maximumLength} `;
      default:
        return "Please try again later";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //     if (remainingTries === 0) {
    //       startCountdown();
    //       return;
    //     }
    setSubmitting(true);
    try {
      if (!validateKey()) return;
      const response = await fetch("/api/auth/agent_key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      // setKey("")
      const data = await response.json();

      if (response.ok) {
        // Key is valid, redirect to login page with token
        if (data.success) {
          notify("Key is Valid. You will be redirected soon.");
          setTimeout(() => router.push(`/agent/login?OiD=${data.key}`), 500);
        }
      } else {
        // Key is invalid, handle accordingly (e.g., show error message)
        if (response.status == 400) {
          warn(data.error);
          setError({ errorState: true, type: data.errorType });
          // setRemainingTries((tries) => tries - 1);
          // if (remainingTries === 0) {
          //   startCountdown();
          // }
        } else if (response.status === 405) {
          warn("Method Not allowed");
        } else {
          warn("An Error Occurred, Please Try again Later.");
        }
        //    else if (response.status === 403) {
        //      warn("Key Validation Error");
        //      setError({ errorState: true, type: data.errorType });
        //      data.errorType === "maxTriesOverlapped" && setRemainingTries(0);
        //    }
      }
    } catch (error) {
      warn("An Error Occurred, Please Try again Later.");
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyChange = (e) => {
    const value = e.target.value;
    setKey(value);
    if (key.length < 2) setReadyForVerification(true);
  };

  const validateKey = useCallback(() => {
    //     let allInputsValid = true;
    const inputLength = key?.length;
    const containsNonAlphaNumeric = /[^a-zA-Z0-9]/.test(key);

    // Validation logic...

    // Check if key is missing
    if (!key) {
      setError({ errorState: true, type: "keyNull" });
      return false;
    } else if (inputLength < minimumLength || inputLength > maximumLength) {
      setError({ errorState: true, type: "minMaxInvalid" });
      return false;
    } else if (containsNonAlphaNumeric) {
      setError({ errorState: true, type: "validateError" });
      return false;
    } else {
      setError({ errorState: false, type: "" });
      return true;
    }
  }, [key, minimumLength, maximumLength]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    // Validation when key, role, minimumLength, or maximumLength changes
    readyForVerification && validateKey();

    // Cleanup function to clear error state
    return () => {
      setError({
        errorState: false,
        type: "",
      });
    };
  }, [validateKey, readyForVerification]);

  useEffect(() => {
    if (errorStatus !== undefined && errorStatus !== null) {
      setError({ errorState: true, type: errorStatus });
    }
    router.push("/access");
  }, [errorStatus, router]);

  return (
    <div className="w-full h-fit">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col pb-3 h-dvh min-h-[400px] w-full items-center justify-between">
          <Navbar className="text-black" formLinkDisabled={true} />
          <div className="flex flex-col w-full items-center">
            <div className="flex flex-col items-center text-center gap-5 mt-13 md:mt-20 mb-10">
              <h4 className="text-xl md:text-2xl leading-3 font-medium">
                Welcome To{" "}
              </h4>
              <h1 className="text-3xl md:text-5xl lg:text-7xl leading-7 text-blue-700 font-bold">
                Sales Agent Tab
              </h1>
            </div>
            <form
              className="flex flex-col gap-10 w-full px-[2%] md:px-0 md:w-2/3 lg:w-1/3"
              onSubmit={handleSubmit}
            >
              <div className="text-center text-base md:text-lg lg:text-xl font-medium">
                <h3 className="capitalize">Enter Access Key</h3>
              </div>
              <div
                className="w-full h-10 flex items-center border-2 border-opacity-20 border-black focus-within:border-opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Input Key"
              >
                <input
                  type={!passVisible ? "password" : "text"}
                  name={`adminKey`}
                  autoComplete="off"
                  //  autoFocus={true}
                  value={key}
                  onChange={handleKeyChange}
                  id="key"
                  disabled={submitting}
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
                <div className="flex gap-2 items-center justify-center text-red-700 font-medium text-base md:text-lg lg:text-xl">
                  <div className="size-2 p-3 text-sm md:p-4 md:text-base rounded-full bg-gray-500/30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faInfo} />
                  </div>
                  <p className="w-fit">{errorMessage()}</p>
                </div>
              )}
              <Button
                className={`bg-black border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 `}
                onClick={handleSubmit}
                // title={!validateKey() && "Ca"}
                disabled={submitting || error.errorState}
                loading={submitting}
              >
                Submit Key
              </Button>
            </form>
          </div>
          <ToastContainer />

          <div
            className={`flex gap-2 items-center text-center justify-center text-green-500 font-medium justify-self-end mt-10 ${
              error.errorState
                ? "text-base md:text-lg opacity-70"
                : "text-lg md:text-xl"
            }`}
          >
            <div className="size-2 p-2 text-xs md:text-base md:p-4 hidden rounded-full bg-gray-500/30 md:flex items-center justify-center ">
              <FontAwesomeIcon icon={faInfo} />
            </div>
            {/* <p className="w-fit">Warning!!! This page is for Admin only.</p> */}
            <p>
              Enter Key gotten from Tido Empire to access Agent creation page
            </p>
          </div>
        </div>
      )}
      {submitting && (
        <>
          <div className="w-full h-full fixed z-[999] flex items-center justify-center bg-black/70 top-0 left-0 gap-4">
            <div className="size-4 bg-transparent border-4 border-white border-r-0 border-l-0 border-t-0 rounded-xl box-content animate-spin"></div>
            <ConfirmationMessage
              className="w-96"
              message={"Submitting Key..."}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AccessValidate;
