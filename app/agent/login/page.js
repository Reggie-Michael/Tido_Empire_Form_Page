"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import Loading from "@/app/loading";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationMessage from "@/components/Confirmation";

export default function Login() {
  const router = useRouter();
  // const [passToken, setPassToken] = useState("");
  const nameMinLength = 2;
  const nameMaxLength = 20;
  const companyNameMinLength = 4;
  const companyNameMaxLength = 70;
  const numberMinLength = 7;
  const numberMaxLength = 25;
  const [isLoading, setIsLoading] = useState(true);
  const [passToken, setPassToken] = useState({
    keyId: "",
    keyType: "",
  });
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
    maxTriesOverlapped: false,
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
  const [responseGotten, setResponseGotten] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();

  const agentMode = searchParams.get("agency");
  const passKeyToken = searchParams.get("OiD");
  const errorStatus = searchParams.get("errorStatus");
  const dataFetchedRef = useRef(false);

  const verifyAccess = useCallback(async () => {
    try {
      const url = `/api/auth/agent_key`;

      const handleError = (status, data) => {
        if (status === 400) {
          router.push(`/access?errorStatus=${data.errorType}`);
        } else if (status === 401) {
          if (data.errorType === "authorizationHeaderMissing") {
            warn("An Unexpected Error Occurred, Please Try again Later.");
            setTimeout(() => router.push(`/access`), 500);
          }
          router.push(`/access?errorStatus=${data.errorType}`);
        } else if (status === 403) {
          // Handle 403 error if needed
        } else if (status === 405) {
          warn("Method not allowed");
          router.push(`/access`);
        } else if (status === 500) {
          warn("An Unexpected Error Occurred, Please Try again Later.");
          setTimeout(() => router.push(`/access`), 500);
        }
      };

      const passKey = JSON.parse(sessionStorage.getItem("passKey"));
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${passKey}`,
          "Content-Type": "application/json", // Optionally include other headers if needed
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          setPassToken((prevToken) => ({
            ...prevToken,
            keyId: data.key,
            keyType: data.type,
          }));
        }
      } else {
        // Handle other HTTP errors
        handleError(response.status, data);
      }
    } catch (error) {
    } finally {
      setResponseGotten(true);
    }
  }, [router]);

  const notify = (val) =>
    toast.success(
      val || (
        <>
          Successfully Submitted Form <br /> Thank you
        </>
      ),
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        className: "text-lg break-all w-[400px]",
        //  transition: Bounce,
      }
    );

  const warn = (val) =>
    toast.error(val, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      className: "text-lg break-all  w-[400px]",
      //  transition: Bounce,
    });

  const errorMessage = () => {
    const errors = [];
    if (error.errorState) {
      if (error.invalidAgency) {
        errors.push("The Agency is not valid. Please select valid Agency");
      }
      if (error.maxTriesOverlapped) {
        errors.push(
          "Number of Allocated Tries in 30 minutes overlapped. Try again in 30 minutes."
        );
      }
      if (error.invalidInput.state) {
        const invalidInput = error.invalidInput.type;
        if (invalidInput === "nameExist")
          errors.push(
            "Agent Name Already Exist, Please Try again or contact Tido Empire if you forgot Account Details"
          );
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
        if (readyForVerification.lName && inputNull === "lNameNull")
          errors.push("Last Name cannot be null! Please input Last name");
        if (readyForVerification.email && inputNull === "emailNull")
          errors.push("Email cannot be null! Please input email");
        if (readyForVerification.pNumber && inputNull === "pNumberNull")
          errors.push("Phone Number cannot be null! Please input Phone Number");
        if (readyForVerification.cacNo && inputNull === "cacNoNull")
          errors.push(
            "Company CaC Number cannot be null! Please input CaC number"
          );
        if (readyForVerification.address && inputNull === "addressNull")
          errors.push("Company Address cannot be null! Please input Address");
        if (readyForVerification.image && inputNull === "imageNull")
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
        const nameValue = agency === "company" ? "Company" : "First";

        if (validateError == "fNameValidateError")
          errors.push(`${nameValue} Name must contain only letters.`);
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
        const nameValue = agency === "company" ? "Company" : "First";
        if (minMaxInvalid == "fNameVoidCharLength")
          errors.push(
            `${nameValue} Name must be between ${
              agency === "company" ? companyNameMinLength : nameMinLength
            } and ${
              agency === "company" ? companyNameMaxLength : nameMaxLength
            }.`
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
          const message = {
            error: "validateError",
            type: "imageValidateError",
          };
          return message;
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (image.size > maxSize) {
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
        const message = { error: "inputNull", type: "imageNull" };
        setImagePreview(null);
        return message;
      }
      return "passImageCheck";
    };
    const file = e.target.files[0];
    // Clears image preview and input value on change
    setImagePreview(null);
    // setInputValues((prev) => ({
    //   ...prev,
    //   image: null,
    // }));
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
    readyForVerification.image !== true &&
      setReadyForVerification((prev) => ({
        ...prev,
        image: true,
      }));

    // Perform validation checks
    const validationMessage = validateImage(file);
    if (validationMessage !== "passImageCheck") {
      setErrorStatus(validationMessage);
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

  const validateInputs = useCallback(() => {
    const validateMainName = (name) => {
      const minLength =
        agency === "company" ? companyNameMinLength : nameMinLength;
      const maxLength =
        agency === "company" ? companyNameMaxLength : nameMaxLength;
      const nameRegex = /^[a-zA-Z ]+$/;

      let message = null;

      if (!name) {
        message = { error: "inputNull", type: "fNameNull" };
      } else if (!isValidExpression(name, nameRegex)) {
        message = { error: "validateError", type: "fNameValidateError" };
      } else if (!isWithinLengthRange(name, minLength, maxLength)) {
        message = { error: "minMaxInvalid", type: "fNameVoidCharLength" };
      }

      return message ? message : "passFNameCheck";
    };
    const validateOtherName = (name) => {
      const minLength = nameMinLength;
      const maxLength = nameMaxLength;
      const nameRegex = /^[a-zA-Z ]+$/;

      let message = null;
      if (agency !== "company") {
        if (!name) {
          message = { error: "inputNull", type: "lNameNull" };
        } else if (!isValidExpression(name, nameRegex)) {
          message = { error: "validateError", type: "lNameValidateError" };
        } else if (!isWithinLengthRange(name, minLength, maxLength)) {
          message = { error: "minMaxInvalid", type: "lNameVoidCharLength" };
        }
      }

      return message ? message : "passLNameCheck";
    };
    const validateEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

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
          const message = {
            error: "validateError",
            type: "imageValidateError",
          };
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
        const message = { error: "inputNull", type: "imageNull" };
        setImagePreview(null);
        return message;
      }
      return "passImageCheck";
    };
    let allInputsValid = true;

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

    if (readyForVerification.companyName || readyForVerification.fName) {
      const checkVal =
        agency === "company" ? inputValues.companyName : inputValues.fName;
      const validateMessage = validateMainName(checkVal);
      if (validateMessage !== "passFNameCheck") {
        setErrorStatus(validateMessage);
        allInputsValid = false;
      }
    }

    if (agency !== "company" && readyForVerification.lName) {
      const validateMessage = validateOtherName(inputValues.lName);
      if (validateMessage !== "passLNameCheck") {
        setErrorStatus(validateMessage);
        allInputsValid = false;
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
      if (readyForVerification.pNumber && readyForVerification.cacNo) {
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
      if (readyForVerification.pNumber) {
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

    if (readyForVerification.image) {
      const validationMessage = validateImage(inputValues.image);
      if (validationMessage !== "passImageCheck") {
        setErrorStatus(validationMessage);
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
    try {
      if (!validateInputs()) {
        const errorMessage = errorMessage();
        warn(errorMessage[0]);
        return;
      }
      // Create a new FormData object
      const formData = new FormData();

      // Iterate over the keys of the inputValues object
      Object.keys(inputValues).forEach((key) => {
        // Append each key-value pair to the FormData object
        formData.append(key, inputValues[key]);
      });
      formData.append("agency", agency);
      formData.append("passKeyData", JSON.stringify(passToken));
      try {
        // Set up headers

        // Send the FormData object to the backend
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {},
          body: formData,
        });

        const data = response.status !== 500 && (await response.json());

        // Handle the response from the backend
        if (response.ok) {
          if (data.success && data.status == "verified") {
            notify(
              "Sales Agent Account already Created. Redirecting to Sales Tab"
            );
            setTimeout(() => {
              router.push(`/agent?s=${data.success}&r=${data.ref}`);
            }, 1000);
          }
          if (data.success && data.status == "awaitingEmailVerification") {
            notify(
              "You will be redirected to where you will input verification soon"
            );
            setTimeout(() => {
              router.push("/agent/login/verify");
            }, 1000);
          }

          // Handle successful form submission
        } else {
          if (response.status == 400) {
            if (data.errorType === "invalidSubmission") {
              warn("Submission State not valid");
            } else {
              setErrorStatus(data.errorType);
            }
          }
          if (response.status == 403) {
            if (
              data.errorType === "keyAbsent" ||
              data.errorType === "keyNull2" ||
              data.errorType === "unauthorizedCreation"
            ) {
              router.push(`/access?errorStatus=${data.errorType}`);
            }
            setErrorStatus(data.errorType);
          }
          if (response.status == 500) {
            warn(
              "There was a problem on our side. Please Contact Tido Empire."
            );
          }
          // Handle errors
          const errorData = data.error;
          warn(errorData);
        }
      } catch (error) {
        // Handle network errors
        warn(
          "An error occurred, Please contact Tido Empire and try again later."
        );
      }
    } catch (error) {
      warn("Sorry, please contact Tido Empire and try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Simulate fetching data
    responseGotten && setIsLoading(false);
  }, [responseGotten]);

  useEffect(() => {
    passKeyToken &&
      sessionStorage.setItem("passKey", JSON.stringify(passKeyToken));
  }, [passKeyToken]);

  useEffect(() => {
    if (dataFetchedRef.current) return;

    let isMounted = true; // Flag to track component mounting

    if (isMounted) {
      dataFetchedRef.current = true;
    }
    const fetchData = async () => {
      try {
        await verifyAccess();
      } catch (error) {
        // Handle error here (e.g., display error message)

        warn("An unexpected error occurred! Refreshing...");
        setTimeout(() => router.push("/admin/generate"), 1000);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false; // Mark component as unmounted
    };
  }, [verifyAccess, router]);

  useEffect(() => {
    // Validation when key, agency, minimumLength, or maximumLength changes
    validateInputs();

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

  const switchAgency = () => {
    agency === "company" ? setAgency("individual") : setAgency("company");
    setInputValues({
      fName: "",
      lName: "",
      companyName: "",
      email: "",
      pNumber: "",
      image: "",
      cacNo: "",
      address: "",
    });
    setReadyForVerification({
      fName: false,
      lName: false,
      companyName: false,
      email: false,
      pNumber: false,
      image: false,
      cacNo: false,
      address: false,
    });
    setImagePreview(null);
  };

  useEffect(() => {
    if (agentMode === "individual" || agentMode === "company") {
      setAgency(agentMode);
    }
    if (errorStatus) {
      setErrorStatus(errorStatus);
    }
    router.push("/agent/login");
  }, [agentMode, errorStatus, router]);

  useEffect(() => {
    if (agency === "individual" || agency === "company") {
      // Clear the error state
      setError((prev) => ({
        ...prev,
        errorState: false,
        agencyNull: false,
      }));
    }
  }, [agency]);

  const getFieldsToWatch = (agency) => {
    if (agency === "company") {
      return ["companyName", "email", "pNumber", "image", "cacNo", "address"];
    } else {
      return ["fName", "lName", "email", "pNumber", "image"];
    }
  };

  const inputVoid = () => {
    const fieldsToWatch = getFieldsToWatch(agency);
    return fieldsToWatch.some((field) => {
      const value = inputValues[field];
      return (
        (typeof value === "string" && value.trim() === "") || value === null
      );
    });
  };

  const vowels = ["a", "e", "i", "o", "u"];
  const actionLink = () => {
    return (
      <Button
        title={
          agency === "company"
            ? "Sign up for sales agent as a Company"
            : "Sign up as for Tido Sales agent and an Single Agent"
        }
        onClick={(e) => {
          e.preventDefault();
          switchAgency();
        }}
        className=" w-full h-[40px] md:h-full flex items-center justify-center text-sm md:text-base font-semibold shadow-none bg-blue-600 sm:bg-transparent text-white   sm:text-black  hover:underline hover:underline-offset-4 hover:text-blue-700 hover:bg-transparent hover:opacity-80 "
      >
        {agency === "company" ? "Sign up as Individual" : "Sign up as Company"}
      </Button>
    );
  };
  return (
    <div className="w-full h-full relative">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col min:h-dvh w-full items-center  gap-5 animate__animated animate__zoomIn animate__faster relative">
          <Navbar className="text-black" actionLink={actionLink()} />
          <div className="flex flex-col items-center text-center gap-1 md:gap-3 mt-10  md:mt-20">
            <h4 className="text-xl md:text-2xl leading-3 font-medium">
              Welcome To{" "}
            </h4>
            <h1 className="text-3xl leading-10 md:leading-7 md:text-5xl lg:text-7xl text-blue-700 font-bold">
              Sales Agent SignUp
            </h1>
            {/* <span className="text-2xl leading-3 font-medium">Tab</span> */}
          </div>
          <form
            className="flex flex-col gap-10 w-2/3 mb-16"
            onSubmit={handleSubmit}
          >
            <div className="text-center text-base md:text-lg lg:text-xl font-medium">
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
            <div
              className={`flex flex-col sm:flex-row w-full ${
                agency == "company" ? "h-11" : "h-24"
              } sm:h-16 gap-7 justify-between`}
            >
              {agency == "company" ? (
                <Input
                  // label="Company Name"
                  type="text"
                  required
                  placeholder="Company Name"
                  min={"me"}
                  value={inputValues.companyName}
                  onChange={(e) => {
                    const val = "companyName";
                    handleInputChange(e, val);
                  }}
                  disabled={submitting}
                  className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              ) : (
                <>
                  <Input
                    // label="First Name"
                    type="text"
                    required
                    placeholder="First Name"
                    min={"me"}
                    value={inputValues.fName}
                    onChange={(e) => {
                      const val = "fName";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Input
                    // label="Last Name"
                    type="text"
                    required
                    placeholder="Last Name"
                    min={"me"}
                    value={inputValues.lName}
                    onChange={(e) => {
                      const val = "lName";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    required
                    placeholder="Company Email"
                    min={"me"}
                    value={inputValues.email}
                    onChange={(e) => {
                      const val = "email";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Input
                    // label="Last Name"
                    type="number"
                    required
                    placeholder="Company Contact"
                    min={"me"}
                    value={inputValues.pNumber}
                    onChange={(e) => {
                      const val = "pNumber";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </>
              ) : (
                <>
                  <Input
                    // label="First Name"
                    type="email"
                    required
                    placeholder="Email"
                    min={"me"}
                    value={inputValues.email}
                    onChange={(e) => {
                      const val = "email";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Input
                    // label="Last Name"
                    type="number"
                    required
                    placeholder="Phone Number"
                    min={"me"}
                    value={inputValues.pNumber}
                    onChange={(e) => {
                      const val = "pNumber";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    required
                    placeholder="Company Address"
                    min={"me"}
                    value={inputValues.address}
                    onChange={(e) => {
                      const val = "address";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Input
                    // label="Last Name"
                    type="number"
                    required
                    placeholder="Company CAC"
                    min={"me"}
                    value={inputValues.cacNo}
                    onChange={(e) => {
                      const val = "cacNo";
                      handleInputChange(e, val);
                    }}
                    disabled={submitting}
                    className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </>
              ) : (
                <>
                  <div className="flex-col w-full gap-3 h-fit flex">
                    <label
                      htmlFor="imageUpload"
                      className="text-sm md:text-base text-gray-800 font-medium"
                    >
                      Profile Image:
                    </label>
                    <Input
                      // label="Upload Profile Image"
                      type="file"
                      required
                      accept="image/jpg, image/png, image/jpeg"
                      placeholder="Profile Image"
                      max={1}
                      id="imageUpload"
                      // value={!inputValues.image && ''}
                      onChange={handleFileChange}
                      disabled={submitting}
                      className="bg-blue-400/70 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}
            </div>
            {agency == "company" && (
              <div className="flex flex-col w-full h-fit gap-3 justify-between -mt-3">
                <label
                  htmlFor="imageUpload"
                  className="text-sm md:text-base text-gray-800 font-medium h-fit"
                >
                  Company Logo:
                </label>

                <Input
                  // label="First Name"
                  type="file"
                  required
                  accept="image/jpg, image/png, image/jpeg"
                  placeholder="Company Logo"
                  max={1}
                  // value={inputValues.image}
                  onChange={handleFileChange}
                  disabled={submitting}
                  className="bg-blue-400/70 flex-1 h-full opacity-80 border-[1px] border-black border-opacity-60 rounded-md text-gray-800 hover:opacity-60 focus:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={
                !agency ||
                error.errorState ||
                inputVoid() ||
                submitting ||
                !responseGotten
              }
              loading={submitting}
            >
              Become an Agent
            </Button>
          </form>
        </div>
      )}
      <ToastContainer />
      {submitting && (
        <>
          <div className="w-full h-full fixed z-[999] flex items-center justify-center bg-black/70 top-0 left-0 gap-4">
            <div className="size-4 bg-transparent border-4 border-white border-r-0 border-l-0 border-t-0 rounded-xl box-content animate-spin"></div>
            <ConfirmationMessage
              className="w-96"
              message={"Creating Account..."}
            />
          </div>
        </>
      )}
    </div>
  );
}
