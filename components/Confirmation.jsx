'use client'
import React, { useState, useEffect } from 'react';

const ConfirmationMessage = ({ message, className }) => {
  const [loadingText, setLoadingText] = useState(message);
  const [addingDots, setAddingDots] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingText((prevText) => {
        const dotCount = (prevText.match(/\./g) || []).length; // Count the number of dots
        if (dotCount < 3 && addingDots) {
          return prevText + '.';
        } else if (dotCount > 1 && !addingDots) {
          // Remove the last character
          return prevText.slice(0, -1);
        } else {
          // Change the state to switch between adding and removing dots
          setAddingDots(!addingDots);
          return prevText;
        }
      });
    }, 500);

    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, [addingDots]); // Run effect when addingDots changes

  return (
    <h2 className={`text-base sm:text-xl text-white font-semibold w-24 sm:w-36 md:w-52 ${className}`}>
      {loadingText}
    </h2>
  );
};

export default ConfirmationMessage;
