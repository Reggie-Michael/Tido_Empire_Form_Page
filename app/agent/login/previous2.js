"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import Loading from "@/app/loading";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  // const [passToken, setPassToken] = useState("");
  const nameMinLength = 2;
  const nameMaxLength = 15;
  const companyNameMinLength = 4;
  const companyNameMaxLength = 35;
  const numberMinLength = 7;
  const numberMaxLength = 25;
  const [isLoading, setIsLoading] = useState(true);
  const [inputValues, setInputValues] = useState({
    fName: "",
    lName: "",
    companyName: "",
    email: "",
    pNumber: "",
    image: "",
    cacNo: "",
    address: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [agency, setAgency] = useState("individual");
  const [readyForVerification, setReadyForVerification] = useState({
    fName: false,
    lName: false,
    companyName: false,
    email: false,
    pNumber: false,
    image: false,
    cacNo: false,
    address: false,
  });
  const [error, setError] = useState({
    errorState: false,
    invalidAgency: false,
    // case of already existing email but using different name or data
    invalidInput: {
      state: false,
      type: "",
    },
    agencyNull: false,
    inputNull: {
      state: false,
      type: "",
    },
    // keyAbsent: false,
    // for when email verification code is expired or wrong
    inValidVerification: {
      state: false,
      type: "",
      tries: 0,
      maxTries: 3,
    },
    minMaxInvalid: {
      state: false,
      type: "",
    },
    validateError: {
      state: false,
      type: "",
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();

  const agentMode = searchParams.get("agency");
  const errorStatus = searchParams.get("errorStatus");

  const errorMessage = () => {
    const errors = [];
    if (error.errorState) {
      if (error.invalidAgency) {
        errors.push("The Agency is not valid. Please select valid Agency");
      }
      if (error.invalidInput.state) {
        const invalidInput = error.invalidInput.type;
        if (invalidInput === "companyExist")
          errors.push(
            "Company Name Already Exist, Please Try again or contact Tido Empire if you forgot Account Details"
          );
        if (invalidInput === "emailExist")
          error.push(
            "Email Already Exist, Please Contact Tido Empire if you forgot Account Details"
          );
        if (invalidInput === "pNumberExist")
          errors.push(
            "An Account registered with this Phone Number Already Exist, Please contact Tido Empire if you forgot Account Details"
          );
        if (invalidInput === "cacNoExist")
          errors.push(
            "Company saved with this CaC Already Exist, Please contact Tido Empire If you forgot Account Details or other issues"
          );
      }
      if (error.agencyNull) {
        errors.push("The Agency cannot be null! Please select an agency.");
      }
      if (error.inputNull.state) {
        const inputNull = error.inputNull.type;
        const nameValue = agency === "company" ? "Company" : "First";
        if (inputNull === "fNameNull")
          errors.push(
            `${nameValue} Name cannot be null! Please Input ${nameValue} name.`
          );
        if (inputNull === "lNameNull")
          errors.push("Last Name cannot be null! Please input Last name");
        if (inputNull === "emailNull")
          errors.push("Email cannot be null! Please input email");
        if (inputNull === "pNumberNull")
          errors.push("Phone Number cannot be null! Please input Phone Number");
        if (inputNull === "cacNoNull")
          errors.push(
            "Company CaC Number cannot be null! Please input CaC number"
          );
        if (inputNull === "addressNull")
          errors.push("Company Address cannot be null! Please input Address");
        if (inputNull === "imageNull")
          errors.push(
            `${
              agency == "company" ? "Company Logo" : "Agent Image"
            } cannot be null! Please input image`
          );
      }
      if (error.inValidVerification.state) {
        const inValidVerification = error.inValidVerification.type;
        if (inValidVerification === "emailCodeFalse")
          errors.push(
            "The Email Verification Code you inputted is wrong! Check your Email and Try again. "
          );
        if (inValidVerification === "emailCodeExpired")
          errors.push(
            "The Email Verification code is expired. Please try again"
          );
      }
      if (error.validateError.state) {
        const validateError = error.validateError.type;
        if (validateError == "fNameValidateError")
          errors.push("First Name must contain only letters.");
        if (validateError == "lNameValidateError")
          errors.push("Last Name must contain only letters.");
        if (validateError == "emailValidateError")
          errors.push("Email must be a valid email type.");
        if (validateError == "pNumberValidateError")
          errors.push("Phone Number must be a valid Phone Number.");
        if (validateError == "cacNoValidateError")
          errors.push("Company CaC Number must be a valid CaC Number.");
        if (validateError == "addressValidateError")
          errors.push(
            "Address  should only contain Alphanumeric Letter (spaces, +, - and @ are permitted)."
          );
        if (validateError == "imageValidateError")
          errors.push(
            `${
              agency == "company" ? "Company Logo" : "Agent Image"
            } must be a Valid Image and format must be either Jpeg, Jpeg or Png`
          );
      }
      if (error.minMaxInvalid.state) {
        const minMaxInvalid = error.minMaxInvalid.type;
        if (minMaxInvalid == "fNameVoidCharLength")
          errors.push(
            `First Name must be between ${nameMinLength} and ${nameMaxLength}.`
          );
        if (minMaxInvalid == "lNameVoidCharLength")
          errors.push(
            `Last Name must be between ${nameMinLength} and ${nameMaxLength}.`
          );
        // if(minMaxInvalid == "emailVoidCharLength")errors.push"Email must be a valid email type."
        if (minMaxInvalid == "pNumberVoidCharLength")
          errors.push(
            `Phone Number must be between ${numberMinLength} and ${numberMaxLength}`
          );
        if (minMaxInvalid == "cacNoVoidCharLength")
          errors.push(
            `Company CaC Number must be between ${numberMinLength} and ${numberMaxLength}`
          );
        // if(minMaxInvalid == "addressVoidCharLength")errors.push"Address  should only contain Alphanumeric Letter (spaces, +, - and @ are permitted)."
        if (minMaxInvalid == "imageTooLarge")
          errors.push(`Image is too Large! Max image size is 5MB`);

      }
      // errors.push("Please try again later");
    }
    return errors; // Return errors
  };

  const setErrorStatus = (val) => {
    console.log("From setErrorStatus: ", typeof val);
    console.log("From setErrorStatus: ", val);
    if (typeof val == "string") {
      setError((prev) => ({
        ...prev, // Spread the previous state
        errorState: true, // Set common error state to true
        // Set specific error based on val
        invalidAgency: val === "invalidAgency",
        agencyNull: val === "agencyNull",
      }));
    } else if (typeof val === "object" && val !== null) {
      const errorType = val?.error;
    console.log("From setErrorStatus: ErrorType", errorType);

        setError((prev) => ({
          ...prev, // Spread the previous state
          errorState: true, // Set common error state to true
          // Set specific error based on val
          [errorType]: {
            state: true,
            type: val?.type,
          },
        }));
    }
  };

  const handleInputChange = (e, val) => {
    const value = e.target.value;
    readyForVerification.val !== true &&
      setReadyForVerification((prev) => ({
        ...prev,
        [val]: true,
      }));
    setInputValues((prev) => ({
      ...prev,
      [val]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Clears image preview and input value on change
    setImagePreview(null);
    setInputValues((prev) => ({
      ...prev,
      image: null,
    }));

    // Perform validation checks
    const validationMessage = validateImage(file);
    if (validationMessage !== "passImageCheck") {
      setError(validationMessage);
      return;
    }

    // If all validation checks pass, set the selected file and display image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setInputValues((prev) => ({
      ...prev,
      image: file,
    }));

    return;
  };
  const isValidExpression = (name, regex) => regex.test(name);
  const isWithinLengthRange = (str, minLength, maxLength) =>
    str.length >= minLength && str.length <= maxLength;

  const validateName = (firstName, lastNamePresent, lastName) => {
    const minLength =
      agency === "company" ? companyNameMinLength : nameMinLength;
    const maxLength =
      agency === "company" ? companyNameMaxLength : nameMaxLength;
    const nameRegex = /^[a-zA-Z ]+$/;

    let message = null;

    if (!firstName) {
      message = { error: "inputNull", type: "fNameNull" };
    } else if (!isValidExpression(firstName, nameRegex)) {
      message = { error: "validateError", type: "fNameValidateError" };
    } else if (!isWithinLengthRange(firstName, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "fNameVoidCharLength" };
    }

    if (lastNamePresent && !lastName) {
      message = { error: "inputNull", type: "lNameNull" };
    } else if (lastNamePresent && !isValidExpression(lastName, nameRegex)) {
      message = { error: "validateError", type: "lNameValidateError" };
    } else if (
      lastNamePresent &&
      !isWithinLengthRange(lastName, minLength, maxLength)
    ) {
      message = { error: "minMaxInvalid", type: "lNameVoidCharLength" };
    }

    return message ? message : "passNameCheck";
  };

  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return { error: "inputNull", type: "emailNull" };
    } else if (!isValidExpression(email, emailRegex)) {
      return { error: "validateError", type: "emailValidateError" };
    }

    return "passMailCheck";
  };

  const validateNumbers = (phoneNumber, cacNo, cacNoPresent) => {
    const minLength = numberMinLength;
    const maxLength = numberMaxLength;
    const numberRegex = /^[0-9\+\-\ ]+$/;
    const cacNoRegex = /^[0-9 ]+$/;

    console.log(typeof phoneNumber)
    let message = null;

    if (!phoneNumber) {
      message = { error: "inputNull", type: "pNumberNull" };
    } else if (!isValidExpression(phoneNumber, numberRegex)) {
      message = { error: "validateError", type: "pNumberValidateError" };
    } else if (!isWithinLengthRange(phoneNumber, minLength, maxLength)) {
      message = { error: "minMaxInvalid", type: "pNumberVoidCharLength" };
    }

    if (cacNoPresent && !cacNo) {
      message = { error: "inputNull", type: "cacNoNull" };
    } else if (cacNoPresent && !isValidExpression(cacNo, cacNoRegex)) {
      message = { error: "validateError", type: "cacNoValidateError" };
    } else if (
      cacNoPresent &&
      !isWithinLengthRange(cacNo, minLength, maxLength)
    ) {
      message = { error: "minMaxInvalid", type: "cacNoVoidCharLength" };
    }

    return message ? message : "passNumbersCheck";
  };

  const validateAddress = (address) => {
    const addressRegex = /^[a-zA-Z0-9\+\-\@ ]+$/;

    if (!address) {
      return { error: "inputNull", type: "addressNull" };
    } else if (!isValidExpression(address, addressRegex)) {
      return { error: "validateError", type: "addressValidateError" };
    }

    return "passAddressCheck";
  };

  const validateImage = (image) => {
    if (image) {
      const allowedImageTypes = ["jpg", "jpeg", "png"];

      const isAllowedImageType = (file) => {
        const fileType = file.type.toLowerCase();
        const fileExtension = fileType.split("/")[1];
        return allowedImageTypes.includes(fileExtension);
      };

      // Check file type
      if (!image.type.startsWith("image") && !isAllowedImageType(image)) {
        // setError((prev) => ({
        //   ...prev,
        //   validateError: {
        //     state: true,
        //     type: "imageValidateError",
        //   },
        // }));
        const message = { error: "validateError", type: "imageValidateError" };
        return message;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        // setError((prev) => ({
        //   ...prev,
        //   minMaxInvalid: {
        //     state: true,
        //     type: "",
        //   },
        // }));
        const message = { error: "minMaxInvalid", type: "imageTooLarge" };
        return message;
      }

      // Optionally check image dimensions
      // For example, check if width and height are at least 100 pixels
      // const img = new Image();
      // img.onload = () => {
      //   if (img.width < 100 || img.height < 100) {
      //     setError("Image dimensions must be at least 100x100 pixels.");
      //     return;
      //   }
      // };
      // img.src = URL.createObjectURL(file);
    } else {
      const message = { error: "minMaxInvalid", type: "imageTooLarge" };
      return message;
    }
    return "passImageCheck";
  };

  const validateInputs = useCallback(() => {
    let allInputsValid = true;
    console.log("From validationCallback: Starting Validation")

    // Check if agency is missing or invalid
    if (!agency || (agency !== "individual" && agency !== "company")) {
      setError((prev) => ({
        ...prev,
        errorState: true,
        invalidAgency: true,
      }));
      allInputsValid = false;
    }

    // Validate based on agency type

    console.log("From validationCallback: Starting Name Validation")
    
    if (agency === "company") {
      console.log("From validationCallback: Agency is Company")
      if (readyForVerification.companyName) {
        console.log("From validationCallback: company Name is ready for validation")
        const validateMessage = validateName(inputValues.companyName, false);
        console.log("Form validation callback: ", validateMessage)
        if (validateMessage !== "passNameCheck") {
          setErrorStatus(validateMessage);
          allInputsValid = false;
        }
      }
    } else {
      console.log("From validationCallback: Agency is not Company")

      if (readyForVerification.fName && readyForVerification.lName) {
        console.log("From validationCallback: First Name and Last Name is ready for validation")

        const validateMessage = validateName(
          inputValues.fName,
          true,
          inputValues.lName
          );
          console.log("Form validation callback: ", validateMessage)
        if (validateMessage !== "passNameCheck") {
          setErrorStatus(validateMessage);
          allInputsValid = false;
        }
      }
    }

    // Validate email
    if (readyForVerification.email) {
      const emailValidationMessage = validateEmail(inputValues.email);
      if (emailValidationMessage !== "passMailCheck") {
        setErrorStatus(emailValidationMessage);
        allInputsValid = false;
      }
    }

    // Validate phone number and CAC number
    if (agency === "company") {
      console.log("From validationCallback: Agency is Company")
      if (readyForVerification.pNumber &&
        readyForVerification.cacNo) {
        console.log("From validationCallback: Company Number and Cac is ready for validation")
        const numbersValidationMessage = validateNumbers(
          inputValues.pNumber,
          inputValues.cacNo,
          true
        );
        if (numbersValidationMessage !== "passNumbersCheck") {
          setErrorStatus(numbersValidationMessage);
          allInputsValid = false;
        }
      }
    } else {
      console.log("From validationCallback: Agency is not Company")

      if (readyForVerification.pNumber) {
        console.log("From validationCallback: Phone Number is ready for validation")

        const numbersValidationMessage = validateNumbers(
          inputValues.pNumber,
          inputValues.cacNo,
          agency === "company"
        );
        if (numbersValidationMessage !== "passNumbersCheck") {
          setErrorStatus(numbersValidationMessage);
          allInputsValid = false;
        }
      }
    }
   
    // Validate address
    if (readyForVerification.address) {
      const addressValidationMessage = validateAddress(inputValues.address);
      if (addressValidationMessage !== "passAddressCheck") {
        setErrorStatus(addressValidationMessage);
        allInputsValid = false;
      }
    }

    // Clear any previous error state if all validations pass
    if (allInputsValid) {
      setError((prev) => ({
        ...prev,
        errorState: false,
        invalidAgency: false,
        inputNull: {
          state: false,
          type: "",
        },
        minMaxInvalid: {
          state: false,
          type: "",
        },
        validateError: {
          state: false,
          type: "",
        },
      }));
    }

    return allInputsValid;
  }, [agency, inputValues, readyForVerification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("clicked", key);
    try {
      console.log(validateKey());
      if (!validateKey()) return;
      const response = await fetch("/api/auth/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, agency }),
      });

      console.log(response);

      // setKey("")
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // Key is valid, redirect to login page with token
        router.push(`/agent/login`);
      } else {
        // Key is invalid, handle accordingly (e.g., show error message)
        if (response.status == 400) {
          // alert("Forbidden route you will be redirected soon");
          setErrorStatus(data.errorType);
          console.log(error);
        }
        console.error(data.error);
      }
    } catch (error) {
      console.error("An error occurred", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (e) => {
    const selectedValue = e.target.value;
    // console.log(selectedValue);
    setAgency(selectedValue);

    // Perform any other actions based on the selected value if needed
    // ...
  };

  useEffect(() => {
    // Simulate fetching data
    console.log("mounted");
    setTimeout(() => {
      // Once data is loaded, update loading state
      setIsLoading(false);
    }, 1000); // Simulated delay of 2 seconds
  }, []);

  useEffect(() => {
    // Validation when key, agency, minimumLength, or maximumLength changes
    console.log("From validate useEffect: ", readyForVerification);
    validateInputs();

    console.log(error);
    // Cleanup function to clear error state
    return () => {
      setError((prev) => ({
        ...prev,
        errorState: false,
        invalidAgency: false,
        agencyNull: false,
        inputNull: {
          state: false,
          type: "",
        },
        minMaxInvalid: {
          state: false,
          type: "",
        },
        validateError: {
          state: false,
          type: "",
        },
      }));
    };
  }, [validateInputs]);

  useEffect(() => {
    if (agentMode === "individual" || agentMode === "company") {
      setAgency(agentMode);
    }
    if (errorStatus) {
      setErrorStatus(errorStatus);
    }
    router.push("/agent/login");
  }, [agentMode, errorStatus]);

  useEffect(() => {
    if (agency === "individual" || agency === "company") {
      // Clear the error state
      setError((prev) => ({
        ...prev,
        errorState: false,
        agencyNull: false,
      }));
      console.log(error);
    }
  }, [agency]);

  const vowels = ["a", "e", "i", "o", "u"];
  return (
    <div className="w-full">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col h-dvh w-full items-center  gap-5">
          <Navbar className="text-black" />
          <div className="flex flex-col items-center text-center gap-3 mt-20">
            <h4 className="text-2xl leading-3 font-medium">Welcome To </h4>
            <h1 className="text-7xl leading-7 text-blue-700 font-bold">
              Sales Agent SignUp
            </h1>
            {/* <span className="text-2xl leading-3 font-medium">Tab</span> */}
          </div>
          <form className="flex flex-col gap-10 w-2/3" onSubmit={handleSubmit}>
            <div className="text-center text-xl font-medium">
              {agency === "company" || agency === "individual" ? (
                <h3 className="capitalize">
                  Signup as {vowels.includes(agency.slice(0, 1)) ? "an" : "a"}{" "}
                  {agency}
                </h3>
              ) : agency === "" ? (
                <p>Please select an Agency</p>
              ) : (
                <p>Please select a valid Agency</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row w-full h-24 sm:h-16 gap-7 justify-between">
              {agency == "company" ? (
                <Input
                  // label="Company Name"
                  type="text"
                  placeholder="Company Name"
                  min={"me"}
                  value={inputValues.companyName}
                  onChange={(e) => {
                    const val = "companyName";
                    handleInputChange(e, val);
                  }}
                  className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                />
              ) : (
                <>
                  <Input
                    // label="First Name"
                    type="text"
                    placeholder="First Name"
                    min={"me"}
                    value={inputValues.fName}
                    onChange={(e) => {
                      const val = "fName";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                  <Input
                    // label="Last Name"
                    type="text"
                    placeholder="Last Name"
                    min={"me"}
                    value={inputValues.lName}
                    onChange={(e) => {
                      const val = "lName";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row w-full h-24 sm:h-16 gap-7 justify-between">
              {agency == "company" ? (
                <>
                  <Input
                    // label="Company Name"
                    type="email"
                    placeholder="Company Email"
                    min={"me"}
                    value={inputValues.email}
                    onChange={(e) => {
                      const val = "email";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                  <Input
                    // label="Last Name"
                    type="number"
                    placeholder="Company Contact"
                    min={"me"}
                    value={inputValues.pNumber}
                    onChange={(e) => {
                      const val = "pNumber";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                </>
              ) : (
                <>
                  <Input
                    // label="First Name"
                    type="email"
                    placeholder="Email"
                    min={"me"}
                    value={inputValues.email}
                    onChange={(e) => {
                      const val = "email";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                  <Input
                    // label="Last Name"
                    type="number"
                    placeholder="Phone Number"
                    min={"me"}
                    value={inputValues.pNumber}
                    onChange={(e) => {
                      const val = "pNumber";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row w-full h-24 sm:h-16 gap-7 justify-between">
              {agency == "company" ? (
                <>
                  <Input
                    // label="Company Name"
                    type="text"
                    placeholder="Company Address"
                    min={"me"}
                    value={inputValues.address}
                    onChange={(e) => {
                      const val = "address";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                  <Input
                    // label="Last Name"
                    type="number"
                    placeholder="Company CAC"
                    min={"me"}
                    value={inputValues.cacNo}
                    onChange={(e) => {
                      const val = "cacNo";
                      handleInputChange(e, val);
                    }}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                </>
              ) : (
                <>
                  <Input
                    // label="First Name"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg"
                    placeholder="Profile Image"
                    max={1}
                    // value={inputValues.image}
                    onChange={handleFileChange}
                    className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                  />
                </>
              )}
            </div>
            {agency == "company" && (
              <div className="flex flex-col sm:flex-row w-full h-24 sm:h-16 gap-7 justify-between">
                <Input
                  // label="First Name"
                  type="file"
                  accept="image/jpg, image/png, image/jpeg"
                  placeholder="Company Logo"
                  max={1}
                  // value={inputValues.image}
                  onChange={handleFileChange}
                  className="bg-blue-400/50 h-full opacity-80 border-3 border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px]"
                />
              </div>
            )}

            {/* Display the preview image */}
            {imagePreview && (
              <div className="w-[150px] aspect-square shadow-md shadow-blue-400 -mt-4  flex ">
                <Image
                  src={imagePreview}
                  width={100}
                  height={100}
                  alt="Preview"
                  className="size-full object-top object-cover"
                />
              </div>
            )}
            {error.errorState && (
              <div className="error-container flex flex-col gap-5 max-h-[400px] overflow-y-hidden">
                {errorMessage().map((message, index) => (
                  <div
                    key={`ValidationError_${index}`}
                    className="flex gap-2 items-center justify-center text-red-700 font-medium text-xl"
                  >
                    <div className="size-2 p-4 rounded-full bg-gray-500/30 flex items-center justify-center">
                      <FontAwesomeIcon icon={faInfo} />
                    </div>
                    <p className="w-fit"> {message}</p>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="submit"
              className={`bg-blue-700 border-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 `}
              onClick={handleSubmit}
              // title={!validateKey() && "Ca"}
              disabled={!agency || error.errorState}
              loading={submitting}
            >
              Submit Key
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}


