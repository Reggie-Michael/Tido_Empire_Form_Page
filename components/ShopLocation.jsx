import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@material-tailwind/react";
import React from "react";
import Link from "next/link";

const ShopLocation = ({ hideModal }) => {
  const buttonClick = (value) => {
    try {
      sessionStorage.setItem("shopLocation", value);
      if (typeof window !== "undefined") {
        window.location.href =
          "https://paystack.com/pay/tidobuilds_amac_application_form_test_1711027344564";
      }
      setTimeout(hideModal, 2000);
    } catch (error) {
      hideModal();
    }
  };

  return (
    <div className="fixed left-0 top-0 w-full h-full bg-blue-600/50 backdrop-blur z-[99] flex items-center justify-center">
      <div
        className="fixed flex items-center justify-center top-1 right-9 md:top-4 md:right-7 text-2xl md:text-4xl cursor-pointer hover:opacity-80"
        title="close"
        aria-label="close letter"
      >
        <FontAwesomeIcon
          alt="x icon"
          icon={faXmark}
          onClick={hideModal}
          className="hover:drop-shadow-[3px_7px_3px_#00000075] text-blue-600/60 active:translate-x-0.5 active:translate-y-1 active:drop-shadow-[1px_4px_1.5px_#000000]"
        />
      </div>
      <div className=" text-white absolute top-10 font-medium  text-sm md:text-lg px-2">
        Proceeding onward means you have accepted to&nbsp;
        <Link
          href={"/terms"}
          title="Terms and Conditions"
          onClick={() => setTimeout(hideModal, 500)}
          aria-label="Tido Empire Terms and Condition"
          className="underline mb-3 underline-offset-2  hover:opacity-75 lowercase"
        >
          our Terms and Conditions
        </Link>
        {/* Hover on buttons for more details */}
      </div>
      <div className="flex flex-col w-full h-4/6 md:h-2/5 gap-20 md:gap-0 px-[5%] md:px-[10%] items-center justify-between">
        <div className="text-white">
          <h2 className="text-2xl font-semibold md:text-4xl font-inter opacity-5 text-opacity-5 ">
            Select Shop Location
          </h2>
          <h2 className="text-2xl font-semibold md:text-4xl font-inter -mt-9">
            Select Shop Location
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-5 w-full h-3/6 pb-10 md:h-24 md:w-4/5">
          <Button
            className="border-2 bg-blue-700"
            title="3.7mm x 3m X 8m X 3.5m"
            onClick={() => buttonClick("ground Floor")}
          >
            Ground Floor
          </Button>
          <Button
            className="border-2 bg-blue-700"
            title="3.7mm x 3m X 8m X 3.5m"
            onClick={() => buttonClick("first Floor")}
          >
            First Floor
          </Button>
          <Button
            className="border-2 bg-blue-700"
            title="3.7mm x 3m"
            onClick={() => buttonClick("second Floor")}
          >
            Second Floor
          </Button>
          <Button
            className="border-2 bg-blue-700"
            onClick={() => buttonClick("warehouse")}
          >
            Warehouse
          </Button>
        </div>
        <div className=" text-white absolute bottom-0">
          <Link
            href={"/terms"}
            title="Terms and Conditions"
            onClick={() => setTimeout(hideModal, 500)}
            aria-label="Tido Empire Terms and Condition"
            className="underline mb-3 underline-offset-2 font-medium text-sm md:text-lg hover:opacity-75"
          >
            Read Our Terms and Conditions
          </Link>
          {/* Hover on buttons for more details */}
        </div>
      </div>
    </div>
  );
};

export default ShopLocation;
