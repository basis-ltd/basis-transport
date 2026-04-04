/*
  keyText: string;
  valueText: string;
  className?: string;
*/

import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { SkeletonLoader } from "./Loader";
import { ReactNode, isValidElement } from "react";
import { capitalizeString, formatDate } from "@/helpers/strings.helper";

interface KeyValuePairProps {
  keyText: string;
  valueText?: string | boolean | number | ReactNode;
  className?: string;
  isLoading?: boolean;
}

/**
 * @param keyText - The text to display as the key
 * @param valueText - The text to display as the value
 * @param className - The className to apply to the component
 * @returns A component that displays a key-value pair
 */
export const KeyValuePair = ({
  keyText,
  valueText,
  className,
  isLoading,
}: KeyValuePairProps) => {
  const baseClassName =
    "flex flex-col sm:flex-row items-start sm:items-start w-full gap-1 sm:gap-3 bg-gray-50 p-1 sm:p-2 rounded-md text-[12px] sm:text-sm";

  if (isLoading) {
    return (
      <p className={`${baseClassName} ${className}`}>
        <SkeletonLoader />
      </p>
    );
  }

  const unSupportedKeys = [
    "object",
    "array",
    "null",
    "undefined",
    "id",
    "Id",
    "rraReferenceKey",
    "version",
    "createdAt",
    "updatedAt",
    "state",
    "createdById",
    'lastUpdatedById',
  ];

  if (
    (["object", "array"].includes(typeof valueText) &&
      !isValidElement(valueText)) ||
    unSupportedKeys.includes(keyText) ||
    [
      null,
      undefined,
      "null",
      "undefined",
      "id",
      "Id",
      "rraReferenceKey",
      "version",
      "createdAt",
      "updatedAt",
      "state",
      ...unSupportedKeys,
    ].includes(keyText)
  )
    return null;

  const dateKeys = [
    "persDocIssueDate",
    "persDocExpiryDate",
    "dateOfBirth",
    "dateOfIncorporation",
  ];

  if ([...dateKeys].includes(keyText)) {
    return (
      <p className={`${baseClassName} ${className}`}>
        <span className="w-full text-gray-600 text-sm">
          {capitalizeString(keyText)}:
        </span>
        <span className="font-normal text-[12px] sm:text-[12px] text-primary w-full">
          {formatDate(new Date(valueText as string), "DD/MM/YYYY")}
        </span>
      </p>
    );
  }

  const countryKeys = [
    "nationality",
    "persDocIssuePlace",
    "personDocIssuePlace",
  ];

  if ([...countryKeys].includes(keyText)) {
    return (
      <p className={`${baseClassName} ${className}`}>
        <span className="w-full text-gray-600 text-sm">
          {capitalizeString(keyText)}:
        </span>
        <span className="font-normal text-[12px] sm:text-[12px] text-primary w-full">
          {valueText}
        </span>
      </p>
    );
  }

  if (["boolean"].includes(typeof valueText)) {
    return (
      <p className={`${baseClassName} ${className}`}>
        <span className="w-full text-gray-600 text-sm">
          {capitalizeString(keyText)}:
        </span>
        <span className="font-normal text-[12px] sm:text-[12px] text-primary w-full">
          {valueText ? "Yes" : "No"}{" "}
          <FontAwesomeIcon
            icon={valueText ? faCircleCheck : faXmark}
            className={valueText ? "text-green-700" : "text-red-700"}
          />
        </span>
      </p>
    );
  }

  return (
    <p className={`${baseClassName} ${className}`}>
      <span className="w-full text-gray-600 text-sm">
        {capitalizeString(keyText)}:
      </span>
      <span className="font-normal text-[12px] sm:text-[12px] text-primary w-full">
        {valueText}
      </span>
    </p>
  );
};
