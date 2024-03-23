"use client";
import React, { useEffect, useState } from "react";
import Loading from "../loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
// import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf"; // Import jsPDF library
import "jspdf-autotable";
import { Button } from "@material-tailwind/react";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShopLocation from "@/components/ShopLocation";

export default function TermsAndCondition() {
  const [isLoading, setIsLoading] = useState(true);
  const [downloadPdf, setDownloadPdf] = useState(false);
  const [formPurchase, setFormPurchase] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const scrollTopReady = () => {
    if (typeof window !== "undefined" && document.documentElement) {
      const deviceHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      return scrollHeight > deviceHeight && scrollTop > 0;
    }
    return false;
  };
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
  // Function to scroll back to the top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(scrollTopReady());
    };

    // Attach scroll event listener when component mounts
    window.addEventListener("scroll", handleScroll);

    // Remove scroll event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array ensures effect runs only once on mount

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Once data is loaded, update loading state
      setIsLoading(false);
    }, 2000); // Simulated delay of 2 seconds
  }, []);

  const downloadTermsPDF = async () => {
    try {
      setDownloadPdf(true);

      // Get the content of the terms and conditions section
      const pdfURL = "/assets/data/tido_empire_terms_and_condition.pdf"; // Adjust the path as needed
      const link = document.createElement("a");
      link.href = pdfURL;
      link.setAttribute("download", "terms_and_conditions.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      warn("Download unsuccessful, Please Try again Later.")
    } finally {
      setDownloadPdf(false);
      notify("✅");
    }
  };

  const showModal = () => setFormPurchase(true);
  const hideModal = () => setFormPurchase(false);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="sm:px-[5%] ">
          <div
            className=" w-full flex  xl:min-h-[750px]"
            // style={{
            //   background: "url('/assets/images/image 2.jpg') center no-repeat",
            //   backgroundSize: "cover",
            // }}
          >
            <div className="w-full h-full flex flex-col gap-4 md:gap-10 mt-2">
              <Navbar
                modalOpen={showModal}
                className="text-black terms"
                // formLinkDisabled={true}
              />
              <div className="flex items-center justify-end mt-20 mb-10">
                <div className="flex items-center gap-4">
                  <p className="font-medium text-xs sm:text-sm md:text-base">
                    Effective March 21 2024
                  </p>
                  <div className="flex justify-center">
                    <Button
                      onClick={downloadTermsPDF}
                      loading={downloadPdf}
                      aria-label="Download Terms and condition PDF"
                      title="Download Terms and condition PDF"
                      className="bg-transparent hover:bg-blue-700 text-blue-700 underline underline-offset-2 md:underline-offset-0 md:no-underline md:text-white max-md:shadow-none font-bold py-2 px-4 rounded text-xs sm:text-sm md:text-base md:bg-blue-500"
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col w-full border py-7 px-[5%] gap-5 font-inter  mb-36"
                id="termsAndConditions"
              >
                <div className="flex items-center justify-center w-full">
                  <Image
                    src="/assets/icons/1024x1024 Square edge.jpg"
                    alt="Tido Empire Logo"
                    height={1024}
                    width={1024}
                    className="size-11 md:size-16"
                  />
                </div>
                <h1 className="self-center my-16 text-lg sm:text-xl md:text-3xl font-semibold">
                  Tido Empire Terms and Condition
                </h1>

                <strong className="font-medium text-[15px] mb-4 w-full md:w-4/5 leading-6">
                  We strongly advice you not skip this page as it contain
                  important Notice concerning Form Purchase.
                </strong>
                <div className="flex flex-col w-full leading-6 gap-9">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-medium text-lg">
                      Terms and Conditions:
                    </h4>
                    <p>
                      Shop allocations require full payment confirmed by UBA
                      into TIDO EMPIRE&apos;s account, subject to availability.
                    </p>
                    <p>Form fee is non-refundable.</p>
                    <p>
                      If a preferred shop type/level isn&apos;t available, applicants
                      must accept an alternative within zoning restrictions
                      after making full payment.
                    </p>
                    <p>
                      The Developer reserves the right to verify information
                      provided.
                    </p>
                    <p>
                      Shops will be allocated based on full payments made to
                      TIDO EMPIRE INTL&apos;s UBA account (#1023505693).
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="font-medium text-lg">
                      Conditions to Be Complied With:
                    </h4>
                    <ul className="flex flex-col gap-4 list-disc list-inside">
                      <li>One application form per shop.</li>
                      <li>Nontransferable applications.</li>
                      <li>
                        Online payments via provided links; no other methods
                        accepted.
                      </li>
                      <li>
                        Payments to be made to TIDO EMPIRE INTL&apos;s UBA account
                        (#2041610327).
                      </li>
                      <li>
                        No liability assumed for payments sent to accounts other
                        than specified.
                      </li>
                      <li>Preference given to fully paid applications.</li>
                      <li>
                        Purchase queries should be addressed to TIDO EMPIRE
                        INTL&apos;s accredited agent ( Everview Properties Limited).
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="font-medium text-lg">Declaration:</h4>
                    <p>
                      The applicant(s) declares that all information provided is
                      accurate and they will relinquish any allocated shop if
                      found to be false or misleading. <br />
                      <span className="font-semibold">
                        This declaration is made under the Oath Law of FCT
                        Abuja, Nigeria.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Top  */}
          {showButton && (
            <button
              type="button"
              className="fixed bottom-5 showUp_animate2 right-2 md:right-5 size-11 p-3  md:p-7 cursor-pointer text-white rounded-full bg-blue-600/70 opacity-70 hover:opacity-100 hover:bg-blue-600/90 backdrop-blur flex items-center justify-center text-base md:text-2xl"
              onClick={scrollToTop}
              title="Back to top"
              aria-label="Back to top"
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
          )}
          {formPurchase && <ShopLocation hideModal={hideModal} />}
          <Footer modalOpen={showModal} />
        </main>
      )}
    </>
  );
}
