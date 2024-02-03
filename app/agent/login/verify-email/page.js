"use client";
import Loading from "@/app/loading";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "@material-tailwind/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_TRIES = 3;
const COUNTDOWN_DURATION = 30 * 60 * 1000;

const ValidationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [displayCode, setDisplayCode] = useState("");
  const [email, setEmail] = useState("");
  const [remainingTries, setRemainingTries] = useState(MAX_TRIES);
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_DURATION);
  const [countdownExpired, setCountdownExpired] = useState(false);
  const [readyForVerification, setReadyForVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({
    errorState: false,
    type: "",
  });

  const inputRefs = useRef([]);
  const router = useRouter();
  const notify = (message) =>
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
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
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      className: "text-lg break-all w-[400px]",
    });

  const validateCode = useCallback(() => {
    const codeRegex = /^[0-9]{6}$/;
    if (!verificationCode) {
      setError({ errorState: true, type: "codeNull" });
      return false;
    } else if (!codeRegex.test(verificationCode)) {
      setError({ errorState: true, type: "codeValidateError" });
      return false;
    } else {
      setError({ errorState: false, type: "" });
      return true;
    }
  }, [verificationCode]);

  const sendVerificationCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {},
        body: JSON.stringify({ verificationCode }),
      });

      if (response.ok) {
        const data = await response.json();
        notify("Complete Registration! Thank you.");
        router.push(`/agent?s=${data.success}&r=${data.ref}`);
      } else {
        const data = await response.json();
        if (response.status === 400) {
          setError({ errorState: true, type: data.errorType });
          setRemainingTries((tries) => tries - 1);
          if (remainingTries === 1) {
            startCountdown();
          }
        } else if (response.status === 403) {
          setError({ errorState: true, type: data.errorType });
          setRemainingTries(0);
        } else if (response.status === 500) {
          warn("There was a problem on our side. Please Contact Tido Empire.");
        }
        warn(data.error);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      warn("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyAccess = async () => {
    try {
      const url = `/api/auth/signup`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.authorized) {
          console.log("Access is verified");
          // Set email state here if needed
          setEmail(data.userEmail);
        }
      } else {
        handleErrorResponse(response);
      }
    } catch (error) {
      console.error("An error occurred", error);
      warn("Sorry, please contact Tido Empire and try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const url = `/api/auth/signup?retry=true`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.authorized && data.status == "resendVerification") {
          router.push("/agent/login/verify-email");
          setEmail(data.userEmail);
          setError({ errorState: true, type: data.status });
          setRemainingTries((tries) => tries - 1);
          if (remainingTries === 1) {
            startCountdown();
          }
        }
      } else {
        handleErrorResponse(response);
      }
    } catch (error) {
      console.error("An error occurred", error);
      warn("Sorry, please contact Tido Empire and try again later.");
    }
  };

  const handleErrorResponse = (response) => {
    if (response.status === 400) {
      warn("Saved Data has been wiped for some reason. Please Try again.");
      setTimeout(() => router.push(`/agent/login`), 1000);
    } else if (response.status === 401) {
      warn("Forbidden route you will be redirected soon.");
      setError({ errorState: true, type: "unauthorized" });
      setTimeout(() => router.push(`/agent/login`), 2000);
    } else if (response.status === 403) {
      setError({ errorState: true, type: "maxTriesOverlapped" });
      setRemainingTries(0);
    } else if (response.status === 500) {
      warn("Sorry, please contact Tido Empire and try again later.");
      setTimeout(() => router.push(`/`), 3000);
    }
  };

  const startCountdown = () => {
    setCountdownExpired(false);
    setTimeout(() => {
      setRemainingTries(MAX_TRIES);
      setCountdownExpired(true);
    }, COUNTDOWN_DURATION);
  };

  useEffect(() => {
    verifyAccess();
  }, []);

  useEffect(() => {
    if (readyForVerification) {
      validateCode();
    }
  }, [readyForVerification, validateCode]);

  useEffect(() => {
    if (countdownExpired) {
      setRemainingTries(MAX_TRIES);
    }
  }, [countdownExpired]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (remainingTries === 0) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1000);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTries]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 6);
    setVerificationCode(value);
    setDisplayCode(value.match(/.{1,2}/g)?.join("-") || "");
    if (!readyForVerification && value.length >= 6) {
      setReadyForVerification(true);
    }
  };

  const errorMessage = () => {
    switch (error.type) {
      case "unauthorized":
        return "You can only come here if you have created an account. Please create an account in the Coming Page.";
      case "maxTriesOverlapped":
        return "Number of Allocated Tries in 30 minutes overlapped. Try again in 30 minutes.";
      case "invalidCode":
        return "The inputted code is wrong! A new code has been sent to your email. Please try again.";
      case "expiredCode":
        return "The inputted code is expired! A new code has been sent to your email. Please try again.";
      case "resendVerification":
        return `A new verification code has been sent to ${email}. Check mail and Try again`;
      case "codeNull":
        return "Code cannot be Null!";
      case "codeValidateError":
        return "Code Must be 6 characters and only contain digits.";
      default:
        return "Please try again later";
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="min-h-[400px]  pb-10">
          <header className="w-full flex items-center justify-center py-5 md:py-10">
            <Link
              href="/"
              className="logo flex items-center font-inter text-xl md:text-2xl lg:text-4xl font-bold text-blue-600 hover:opacity-75"
            >
              {/* <Image
          src={"/assets/images/LOGO-writeup-1-White 1.svg"}
          width={152}
          height={57}
          alt="Logo"
          className="object-contain object-bottom"
        /> */}
              Tido Empire
            </Link>
          </header>
          <div className="flex flex-col gap-3 sm:gap-5 md:gap-10 items-center mt-20 lg:mt-32">
            <h1 className="text-lg font-medium md:text-2xl">
              Enter Verification Code
            </h1>
            <p className="text-sm md:text-base max-w-3/5">
              A Verification code was sent to {email}
            </p>
            <div className="flex gap-5 w-full px-[2%] sm:w-4/5 md:w-3/5 lg:1/4">
              <Input
                type="text"
                disabled={submitting || remainingTries === 0}
                value={displayCode}
                onChange={handleInputChange}
                autoFocus={true}
                className="border-2 text-center size-10 disabled:opacity-25 disabled:cursor-not-allowed text-base font-medium sm:text-lg"
                placeholder="Enter 6-Digit Verification Code"
              />
            </div>
            {error.errorState && (
              <div
                className={`flex gap-2 items-center justify-center text-red-700 font-medium text-xl ${
                  error.type == "resendVerification" && "text-green-500"
                }`}
              >
                <div className="size-2 p-4 rounded-full bg-gray-500/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faInfo} />
                </div>
                <p className="w-fit">{errorMessage()}</p>
              </div>
            )}
            <Button
              type="submit"
              className={`bg-blue-700 border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 px-[2%] w-1/4  lg:1/5`}
              onClick={sendVerificationCode}
              title="Verify"
              disabled={
                !verificationCode ||
                error.errorState ||
                verificationCode.length !== 6 ||
                submitting ||
                remainingTries === 0
              }
              loading={submitting}
            >
              Verify
            </Button>
            <Button
              type="button"
              className={`bg-transparent text-base md:text-lg hover:underline disabled:opacity-50 text-blue-600 disabled:cursor-not-allowed flex items-center justify-center shadow-none`}
              onClick={handleResend}
              disabled={
                submitting ||
                remainingTries === 0
              }
              loading={submitting}
            >
              Resend Code
            </Button>
          </div>
          <ToastContainer />
          {remainingTries === 0 && (
            <div className="flex items-center justify-center w-full h-full fixed top-0 left-0">
              <div>
                <p className="flex gap-2 items-center justify-center text-red-700 font-medium text-xl">
                  Remaining tries: {remainingTries}
                </p>
                <p className="flex gap-2 items-center justify-center text-red-700 font-medium text-lg">
                  Try again in: {formatTime(remainingTime)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
