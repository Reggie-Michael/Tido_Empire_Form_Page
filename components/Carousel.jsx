import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Zoom } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Carousel = ({ autoSlide = false, autoSlideInterval = 2000 }) => {
  const slides = [
    "/assets/images/image 1.jpg",
    "/assets/images/image 2.jpg",
    "/assets/images/image 3.jpg",
    "/assets/images/image 4.jpg",
    "/assets/images/image 5.jpg",
    "/assets/images/image 6.jpg",
    "/assets/images/image 7.jpg",
    "/assets/images/image 8.jpg",
    "/assets/images/image 9.jpg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [appearClass, setAppearClass] = useState(false);

  const handleClassAppear = () => {
    if (isHovered && buttonHovered) {
      // setAppearClass();
    } else if (isHovered) {
      setAppearClass(false);
    }
  };
  const prevSlide = () => {
    !appearClass && setAppearClass(true);
    const firstSlide = currentIndex == 0;
    setCurrentIndex((prev) => (firstSlide ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    !appearClass && setAppearClass(true);
    const lastSlide = currentIndex == slides.length - 1;
    setCurrentIndex((prev) => (lastSlide ? 0 : prev + 1));
  };
  useEffect(() => {
    if (!autoSlide) return;
    handleClassAppear();
    const slideInterval = setInterval(() => {
      if (!isHovered) nextSlide();
    }, autoSlideInterval);
    return () => clearInterval(slideInterval);
  });
  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className="flex gap-5 size-full items-center justify-center max-w-[1920px] max-h-[1080px] group relative backdrop-blur-md bg-black bg-opacity-25 rounded-2xl overflow-clip duration-700"
    >
      <Image
        key={`Slide Image_${currentIndex}_${uuidv4()}`}
        src={slides[currentIndex]}
        width={1000}
        height={700}
        title={slides[currentIndex]}
        alt={`Slide Image ${currentIndex}`}
        className={`... size-full rounded-2xl object-cover object-center ${
          !appearClass ? " " : "showUp_animate2 "
        }`}
      />

      <div
        title="Prev"
        onClick={prevSlide}
        onMouseEnter={() => {
          setButtonHovered(true);
        }}
        onMouseLeave={() => {
          setButtonHovered(false);
        }}
        className="size-5 md:size-10 p-6 text-xl md:text-3xl cursor-pointer bg-white  bg-opacity-30 md:opacity-60 flex group-hover:flex group-hover:opacity-90 opacity-10 md:hidden  items-center justify-center rounded-full  absolute translate-y-[50%] left-2  hover:size-8 hover:text-xl hover:bg-opacity-90 hover:opacity-100"
      >
        <FontAwesomeIcon title="Prev" icon={faAngleLeft} className="" />
      </div>
      <div
        title="Next"
        onClick={nextSlide}
        onMouseEnter={() => {
          setButtonHovered(true);
        }}
        onMouseLeave={() => {
          setButtonHovered(false);
        }}
        className="size-5 md:size-10 p-6 text-xl md:text-3xl cursor-pointer translate-y-[50%] bg-white bg-opacity-30 md:opacity-60 flex group-hover:flex group-hover:opacity-90 opacity-10 md:hidden right-2 hover:opacity-100  items-center justify-center rounded-full hover:size-8 hover:text-xl hover:bg-opacity-90 absolute"
      >
        <FontAwesomeIcon title="Next" icon={faAngleRight} className="" />
      </div>
    </div>
  );
};

export default Carousel;
