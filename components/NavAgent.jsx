"use client";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
// import React from "react";
import { v4 as uuidv4 } from "uuid";

const Navbar = ({ activeSection, className }) => {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const isActive = (path) => pathname === path;

  const navigationItems = [
    { path: "/", label: "Home" },
    { path: "/#about", label: "About" },
    { path: "/#project", label: "Project" },
  ];

  const NavLink = ({ path, label }) => {
    const linkPath =
      path === "/" ? path : `/#${label.toLowerCase().replace(" ", "-")}`;

    return (
      <li className="flex gap-2 flex-center items-center text-lg md:text-base lg:text-xl opacity-85 hover:text-blue-600 nav-link">
        <Link
          href={linkPath}
          className={`${
            pathname === linkPath
              ? "text-blue-600 font-semibold capitalize"
              : "font-semibold capitalize"
          }`}
        >
          {label}
        </Link>
      </li>
    );
  };
  return (
    <header className={`w-full flex justify-between items-center px-[5%] box-border py-5 z-10 backdrop-blur-0 relative bg-white sm:bg-transparent ${className}`}>
      <Link
        href="/"
        className="logo flex items-center font-inter text-xl lg:text-3xl font-bold text-white hover:opacity-75"
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

      <nav className="flex text-white items-center font-inter justify-end">
        <ul className="hidden gap-7 items-center sm:flex ">
          {navigationItems.map((item) => (
            <NavLink key={`${item.path} ${uuidv4()}`} {...item} />
          ))}
          <li>
            <Link
              href="https://paystack.com/pay/AMAC_Application_Form"
              className="w-[65px] h-[30px] md:w-[90px] md:h-[40px] text-xs lg:text-base flex items-center justify-center bg-blue-700 rounded-md text-white hover:border-2 hover:border-blue-700 hover:bg-transparent hover:opacity-80 "
            >
              Get Form
            </Link>
          </li>
        </ul>
        {/* Mobile Nav  */}
        <FontAwesomeIcon
          alt={navOpen ? "x icon" : "menu icon"}
          icon={navOpen ? faXmark : faBars}
          onClick={() => {
            setNavOpen(!navOpen);
          }}
          className={`sm:hidden inline hover:opacity-100 z-10 ${
            navOpen ? "text-2xl opacity-100" : "text-xl opacity-75 "
          }`}
        />
        {navOpen && (
          <div className="absolute bg-white shadow-inner left-0 w-full h-fit py-3  translate-y-[65%] sm:hidden">
            <ul className="gap-2 flex flex-col">
              {navigationItems.map((item) => (
                <div
                  className="w-full py-2 px-[5%] hover:bg-black/10 text-black"
                  key={`${item.path}Wrap_${uuidv4()}`}
                >
                  <NavLink
                    key={`${item.path} ${uuidv4()}`}
                    {...item}
                    className="w-full"
                  />
                </div>
              ))}
              <li className="px-[2%]">
                <Link
                  href="https://paystack.com/pay/AMAC_Application_Form"
                  className=" w-full h-[40px] flex items-center justify-center text-sm font-medium bg-blue-700 rounded-md text-white hover:border-2 hover:border-blue-700 hover:bg-transparent hover:opacity-80 "
                >
                  Get Form
                </Link>
              </li>
            </ul>
          </div>
        )}
        {/* <BlueButton key={`NavBB_${uuidv4()}`} content={"Start Building +"} /> */}
      </nav>
    </header>
  );
};

export default Navbar;
