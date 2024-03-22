import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@material-tailwind/react";
import Link from "next/link";

const Footer = ({ modalOpen }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full shadow-inner min-h-[300px] h-[40dvh] mt-9 mb-3 grid grid-cols-1 md:grid-cols-11 gap-14 md:gap-5 px-[5%] md:px-[2.5%] py-[3%]">
      <div className="flex flex-col gap-9 justify-between md:col-span-5 ">
        <div className="flex flex-col gap-5 md:gap-8">
          <h2 className="text-2xl lg:text-4xl font-semibold font-inter">
            Tido Empire
          </h2>
          <p className="font-medium text-base lg:text-lg md:w-3/5">
            Get a spot in our market by buying an application form Now!
          </p>
        </div>
        <Button
          onClick={modalOpen}
          title="Fill Shop Application Form"
          aria-label="Fill Shop Application Form"
          className="w-[25%] md:w-2/5 h-[40px] md:h-[50px] shadow-[0_2px_2px_2px_] text-sm md:text-base hover:text-lg active:text-lg capitalize font-medium shadow-[#a9a9a91f] sm:shadow-none relative box-border flex group opacity-90  items-center justify-center gap-1 md:gap-3  bg-blue-700 rounded-md text-white  hover:border-blue-700 hover:opacity-100 send-btn"
        >
          Get Form
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-sm md:text-lg -rotate-[45deg] group-hover:inline group-active:inline md:hidden"
          />
          <span className="send-span"></span>
        </Button>
        <Link
          href={"/terms"}
          title="Terms and Conditions"
          aria-label="Tido Empire Terms and Condition"
          className="text-blue-600 underline -mt-3 underline-offset-2 font-medium text-sm hover:opacity-75"
        >
          Read Our Terms and Conditions
        </Link>
      </div>
      <div className="flex flex-col gap-5 md:col-span-3">
        <h2 className="text-xl lg:text-3xl font-semibold font-inter uppercase">
          Follow Us
        </h2>
        <div className="grid grid-cols-3 gap-4 md:gap-1 w-2/5 md:w-3/5">
          <Link
            title="Tido Empire Instagram Page"
            href={
              "https://www.instagram.com/tidobuilds?igsh=MWZqMmJjbGZpbXV3Zg%3D%3D&utm_source=qr"
            }
            className="border rounded-full size-9 flex items-center justify-center border-black text-lg hover:bg-black/90 hover:text-white hover:size-10 "
          >
            <FontAwesomeIcon icon={faInstagram} />
          </Link>
          <Link
            title="Tido Empire Facebook Page"
            href={
              "https://www.facebook.com/profile.php?id=61556794744332&mibextid=LQQJ4d"
            }
            className="border rounded-full size-9 flex items-center justify-center border-black text-lg hover:bg-black/90 hover:text-white hover:size-10 "
          >
            <FontAwesomeIcon icon={faFacebook} />
          </Link>
          {/* <Link
            title="twitter/x"
            href={""}
            className="border rounded-full size-9 flex items-center justify-center border-black text-lg hover:bg-black/90 hover:text-white hover:size-10 "
          >
            <FontAwesomeIcon icon={faTwitter} />
          </Link> */}
        </div>
      </div>
      <div className="flex flex-col gap-5 md:col-span-3">
        <h2 className="text-xl lg:text-3xl font-semibold font-inter uppercase">
          Contact Us
        </h2>
        <Link href="tel:+234 906 5091 885" className="text-base md:text-lg font-semibold hover:underline underline-offset-2 hover:opacity-85">+234 906 5091 885</Link>
        <Link href="tel:+234 815 9659 558" className="text-base md:text-lg font-semibold hover:underline underline-offset-2 hover:opacity-85">+234 815 9659 558</Link>
        <Link
          href={"mailto:support@tidobuilds.com"}
          className="text-base md:text-lg font-semibold hover:underline underline-offset-2 hover:opacity-85"
        >
          support@tidobuilds.com
        </Link>
        <a href="tel:+"></a>
      </div>
      <div className="my-9 md:col-span-11 row-span-1 text-sm flex flex-col items-center text-center font-semibold md:text-base">
        Made with ❤️ by Afripul Group &copy; {currentYear}
      </div>
    </footer>
  );
};

export default Footer;
