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

  const prevSlide = () => {
    const firstSlide = currentIndex == 0;
    setCurrentIndex((prev) => (firstSlide ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    const lastSlide = currentIndex == slides.length - 1;
    setCurrentIndex((prev) => (lastSlide ? 0 : prev + 1));
  };
  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(slideInterval);
  });
  return (
    <div className="flex gap-5 size-full items-center justify-center max-w-[1920px] max-h-[1080px] relative bg-black bg-opacity-25 rounded-2xl overflow-clip duration-700 zoom-in">
      {/* <Zoom in={true}>
       </Zoom> */}
      <Image
        loading="eager"
        key={`Slide Image_${currentIndex}_${uuidv4()}`}
        src={slides[currentIndex]}
        width={1000}
        height={700}
        title={slides[currentIndex]}
        alt={`Slide Image ${currentIndex}`}
        className={`... size-full rounded-2xl object-cover object-center showUp_animate2`}
      />

      <div
        title="Prev"
        onClick={prevSlide}
        className="size-10 p-6 cursor-pointer bg-white flex items-center justify-center rounded-full text-3xl absolute top-[50%] left-2  hover:size-8 hover:text-xl  hover:opacity-75"
      >
        <FontAwesomeIcon title="Prev" icon={faAngleLeft} className="" />
      </div>
      <div
        title="Next"
        onClick={nextSlide}
        className="size-10 p-6 cursor-pointer top-[50%] bg-white  right-2 hover:opacity-75 flex items-center justify-center rounded-full hover:size-8 hover:text-xl text-3xl absolute"
      >
        <FontAwesomeIcon title="Next" icon={faAngleRight} className="" />
      </div>
    </div>
  );
};

export default Carousel;
