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
import { ToastContainer } from "react-toastify";
import Image from "next/image";

export default function Agent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState("");
  const [agencyKey, setAgencyKey] = useState("");
  const [copied, setCopied] = useState("");

  const success = searchParams.get("s");
  const newAgencyKey = searchParams.get("k");
  const refLink = searchParams.get("r");
  // console.log(mode);

  useEffect(() => {
    try {
      if (
        !refLink &&
        !newAgencyKey &&
        (success !== true || success !== false)
      ) {
        router.push("/agent/login");
      } else {
        const currentURL = window.location.origin;
        // console.log(currentURL);
        setReferralLink(`${currentURL}/?r=${refLink}`);
        setAgencyKey(`${newAgencyKey}`);
      }
    } catch (error) {
      console.error(error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [refLink, success, newAgencyKey, router]);

  // useEffect(() => {
  //   // Simulate fetching data
  //   console.log("mounted");
  //   setTimeout(() => {
  //     // Once data is loaded, update loading state
  //     setIsLoading(false);
  //   }, 500); // Simulated delay of .5 seconds
  // }, []);

  const handleCopy = () => {
    setCopied(referralLink);
    navigator.clipboard.writeText(referralLink);
    setTimeout(() => setCopied(false), 3000);
  };
  const handleCopy2 = () => {
    setCopied(agencyKey);
    navigator.clipboard.writeText(agencyKey);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full h-fit">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col h-dvh w-full items-center  gap-5 animate__animated animate__zoomIn animate__faster">
          <Navbar className="text-black" />
          <div className="flex flex-col items-center text-center gap-1 md:gap-3 mt-10  md:mt-20">
            <h4 className="text-xl md:text-2xl leading-3 font-medium">
              Welcome To{" "}
            </h4>
            <h1 className="text-3xl leading-10 md:leading-7 md:text-5xl lg:text-7xl text-blue-700 font-bold">
              Sales Agent Tab
            </h1>
          </div>
          <div className="mt-9 w-full flex items-center justify-center px-[2.5%]">
            <div className="border-2 flex flex-col gap-4  w-full md:w-1/2 lg:w-1/3 items-center text-center px-2 py-4  border-black border-opacity-20 focus-visible:border-opacity-100 focus-within:border-opacity-100">
              <p className="text-base md:text-xl font-medium">
                Your Referral Link {agencyKey && "and Key"} is:
              </p>
              <div className="flex relative w-full text-center items-center justify-center">
                <p className="whitespace-nowrap overflow-x-auto overflow-y-hidden">
                  {referralLink ||
                    "finwifowfowfonofnofnwofn fklwnfnfnwnfownfnwofnwnflwnfonwofnwofnwonfownfownfonwofnwonfownfownfown"}
                </p>

                <div className="copy_btn" onClick={handleCopy}>
                  <Image
                    src={
                      copied === referralLink
                        ? "/assets/icons/tick.svg"
                        : "/assets/icons/copy.svg"
                    }
                    alt={copied === referralLink ? "tick_icon" : "copy_icon"}
                    width={32}
                    height={22}
                    className="absolute right-0 -top-7 cursor-pointer"
                  />
                </div>
              </div>
               {agencyKey && <>
                <p className="text-sm md:text-base font-medium">
                   Agency Key 
                </p>
              <div className="flex relative w-full text-center items-center justify-center">
                <p className="whitespace-nowrap overflow-x-auto overflow-y-hidden">{agencyKey}</p>
                <div className="copy_btn" onClick={handleCopy2}>
                  <Image
                    src={
                      copied === agencyKey
                        ? "/assets/icons/tick.svg"
                        : "/assets/icons/copy.svg"
                    }
                    alt={copied === agencyKey ? "tick_icon" : "copy_icon"}
                    width={32}
                    height={22}
                    className="absolute right-0 -top-7 cursor-pointer"
                  />
                </div>
              </div>
               </>}
            </div>
          </div>
          <ToastContainer />
        </div>
      )}
    </div>
  );
}
