import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full shadow-inner min-h-[300px] h-[40dvh] mt-9 mb-3 grid grid-cols-1 md:grid-cols-11 gap-14 md:gap-5 px-[5%] md:px-[2.5%] py-[3%]">
      <div className="flex flex-col gap-9 justify-between md:col-span-5 ">
        <div className="flex flex-col gap-5 md:gap-8">
          <h2 className="text-3xl md:text-5xl font-semibold font-inter">
            Tido Empire
          </h2>
          <p className="font-medium text-lg md:w-3/5">
            Get a spot in our market by buying an application form Now!
          </p>
        </div>
        <Link
          href="https://paystack.com/pay/AMAC_Application_Form"
          className="w-[25%] md:w-2/5 h-[40px] md:h-[50px] shadow-[0_2px_2px_2px_] text-sm md:text-base hover:text-lg active:text-lg shadow-[#a9a9a91f] sm:shadow-none relative box-border flex group opacity-90  items-center justify-center gap-1 md:gap-3  bg-blue-700 rounded-md text-white  hover:border-blue-700 hover:opacity-100 send-btn"
        >
          Get Form
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-sm md:text-lg -rotate-[45deg] group-hover:inline group-active:inline md:hidden"
          />
          <span className="send-span"></span>
        </Link>
      </div>
      <div className="flex flex-col gap-5 md:col-span-3">
        <h2 className="text-xl md:text-3xl font-semibold font-inter uppercase">
          Follow Us
        </h2>
        <div className="grid grid-cols-3 gap-4 w-2/5 md:w-4/5">
          <Link
            title="Instagram"
            href={""}
            className="border rounded-full size-9 flex items-center justify-center border-black text-lg hover:bg-black/90 hover:text-white hover:size-10 "
          >
            <FontAwesomeIcon icon={faInstagram} />
          </Link>
          <Link
            title="facebook"
            href={""}
            className="border rounded-full size-9 flex items-center justify-center border-black text-lg hover:bg-black/90 hover:text-white hover:size-10 "
          >
            <FontAwesomeIcon icon={faFacebook} />
          </Link>
          <Link
            title="twitter/x"
            href={""}
            className="border rounded-full size-9 flex items-center justify-center border-black text-lg hover:bg-black/90 hover:text-white hover:size-10 "
          >
            <FontAwesomeIcon icon={faTwitter} />
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-5 md:col-span-3">
        <h2 className="text-xl md:text-3xl font-semibold font-inter uppercase">
          Call Us
        </h2>
        <p className="text-base md:text-lg font-semibold">80 2145 7896</p>
      </div>
      <div className="my-9 md:col-span-11 row-span-1 text-sm flex flex-col items-center text-center font-semibold md:text-base">
        Made with ❤️ by Afripul Group &copy; {currentYear}
      </div>
    </footer>
  );
};

export default Footer;
