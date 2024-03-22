"use client";
import Loading from "@/app/loading";
import ConfirmationMessage from "@/components/Confirmation";
import { Button } from "@material-tailwind/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_TRIES = 2;
const COUNTDOWN_DURATION = 10 * 60 * 1000;
const KeyGen = () => {
  const router = useRouter();
  const [passToken, setPassToken] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [agentKeyType, setAgentKeyType] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseGotten, setResponseGotten] = useState(false);
  const [remainingTries, setRemainingTries] = useState(MAX_TRIES);
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_DURATION);
  const [countdownExpired, setCountdownExpired] = useState(false);
  const [copied, setCopied] = useState("");

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
  }, [passToken, router, setPassToken, setResponseGotten]);

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

  const generateKey = async (e) => {
    e.preventDefault();
    if (remainingTries === 0) {
      startCountdown();
      return;
    }
    try {
      const url =
        agentKeyType === "agency"
          ? `/api/generate_key?type=agency`
          : `/api/generate_key`;
      setSubmitting(true);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${passToken}`,
          "Content-Type": "application/json", // Optionally include other headers if needed
        },
      });

      const data = response.status !== 500 && (await response.json());
      if (response.ok) {
      
        notify("Backend successfully generated key");
        setGeneratedKey(data?.key);
        setRemainingTries((tries) => tries - 1);
        if (remainingTries === 0) {
          startCountdown();
        }
      } else {
        // Handle other HTTP errors
        if (response.status == 400) {
          data.state === "redirect" &&
            router.push(`/admin?errorStatus=${data.errorType}`);
        } else if (response.status == 401) {
          if (
            data.errorType !== "authorizationHeaderMissing" &&
            data.state === "redirect"
          ) {
            warn("Forbidden route you will be redirected soon.");
            setTimeout(() => {
              router.push(`/admin`);
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
        } else if (response.status === 405) {
          warn("Method not allowed");
        } else if (response.status == 500) {
          warn("An Unexpected Error Occurred, Please Try again Later.");
        }
      }
    } catch (error) {
      warn("Error while generating Key, Try again late.");
      //  setTimeout(() => {
      //    generateKey(); // Retry after a delay
      //  }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    setCopied(generatedKey);
    navigator?.clipboard?.writeText(generatedKey);
    setTimeout(() => setCopied(false), 3000);
  };

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
      warn("An unexpected error occurred! Try again Later.");
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

  const handleModeChange = (e) => {
    const selectedValue = e.target.value;
    setAgentKeyType(selectedValue);

  };

 


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
          <header className="w-full flex items-center justify-between py-5 md:py-10 px-[3%]">
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
            <div className="w-1/2 flex  items-end justify-end">
              <form
                className={`flex md:gap-4 items-center flex-col md:flex-row gap-2 font-medium`}
              >
                <label htmlFor="mode" className="text-base md:text-xl">
                  Select Key Type:
                </label>
                <select
                  name="modeSelect"
                  id="mode"
                  title="set mode"
                  onChange={handleModeChange}
                  value={agentKeyType}
                  className="border-2 border-opacity-20 border-black focus:border-opacity-100 w-20 md:w-40 text-xs sm:text-sm md:text-base"
                >
                  {/* {role === "" && <option value="">...</option>} */}
                  <option value="default">Default</option>
                  <option value="agency">Agency</option>
                </select>
              </form>
            </div>
          </header>
          <div className="flex flex-col gap-3 sm:gap-5 md:gap-10 items-center mt-20 lg:mt-32  flex-1 w-full">
            <h1 className="text-lg font-medium md:text-2xl">
              Generate Sales Agent Key
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

            {generatedKey && (
              <div className="mt-9 w-full flex items-center justify-center px-[2.5%]">
                <div className="border-2 flex flex-col gap-3 md:gap-6 w-full md:w-1/2 lg:w-1/3 items-center text-center px-2 py-4  border-black border-opacity-20 focus-visible:border-opacity-100 focus-within:border-opacity-100">
                  <p className="text-base md:text-lg font-medium">
                    Generated Sales Agent Key:
                  </p>
                  <div className="flex relative w-full text-center items-center justify-center">
                    <p className="whitespace-nowrap underline underline-offset-2 text-blue-700">
                      {generatedKey}
                    </p>

                    <div className="copy_btn" onClick={handleCopy}>
                      <Image
                        src={
                          copied === generatedKey
                            ? "/assets/icons/tick.svg"
                            : "/assets/icons/copy.svg"
                        }
                        alt={
                          copied === generatedKey ? "tick_icon" : "copy_icon"
                        }
                        width={32}
                        height={22}
                        className="absolute right-0 -top-7 cursor-pointer text-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Button
              type="submit"
              className={`bg-blue-700 border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 px-[2%] w-1/4  lg:1/5`}
              onClick={generateKey}
              title="generate key"
              disabled={submitting || remainingTries === 0 || !responseGotten}
              loading={submitting}
            >
              Generate Key
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
                  message={"Generating Key..."}
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
          <div className="flex text-red-600 font-medium px-4 text-base md:text-xl mt-10 hover:underline">
            <Link
              href={"/admin/delete"}
              disabled={submitting || !responseGotten}
            >
              Delete Key
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyGen;
