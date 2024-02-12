"use client";
import Carousel from "@/components/Carousel";
import ConfirmationMessage from "@/components/Confirmation";
import Navbar from "@/components/Navbar";
import {
  faArrowRight,
  faArrowUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./loading";
import Footer from "@/components/Footer";

export default function Home() {
  // const [projectButtonHovered, setProjectButtonHovered] = useState(false);
  const [projectButtonText, setProjectButtonText] = useState("Read More");
  const [letterVisible, setLetterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const projectRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
  const searchParams = useSearchParams();
  const dataFetchedRef = useRef(false);
  const router = useRouter();
  const referrerId = searchParams.get("r");
  const referenceNo = searchParams.get("reference");
  console.log("referenceNo:", referenceNo);
  console.log("refId:", referrerId);

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

  const handlePaymentProcess = useCallback(async () => {
    try {
      console.log("Ready to handle payment");
      const refId = sessionStorage.getItem("referrerId") || "admin";
      console.log("refId is:", refId);
      console.log("handling Payment...");
      // const response = await fetch(
      //   `/api/paystack/webhook?reference=${referenceNo}&refererId=${refId}`,
      //   {
      //     method: "GET",
      //     headers: { "Content-Type": "application/json" },
      //   }
      // );
      const response = await fetch(`/api/paystack/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNo,
          refId,
        }),
      });

      console.log(response);
      console.log("Responding...");

      if (response.ok) {
        // const data = await response.json(); // Parse response JSON
        console.log("returning true");
        return true;
      } else {
        const data = await response.json(); // Parse error response JSON
        if (response.status === 400) {
          console.log("returning false for bad request");
          warn(
            "Invalid Reference Number. Check your email for receipt and contact Tido Empire"
          );
        }
        if (response.status === 401) {
          console.log("returning false for invalid request");
          warn(
            "Seems there was an error in payment. Check your email for receipt and contact Tido Empire"
          );
        }
        return false;
      }
    } catch (error) {
      console.error("An error occurred", error);
      return false;
    }
  }, [referenceNo]);

  const handleProjectHoverIn = useCallback(() => {
    let dots = 0;
    let timer = 200;

    const addDot = () => {
      dots++;
      setProjectButtonText((prev) => prev + ".");
      if (dots < 3) {
        setTimeout(addDot, timer);
        timer += 200;
      }
    };

    addDot();
  }, []);

  const handleProjectHoverOut = useCallback(() => {
    setProjectButtonText("Read More");
  }, []);

  const displayLetter = () => setLetterVisible(true);
  const hideLetter = () => setLetterVisible(false);
  const currentYear = new Date().getFullYear();

  // Function to scroll back to the top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Effect to manage overflow based on modal state
  useEffect(() => {
    // Add or remove 'overflow-hidden' class based on the modal state
    if (letterVisible) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to remove the class when the component unmounts or when modal is closed
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [letterVisible]);

  // further implement \\

  // const getMargins = (element) => {
  //   const computedStyle = window.getComputedStyle(element);
  //   const marginTop = parseFloat(computedStyle.marginTop);
  //   const marginBottom = parseFloat(computedStyle.marginBottom);
  //   return { marginTop, marginBottom };
  // };

  useEffect(() => {
    if (!isLoading) return;
    if (dataFetchedRef.current) return;
    const processPayment = async () => {
      console.log("Processing Payment...");
      try {
        setPaymentProcessing(true);
        const paymentStatus = await handlePaymentProcess();
        console.log("paymentStatus:", paymentStatus);
        if (paymentStatus) {
          notify("Payment Successfully Made! Thank You for buying our form.");
        } else {
          warn(
            "There was an error in payment processing. Please try again or contact Tido Empire with receipt."
          );
        }
        console.log(" Payment Processed...");
      } catch (error) {
        console.error("Error Processing Payment", error);
      } finally {
        console.log(" Payment Processed2...");
        setPaymentProcessing(false);
      }
    };

    referenceNo && processPayment();
    dataFetchedRef.current = true;
  }, [referenceNo, handlePaymentProcess, isLoading]);

  useEffect(() => {
    console.log(referrerId);
    const saveReferrer = () => {
      if (referrerId !== null || referrerId !== "undefined") {
        sessionStorage.setItem("referrerId", referrerId);
        router.push("/");
      }
    };

    saveReferrer();
  }, [referrerId, router]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const scrollPosition = window.scrollY;

  //     // Get the dimensions and position of each section
  //     const aboutSection = aboutRef.current.getBoundingClientRect();
  //     const projectSection = projectRef.current.getBoundingClientRect();

  //     // Get margins dynamically
  //     const aboutMargins = getMargins(aboutRef.current);
  //     const projectMargins = getMargins(projectRef.current);

  //     // Adjust the buffer values based on margins
  //     const buffer = 20; // Adjust this value based on your needs

  //     const aboutSectionTop = aboutSection.top - buffer - aboutMargins.marginTop;
  //     const aboutSectionBottom = aboutSection.bottom + buffer + aboutMargins.marginBottom;
  //     const projectSectionTop = projectSection.top - buffer - projectMargins.marginTop;
  //     const projectSectionBottom = projectSection.bottom + buffer + projectMargins.marginBottom;

  //     // Check if scroll position is within the height range of each section
  //     if (
  //       scrollPosition >= 0 &&
  //       scrollPosition < aboutSectionTop
  //     ) {
  //       setActiveSection('home');
  //     } else if (
  //       scrollPosition >= aboutSectionTop &&
  //       scrollPosition < aboutSectionBottom
  //     ) {
  //       setActiveSection('about');
  //     } else if (
  //       scrollPosition >= projectSectionTop &&
  //       scrollPosition < projectSectionBottom
  //     ) {
  //       setActiveSection('project');
  //     } else {
  //       setActiveSection(null);
  //     }
  //   };

  //   // Attach the event listener to the window scroll event
  //   window.addEventListener('scroll', handleScroll);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  // const addDot = () => {
  //   let dot = 0;
  //   let displayDot = [];
  //   let increasing = true;

  //   const updateDisplay = () => {
  //     if (dot === 0 && increasing) {
  //       displayDot.push(".");
  //       dot++;
  //     } else if (dot === 3 && !increasing) {
  //       displayDot.pop();
  //       dot--;
  //     }
  //     if (dot === 3 || dot === 0) {
  //       increasing = !increasing;
  //     }
  //     setTimeout(updateDisplay, 700);
  //   };

  //   updateDisplay();
  //   return displayDot.join("");
  // };

  useEffect(() => {
    // Simulate fetching data
    console.log("mounted");
    setTimeout(() => {
      // Once data is loaded, update loading state
      setIsLoading(false);
    }, 2000); // Simulated delay of 2 seconds
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="sm:px-[5%] ">
          <div
            ref={homeRef}
            className="h-[90dvh] md:h-dvh w-full flex  xl:min-h-[750px]"
            style={{
              background: "url('/assets/images/image 2.jpg') center no-repeat",
              backgroundSize: "cover",
            }}
          >
            <div className="overlay bg-[#00000083] w-full h-full flex flex-col gap-4 md:gap-10">
              <Navbar activeSection={activeSection} />
              <div className="flex-1 flex flex-col text-white items-center justify-center gap-4 md:gap-8 lg:gap-14">
                {/* <h4 className="uppercase text-xl mb-1 font-medium text-white text-opacity-95">
              Application Form
            </h4> */}
                <h1 className="text-3xl md:text-5xl uppercase font-semibold text-center w-[70%] flex gap-2 md:gap-5 flex-col bg-gradient-to-br from-cyan-600 to-blue-600 bg-clip-text text-white mb-4 md:mb-9">
                  AMAC Area <br />
                  <span className="text-xl sm:text-2xl md:text-4xl">
                    Modern Market Project
                  </span>
                </h1>
                {/* <h1 className="text-5xl uppercase font-semibold mb-2 bg-gradient-to-br from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Tido Empire International Limited
            </h1> */}
                {/* <p className="w-[50%] text-center text-xl leading-[1.9] text-slate-200">
              <span className="font-medium">Dear valued stakeholders</span>
              <br />
              We are excited to announce that{" "}
              <span className="text-sky-600 font-medium">
                Tido Empire International Limited
              </span>{" "}
              has been awarded the contract to develop a modern market in the
              AMAC area council. This project is not just about building a
              market; it's about creating a sustainable future for generations
              to come.
            </p> */}
                <Link
                  href="https://paystack.com/pay/AMAC_Application_Form"
                  className="w-[130px] h-[45px] shadow-[0_2px_2px_2px_] text-base hover:text-lg active:text-lg md:text-xl md:hover:text-2xl shadow-[#a9a9a91f] sm:shadow-none lg:w-[19%] lg:h-[70px] relative box-border flex group opacity-80  items-center justify-center gap-1 md:gap-3  bg-blue-700 rounded-md text-white  hover:border-blue-700  hover:opacity-100 send-btn"
                >
                  Get Form{" "}
                  {/* <span className="animate-bounce text-3xl -mb-1 -rotate-[135deg]">
                ↓
              </span> */}
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    height={20}
                    width={20}
                    className="text-base md:text-2xl -rotate-[45deg] group-hover:inline group-active:inline md:hidden"
                  />
                  <span className="send-span"></span>
                </Link>
              </div>
            </div>
          </div>

          {/* About  */}
          <Suspense fallback={<ConfirmationMessage message={"Loading."} />}>
            <div
              ref={aboutRef}
              className="flex flex-col w-full about my-40 gap-40 items-center justify-center"
              id="about"
            >
              {/* <div className="flex w-full gap-20 px-[5%]">
          <div className="flex flex-col gap-7 w-[40%] h-full font-inter ">
            <h2 className=" text-black text-[60px] font-bold capitalize leading-[64px] mb-2">
              About Us
            </h2>
            <p className="text-black text-[23px] font-medium leading-10">
              Tido Empire registered under the corporate Affairs Commission
              (CAC) with the RC NO: 1707223 is a name synonymous with quality,
              timely delivery and reliability with products and individuals.
              This reputation has earned us ample experience in building
              construction, road construction, construction of Dams and
              Drainages, Erosion control works, rural electrification,
              engineering and consulting services With our pool of technical and
              physical capacity, our highly experienced team are capable of
              delivering world class projects both locally and internationally.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Image
              src="/assets/images/image 1.jpg"
              alt="Paint brush and color board icon"
              height={422}
              width={422}
              className="size-full"
            />
          </div>
        </div> */}
              <div className="flex w-full items-center justify-center shadow md:shadow-lg py-20">
                <div className="flex flex-col gap-3 md:gap-5 lg:gap-7  w-[80%] items-center font-inter ">
                  <h2 className=" text-black text-4xl lg:text-6xl font-bold capitalize leading-[64px] mb-1 md:mb-3">
                    About Us
                  </h2>
                  <p className="text-gray-900 text-base leading-6 text-balance md:text-lg md:leading-8 lg:text-[23px] md:text-center font-medium lg:leading-10 md:text-pretty">
                    Tido Empire registered under the corporate Affairs
                    Commission (CAC) with the RC NO: 1707223 is a name
                    synonymous with quality, timely delivery and reliability
                    with products and individuals. <br />
                    This reputation has earned us ample experience in building
                    construction, road construction, construction of Dams and
                    Drainages, Erosion control works, rural electrification,
                    engineering and consulting services With our pool of
                    technical and physical capacity, our highly experienced team
                    are capable of delivering world class projects both locally
                    and internationally.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-11 gap-7 md:gap-4 my-32 bg-[#d1e3ff] p-[5%]">
                <div className="flex flex-col col-span-5 gap-5 md:gap-8  lg:gap-14 font-inter ">
                  <h2 className=" text-[#0255cc] text-[21px] md:text-4xl lg:text-6xl font-semibold capitalize leading-7 md:leading-10 lg:leading-[64px] mb-1 md:mb-3">
                    Our Vision
                  </h2>
                  <p className="text-gray-900 text-sm leading-6 text-balance md:text-lg md:leading-8 lg:text-[23px] break-words lg:leading-10 md:text-pretty">
                    As a wholly indigenous company, we are desirous to take the
                    construction industry of Nigeria to level compatible with
                    what obtain elsewhere in the world. We are poise to towering
                    high above others in the construction business. Hence, the
                    reason for the beauty, quality and excellence we have
                    recorded over the years.
                  </p>
                </div>
                <div className="items-center justify-center flex bg-transparent col-span-5 md:col-span-1">
                  <hr className="w-full h-0.5 md:w-1 self-center md:h-full bg-black/80 md:bg-opacity-30" />
                </div>
                <div className="flex flex-col  gap-5 md:gap-8  lg:gap-14 font-inter col-span-5">
                  <h2 className="text-[#0255cc] text-[21px] md:text-4xl lg:text-6xl font-semibold capitalize leading-7 md:leading-10 lg:leading-[64px] mb-1 md:mb-3 self-end">
                    Our Strength
                  </h2>
                  <p className="text-gray-900 text-sm leading-6 text-balance md:text-lg md:leading-8 lg:text-[23px] break-words lg:leading-10 md:text-pretty">
                    Professionalism remains our hallmark. The Company is
                    surrounded with a cream of highly talented and equipped
                    staff that are endowed with the needed expertise and fueled
                    by the drive to deliver. Our machinery is next to none in
                    the construction industry. Our successful performance in
                    construction sector is supported by a client base of major
                    players in the industry who have commended us on our ability
                    remain consistent in delivery.
                  </p>
                </div>
              </div>
            </div>
          </Suspense>

          {/* Project  */}
          <Suspense fallback={<ConfirmationMessage message={"Loading."} />}>
            <div
              ref={projectRef}
              className="flex flex-col w-full about my-40 gap-40 items-center justify-center"
              id="project"
            >
              <div className="flex w-full items-center justify-center shadow-inner py-20">
                <div className="flex flex-col gap-9  w-[80%] items-center font-inter relative">
                  <h2 className=" text-black text-4xl lg:text-6xl font-bold capitalize leading-[64px] mb-1 md:mb-3 ">
                    Project
                  </h2>
                  <p className="text-gray-900 text-base leading-6 text-balance md:text-lg md:leading-8 lg:text-[23px] md:text-center font-medium lg:leading-10 md:text-pretty">
                    Dear valued stakeholders, We are excited to announce that
                    Tido Empire International Limited has been awarded the
                    contract to develop a modern market in the AMAC area
                    council. This project is not just about building a market,
                    it&apos;s about creating a sustainable future for
                    generations to come.
                  </p>
                  <button
                    type="button"
                    id="projectButton"
                    onMouseEnter={handleProjectHoverIn}
                    onMouseOut={handleProjectHoverOut}
                    onClick={displayLetter}
                    className="w-[130px] h-[45px] lg:w-[16%] lg:h-[60px] flex items-center font-medium justify-center bg-blue-700 rounded-md text-white hover:border-2 hover:border-blue-700 hover:bg-transparent hover:text-blue-700 hover:opacity-80 active:border-blue-700 active:bg-transparent active:text-blue-700"
                  >
                    {projectButtonText}
                  </button>

                  {/* Letter by Exec  */}
                  <div
                    className={`fixed top-0 left-0 w-full h-dvh bg-yellow-700 bg-opacity-20 z-50 items-center justify-center backdrop-brightness-50 backdrop-blur ${
                      letterVisible ? "flex showUp_animate" : "hidden "
                    }`}
                  >
                    <div className="size-full py-[9%] px-[10%] flex relative items-center justify-center overflow-auto ">
                      <div
                        className="fixed flex items-center justify-center top-1 right-9 md:top-4 md:right-7 text-3xl md:text-5xl cursor-pointer hover:opacity-80"
                        title="close"
                      >
                        <FontAwesomeIcon
                          alt="x icon"
                          icon={faXmark}
                          onClick={hideLetter}
                          className="hover:drop-shadow-[3px_7px_3px_#00000075] bg-[#] active:translate-x-0.5 active:translate-y-1 active:drop-shadow-[1px_4px_1.5px_#000000]"
                        />
                      </div>
                      <div
                        className={`letter size-full flex flex-col font-poppins gap-6`}
                      >
                        <h4 className="text-white text-lg md:text-xl leading-6 md:leading-10 font-medium capitalize mb-1 md:mb-3">
                          Dear valued stakeholders,
                        </h4>
                        <p className="text-white text-sm md:text-base leading-6 md:leading-7 whitespace-break-spaces">
                          We are excited to announce that Tido Empire
                          International Limited has been awarded the contract to
                          develop a modern market in the AMAC area council. This
                          project is not just about building a market, it&apos;s
                          about creating a sustainable future for generations to
                          come.
                        </p>
                        <h6 className="text-white text-base md:text-lg leading-7 font-medium mb-1 md:mb-2">
                          The Need for a Modern Market
                        </h6>
                        <p className="text-white text-sm md:text-base leading-6 md:leading-7 whitespace-break-spaces">
                          The existing market in the AMAC area council has
                          served its purpose, but it&apos;s time for a change.
                          We believe that a modern, fully-equipped, functional
                          ultra-modern market of over 800 shops is the solution
                          to the challenges faced by the old market. This new
                          market will not only provide a better shopping
                          experience for the community but also attract
                          investors and create huge potentials aligned with
                          global best practices.
                        </p>
                        <h6 className="text-white text-base md:text-lg leading-7 font-medium mb-1 md:mb-2">
                          Our Vision for Sustainable Development
                        </h6>
                        <p className="text-white text-sm md:text-base leading-6 md:leading-7  whitespace-break-spaces">
                          This project is inspired by the need to chart a new
                          course for sustainable development in the AMAC area
                          council. We aim to mobilize resources for the
                          development of critical and requisite infrastructure
                          that will ensure inter-generational equity. By
                          developing a modern market, we will boost the local
                          economy, create jobs, and deliver the dividends of
                          democracy.
                        </p>
                        <h6 className="text-white text-base md:text-lg leading-3 md:leading-7 font-medium mb-1 md:mb-2">
                          Our Capabilities
                        </h6>
                        <p className="text-white text-sm md:text-base leading-6 md:leading-7 whitespace-break-spaces">
                          Tido Empire International Limited is competently
                          ready, financially capable, adequately equipped, and
                          professionally qualified to carry out this development
                          project. We will utilize the public-private
                          partnership model, which is critical to helping your
                          administration solve one of the most pressing
                          financial and developmental challenges within the
                          council.
                        </p>
                        <h6 className="text-white text-base md:text-lg leading-7 font-medium mb-1 md:mb-2">
                          The Benefits
                        </h6>
                        <div className="text-white text-sm md:text-base leading-6 md:leading-7 whitespace-break-spaces">
                          <p>
                            This project will not only benefit the AMAC area
                            council but also the entire community. <br />
                            It will: <br />
                          </p>
                          <ul className="list-inside list-disc">
                            <li>
                              Attract investors and create huge potentials
                              aligned with global best practices.
                            </li>
                            <li>Boost the local economy and create jobs.</li>
                            <li>
                              Deliver the dividends of democracy Ensure
                              inter-generational equity.
                            </li>
                          </ul>
                        </div>
                        <h6 className="text-white text-base md:text-lg leading-7 font-medium mb-1 md:mb-2">
                          Conclusion
                        </h6>
                        <p className="text-white text-sm md:text-base leading-6 md:leading-7 whitespace-break-spaces">
                          We take this project seriously, and we are committed
                          to delivering a modern market that will stand the test
                          of time. We believe that this project will not only
                          transform the AMAC area council but also set a new
                          standard for sustainable development in Nigeria.
                        </p>
                        <p className="text-white text-sm md:text-base leading-6 md:leading-7 whitespace-break-spaces">
                          Thank you for your support, and we look forward to
                          working with you to make this vision a reality.
                        </p>
                        <address className="text-white text-sm md:text-base leading-7 md:leading-8 mt-2 mb-1">
                          Sincerely, <br />
                          Engr. Ebuka Sandra Ughasoro <br />
                          Executive Chairman, Tido Empire International Limited
                        </address>
                      </div>
                    </div>
                  </div>
                  {/* Letter by Exec end  */}
                </div>
              </div>
              <div className="flex flex-col gap-9  w-full items-center font-inter relative">
                <h3 className=" text-black text-base text-center md:text-[40px] font-semibold capitalize leading-8 md:leading-[64px] mb-2 ">
                  ARCHITECTURAL DESIGN OF GIDAN DAYA
                </h3>
                <p className="text-gray-900 text-opacity-80 text-[13px] md:text-[17px] text-center font-medium leading-5 w-[80%] md:w-[50%] text-pretty">
                  Having considered the challenges faced by this communities,
                  Tido Empire has come up with this modern architectural design
                  for the people of Gidan Daya Communities.
                </p>
                <div className="mt-7 md:mt-14 h-[200px] md:h-[400px] lg:h-[680px] w-[90%] overflow-clip max-md:w-[97%] border-2 flex items-center justify-center border-sky-600 rounded-2xl">
                  <Suspense
                    fallback={<ConfirmationMessage message={"Loading."} />}
                  >
                    <Carousel autoSlide={!paymentProcessing} />
                  </Suspense>
                </div>
              </div>
            </div>
          </Suspense>

          {/* Back to Top  */}
          <button
            type="button"
            className="fixed bottom-5 right-2 md:right-5 size-11 p-3  md:p-7 cursor-pointer text-white rounded-full bg-blue-600/70 opacity-70 hover:opacity-100 hover:bg-blue-600/90 backdrop-blur flex items-center justify-center text-base md:text-2xl"
            onClick={scrollToTop}
            title="Back to top"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
          <div className="my-52 w-full text-base flex flex-col items-center text-center font-semibold md:text-lg text-white bg-blue-600 py-4 rounded-md">
            <p>Want to become our Sales Agent? Contact Us Now</p>

            <a href="mailto:" className="hover:underline mt-3">Tido@empire.agent</a>
          </div>

          <Footer />
          {paymentProcessing && (
            <>
              <div className="w-full h-dvh fixed z-[999] flex items-center justify-center bg-black/70 top-0 left-0 gap-4">
                <div className="size-4 bg-transparent border-4 border-white border-r-0 border-l-0 border-t-0 rounded-xl box-content animate-spin"></div>
                <ConfirmationMessage
                  message={"Confirming Payment. Please hold on"}
                />
              </div>
            </>
          )}
          <ToastContainer />
        </main>
      )}
    </>
  );
}
