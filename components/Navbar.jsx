"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import React from "react";
import { v4 as uuidv4 } from "uuid";

const Navbar = () => {
  const pathname = usePathname();

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
      <li className="flex gap-2 flex-center items-center text-xl opacity-85 hover:text-blue-600">
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
    <header className="w-full flex justify-between items-center  px-[5%] box-border mt-5 z-10 backdrop-blur-0">
      <Link
        href="/"
        className="logo flex items-center font-inter text-3xl font-bold text-sky-600 hover:opacity-75"
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

      <nav className="flex text-black items-center font-inter justify-end">
        <ul className="flex gap-7 items-center ">
          {navigationItems.map((item) => (
            <NavLink key={`${item.path} ${uuidv4()}`} {...item} />
          ))}
          <li>
            <Link
              href="https://paystack.com/pay/AMAC_Application_Form"
              className=" w-[90px] h-[40px] flex items-center justify-center bg-blue-700 rounded-md text-white hover:border-2 hover:border-blue-700 hover:bg-transparent hover:opacity-80 "
            >
              Get Form
            </Link>
          </li>
        </ul>
        {/* <BlueButton key={`NavBB_${uuidv4()}`} content={"Start Building +"} /> */}
      </nav>
    </header>
  );
};

export default Navbar;
