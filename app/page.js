"use client";
import Carousel from "@/components/Carousel";
import Navbar from "@/components/Navbar";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  // const [projectButtonHovered, setProjectButtonHovered] = useState(false);
  const [projectButtonText, setProjectButtonText] = useState("Read More");
  const [letterVisible, setLetterVisible] = useState(false);

  const handleProjectHoverIn = () => {
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
  };

  const handleProjectHoverOut = () => {
    setProjectButtonText("Read More");
  };

  const displayLetter = () => setLetterVisible(true);
  const hideLetter = () => setLetterVisible(false);
  const currentYear = new Date().getFullYear();

  return (
    <main className="px-[5%]">
      <div
        className="h-dvh w-full flex  xl:min-h-[750px] "
        style={{
          background: "url('/assets/images/image 2.jpg') center no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="overlay bg-[#00000083] w-full h-full flex flex-col gap-10">
          <Navbar />
          <div className="flex-1 flex flex-col text-white items-center justify-center gap-14">
            {/* <h4 className="uppercase text-xl mb-1 font-medium text-white text-opacity-95">
              Application Form
            </h4> */}
            <h1 className="text-5xl uppercase font-semibold text-center w-[70%] flex gap-5 flex-col bg-gradient-to-br from-cyan-600 to-blue-600 bg-clip-text text-white mb-9">
              AMAC Area <br />
              <span className="text-4xl">Modern Market Project</span>
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
              className=" w-[19%] h-[70px]  relative box-border flex items-center justify-center gap-3 text-xl bg-blue-700 rounded-md text-white  hover:border-blue-700  hover:opacity-80 send-btn"
            >
              Get Form <span className="animate-bounce text-3xl -mb-2">↓</span>
              <span className="send-span"></span>
            </Link>
          </div>
        </div>
      </div>

      <div
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
        <div className="flex w-full items-center justify-center shadow-lg py-20">
          <div className="flex flex-col gap-7  w-[80%] items-center font-inter ">
            <h2 className=" text-black text-[60px] font-bold capitalize leading-[64px] mb-3">
              About Us
            </h2>
            <p className="text-gray-900 text-[23px] text-center font-medium leading-10 text-pretty">
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
        </div>
        <div className="grid grid-cols-11 gap-4 my-32 bg-[#d1e3ff] p-[5%]">
          <div className="flex flex-col col-span-5  gap-14 font-inter ">
            <h2 className=" text-[#0255cc] text-[60px] font-semibold capitalize leading-[64px] mb-3">
              Our Vision
            </h2>
            <p className="text-gray-900 text-[23px] leading-10 text-pretty">
              As a wholly indigenous company, we are desirous to take the
              construction industry of Nigeria to level compatible with what
              obtain elsewhere in the world. We are poise to towering high above
              others in the construction business. Hence, the reason for the
              beauty, quality and excellence we have recorded over the years.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <hr className="w-1 self-center h-full bg-black bg-opacity-25" />
          </div>
          <div className="flex flex-col  gap-14 font-inter col-span-5">
            <h2 className="text-[#0255cc] text-[60px] font-semibold capitalize leading-[64px] mb-3 self-end">
              Our Strength
            </h2>
            <p className="text-gray-900 text-[23px]  leading-10 break-words">
              Professionalism remains our hallmark. The Company is surrounded
              with a cream of highly talented and equipped staff that are
              endowed with the needed expertise and fueled by the drive to
              deliver. Our machinery is next to none in the construction
              industry. Our successful performance in construction sector is
              supported by a client base of major players in the industry who
              have commended us on our ability remain consistent in delivery.
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col w-full about my-40 gap-40 items-center justify-center"
        id="project"
      >
        <div className="flex w-full items-center justify-center shadow-inner  py-20">
          <div className="flex flex-col gap-9  w-[80%] items-center font-inter relative">
            <h2 className=" text-black text-[60px] font-bold capitalize leading-[64px] mb-3 ">
              Project
            </h2>
            <p className="text-gray-900 text-[23px] text-center font-medium leading-10">
              Dear valued stakeholders, We are excited to announce that Tido
              Empire International Limited has been awarded the contract to
              develop a modern market in the AMAC area council. This project is
              not just about building a market, it's about creating a
              sustainable future for generations to come.
            </p>
            <button
              type="button"
              id="projectButton"
              onMouseEnter={handleProjectHoverIn}
              onMouseOut={handleProjectHoverOut}
              onClick={displayLetter}
              className=" w-[13%] h-[60px] flex items-center font-medium justify-center bg-blue-700 rounded-md text-white hover:border-2 hover:border-blue-700 hover:bg-transparent hover:text-blue-700 hover:opacity-80 "
            >
              {projectButtonText}
            </button>

            {/* Letter by Exec  */}
            <div
              className={`fixed top-0 left-0 w-full h-dvh bg-yellow-700 bg-opacity-20 z-50 items-center justify-center backdrop-brightness-50 backdrop-blur ${
                letterVisible ? "flex showUp_animate" : "hidden "
              }`}
            >
              <div className="size-full py-[5%] px-[10%] flex relative items-center justify-center overflow-auto ">
                <div
                  className="absolute flex items-center justify-center top-4 right-7 text-5xl cursor-pointer hover:opacity-80"
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
                  className={`letter size-full flex flex-col  font-poppins gap-6`}
                >
                  <h4 className="text-white text-xl leading-10 font-medium capitalize mb-3">
                    Dear valued stakeholders,
                  </h4>
                  <p className="text-white text-base leading-7 whitespace-break-spaces">
                    We are excited to announce that Tido Empire International
                    Limited has been awarded the contract to develop a modern
                    market in the AMAC area council. This project is not just
                    about building a market, it's about creating a sustainable
                    future for generations to come.
                  </p>
                  <h6 className="text-white text-lg leading-7 font-medium mb-2">
                    The Need for a Modern Market
                  </h6>
                  <p className="text-white text-base leading-7 whitespace-break-spaces">
                    The existing market in the AMAC area council has served its
                    purpose, but it's time for a change. We believe that a
                    modern, fully-equipped, functional ultra-modern market of
                    over 800 shops is the solution to the challenges faced by
                    the old market. This new market will not only provide a
                    better shopping experience for the community but also
                    attract investors and create huge potentials aligned with
                    global best practices.
                  </p>
                  <h6 className="text-white text-lg leading-7 font-medium mb-2">
                    Our Vision for Sustainable Development
                  </h6>
                  <p className="text-white text-base leading-7 whitespace-break-spaces">
                    This project is inspired by the need to chart a new course
                    for sustainable development in the AMAC area council. We aim
                    to mobilize resources for the development of critical and
                    requisite infrastructure that will ensure inter-generational
                    equity. By developing a modern market, we will boost the
                    local economy, create jobs, and deliver the dividends of
                    democracy.
                  </p>
                  <h6 className="text-white text-lg leading-7 font-medium mb-2">
                    Our Capabilities
                  </h6>
                  <p className="text-white text-base leading-7 whitespace-break-spaces">
                    Tido Empire International Limited is competently ready,
                    financially capable, adequately equipped, and professionally
                    qualified to carry out this development project. We will
                    utilize the public-private partnership model, which is
                    critical to helping your administration solve one of the
                    most pressing financial and developmental challenges within
                    the council.
                  </p>
                  <h6 className="text-white text-lg leading-7 font-medium mb-2">
                    The Benefits
                  </h6>
                  <div className="text-white text-base leading-7 whitespace-break-spaces">
                    <p>
                      This project will not only benefit the AMAC area council
                      but also the entire community. <br />
                      It will: <br />
                    </p>
                    <ul className="list-inside list-disc">
                      <li>
                        Attract investors and create huge potentials aligned
                        with global best practices.
                      </li>
                      <li>Boost the local economy and create jobs.</li>
                      <li>
                        Deliver the dividends of democracy Ensure
                        inter-generational equity.
                      </li>
                    </ul>
                  </div>
                  <h6 className="text-white text-lg leading-7 font-medium mb-2">
                    Conclusion
                  </h6>
                  <p className="text-white text-base leading-7 whitespace-break-spaces">
                    We take this project seriously, and we are committed to
                    delivering a modern market that will stand the test of time.
                    We believe that this project will not only transform the
                    AMAC area council but also set a new standard for
                    sustainable development in Nigeria.
                  </p>
                  <p className="text-white text-base leading-7 whitespace-break-spaces">
                    Thank you for your support, and we look forward to working
                    with you to make this vision a reality.
                  </p>
                  <address className="text-white text-base leading-8 mt-2">
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
          <h3 className=" text-black text-[40px] font-semibold capitalize leading-[64px] mb-2 ">
            ARCHITECTURAL DESIGN OF GIDAN DAYA
          </h3>
          <p className="text-gray-900 text-opacity-80 text-[17px] text-center font-medium leading-5 w-[50%] text-pretty">
            Having considered the challenges faced by this communities, Tido
            Empire has come up with this modern architectural design for the
            people of Gidan Daya Communities.
          </p>
          <div className="mt-14 h-[680px] w-[90%] overflow-clip max-md:w-full border-2 flex items-center justify-center border-sky-600 rounded-2xl">
            <Carousel autoSlide={true} key={`Carousel_${uuidv4()}`} />
          </div>
        </div>
      </div>

      <footer className="my-9 w-full flex flex-col items-center text-center font-semibold">
        Made with ❤️ by Afripul Group &copy; {currentYear}
      </footer>
    </main>
  );
}
