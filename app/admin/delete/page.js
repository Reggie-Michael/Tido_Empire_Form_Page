"use client";
import Loading from "@/app/loading";
import ConfirmationMessage from "@/components/Confirmation";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "@material-tailwind/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_TRIES = 2;
const COUNTDOWN_DURATION = 10 * 60 * 1000;
const KeyDelete = () => {
  const minimumLength = 12;
  const maximumLength = 20;
  const router = useRouter();
  const [passToken, setPassToken] = useState("");
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseGotten, setResponseGotten] = useState(false);
  const [readyForVerification, setReadyForVerification] = useState(false);
  const [remainingTries, setRemainingTries] = useState(MAX_TRIES);
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_DURATION);
  const [countdownExpired, setCountdownExpired] = useState(false);
  const [error, setError] = useState({
    errorState: false,
    type: "",
  });
  //   const searchParams = useSearchParams();
  const dataFetchedRef = useRef(false);
  //   let responseGotten = false;
  //   const [error, setError] = useState({
  //     errorState: false,
  //     type: "",
  //   });

  const verifyAccess = useCallback(async () => {
    try {
      const url = `/api/auth/admin_key`;

      const handleError = (status, data) => {
        if (status === 400) {
          router.push(`/admin?errorStatus=${data.errorType}`);
        } else if (status === 401) {
          if (data.errorType === "authorizationHeaderMissing") {
            warn("An Unexpected Error Occurred, Please Try again Later.");
            setTimeout(() => router.push(`/admin`), 500);
          }
          router.push(`/admin`);
        } else if (status === 403) {
          if (data.errorType === "maxTriesOverlapped") {
            warn("Max Tries Overlapped");
            setTimeout(() => {
              router.push(`/admin`);
            }, 1000);
          }
        } else if (status === 405) {
          warn("Method not allowed");
          router.push(`/admin`);
        } else if (status === 500) {
          warn("An Unexpected Error Occurred, Please Try again Later.");
          setTimeout(() => router.push(`/admin`), 500);
        }
      };

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${passToken}`,
          "Content-Type": "application/json", // Optionally include other headers if needed
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // Token is valid, perform additional actions
          setPassToken(data.token);
        }
      } else {
        // Handle other HTTP errors
        handleError(response.status, data);
      }
    } catch (error) {
    } finally {
      setResponseGotten(true);
    }
  }, [passToken, router]);

  const notify = (val) =>
    toast.success(
      val || (
        <>
          Successfully Submitted Form <br /> Thank you
        </>
      ),
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        className: "text-lg break-all w-[400px]",
        //  transition: Bounce,
      }
    );

  const warn = (val) =>
    toast.error(val, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      className: "text-lg break-all  w-[400px]",
      //  transition: Bounce,
    });
  const errorMessage = () => {
    switch (error.type) {
      case "invalidKey":
        return "The inputted key is wrong. Please Try again Later.";
      case "expiredKey":
        return "The inputted key is expired. Please Input key and try again.";
      case "maxTriesOverlapped":
        return "Number of Tries elapsed. Please Try again Later.";
      case "keyNull":
        return "The Key cannot be null. Please fill in the key";
      case "validateError":
        return "Input must only contain letters and digits";
      case "minMaxInvalid":
        return `Key must contain a minimum length of ${minimumLength} and max of ${maximumLength} `;
      default:
        return "Please try again later";
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (remainingTries === 0) {
      startCountdown();
      return;
    }
    if (!validateKey()) {
      return;
    }
    try {
      const url = `/api/generate_key/${key}`;
      setSubmitting(true);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${passToken}`,
          "Content-Type": "application/json", // Optionally include other headers if needed
        },
      });

      const data = response.status !== 500 && (await response.json());
      if (response.ok) {
        notify("Sales Agent Key successfully deleted!");
        setRemainingTries((tries) => tries - 1);
        if (remainingTries === 0) {
          startCountdown();
        }
      } else {
        // Handle other HTTP errors
        if (response.status == 400) {
          if (data.state === "redirect") {
            router.push(`/admin?errorStatus=${data.errorType}`);
          } else {
            setError((prevState) => ({
              ...prevState,
              errorState: true,
              type: data.errorType,
            }));
          }
        } else if (response.status == 401) {
          if (data.errorType !== "authorizationHeaderMissing") {
            warn("Forbidden route you will be redirected soon.");
            setTimeout(() => {
              router.push(`/admin?errorStatus=${data.errorType}`);
            }, 1000);
          } else {
            warn("An Unexpected Error Occurred, Please Try again Later.");
          }
        } else if (response.status === 403) {
          if (data.errorType === "maxTriesOverlapped") {
            warn("Max Tries Overlapped");
            setTimeout(() => {
              router.push(`/admin`);
            }, 1000);
          }
        } else if (response.status === 404) {
          warn("No such Key Exist!");
        } else if (response.status === 405) {
          warn("Method not allowed");
        } else if (response.status == 500) {
          warn("An Unexpected Error Occurred, Please Try again Later.");
        }
      }
    } catch (error) {
      warn("An unexpected Error occurred! Please Try again Later.");
      //  setTimeout(() => {
      //    generateKey(); // Retry after a delay
      //  }, 1000);
    } finally {
      setSubmitting(false);
      setKey("");
    }
  };

  const handleKeyChange = (e) => {
    const value = e.target.value;
    setKey(value);
    if (key.length >= 6) setReadyForVerification(true);
  };

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

  const startCountdown = () => {
    setCountdownExpired(false);
    setTimeout(() => {
      setRemainingTries(MAX_TRIES);
      setCountdownExpired(true);
    }, COUNTDOWN_DURATION);
  };

  useEffect(() => {
    if (countdownExpired) {
      setRemainingTries(MAX_TRIES);
    }
  }, [countdownExpired]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    try {
      verifyAccess();
      dataFetchedRef.current = true;
    } catch (error) {
      warn("An unexpected error occurred! Refreshing...");
      setTimeout(() => router.push("/admin/generate"), 1000);
    } finally {
      setTimeout(() => setIsLoading(false), 3000);
    }
  }, [verifyAccess, router]);

  useEffect(() => {
    if (remainingTries === 0) {
      startCountdown();
    }
  }, [remainingTries]);

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

  return (
    <div className="w-full">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="min-h-[400px] h-dvh pb-10 flex flex-col">
          <header className="w-full flex items-center justify-center py-5 md:py-10 px-[3%]">
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
          <div className="flex flex-col gap-3 sm:gap-5 md:gap-10 items-center mt-20 lg:mt-32  flex-1 w-full">
            <h1 className="text-lg font-medium md:text-2xl">
              Delete Sales Agent Key
            </h1>
            {/* {error.errorState && (
              <div
                className={`flex gap-2 items-center justify-center  font-medium text-xl ${
                  error.type == "resendVerification"
                    ? "text-green-500"
                    : "text-red-700"
                }`}
              >
                <div className="size-2 p-4 rounded-full bg-gray-500/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faInfo} />
                </div>
                <p className="w-fit">{errorMessage()}</p>
              </div>
            )} */}
            <div className="flex gap-5 w-full px-[2%] sm:w-4/5 md:w-3/5 lg:1/4">
              <Input
                type="text"
                disabled={submitting || remainingTries === 0 || !responseGotten}
                value={key}
                onChange={handleKeyChange}
                autoFocus={true}
                className="border-2 text-center size-10 disabled:opacity-25 disabled:cursor-not-allowed text-base font-medium sm:text-lg"
                placeholder="Enter Agent Key"
              />
            </div>
            {error.errorState && (
              <div className="flex gap-2 items-center justify-center text-red-700 font-medium text-base md:text-lg lg:text-xl">
                <div className="size-2 p-2 text-xs md:p-4 md:text-base rounded-full bg-gray-500/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faInfo} />
                </div>
                <p className="w-fit">{errorMessage()}</p>
              </div>
            )}
            <Button
              type="submit"
              className={`bg-red-700 border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 px-[2%] w-1/4  lg:1/5`}
              onClick={handleSubmit}
              title="delete agent key"
              disabled={submitting || remainingTries === 0 || !responseGotten}
              loading={submitting}
            >
              Delete Agent Key
            </Button>
          </div>
          <ToastContainer />
          <div
            className={`flex items-center justify-center ${
              remainingTries === 0 &&
              "w-full h-full fixed top-0 left-0 bg-black/90"
            }`}
          >
            <div>
              <p
                className={`flex gap-2 items-center justify-center font-medium ${
                  remainingTries === 0
                    ? "text-red-700  text-xl"
                    : "text-green-500 text-lg"
                }`}
              >
                Remaining tries: {remainingTries}
              </p>
              {remainingTries === 0 && (
                <p className="flex gap-2 items-center justify-center text-red-700 font-medium text-lg">
                  Try again in: {formatTime(remainingTime)}
                </p>
              )}
            </div>
          </div>
          {submitting && (
            <>
              <div className="w-full h-full fixed z-[999] flex items-center justify-center bg-black/70 top-0 left-0 gap-4">
                <div className="size-4 bg-transparent border-4 border-white border-r-0 border-l-0 border-t-0 rounded-xl box-content animate-spin"></div>
                <ConfirmationMessage
                  className="w-96"
                  message={"Deleting Key..."}
                />
              </div>
            </>
          )}

          {remainingTries === 0 && (
            <div className="flex items-center justify-center w-full h-full fixed top-0 left-0 bg-black/90">
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
          <div className="flex text-green-600 font-medium px-4 text-base md:text-xl mt-10 hover:underline self-end">
            <Link
              href={"/admin/generate"}
              disabled={submitting || !responseGotten}
            >
              Generate Key
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyDelete;
