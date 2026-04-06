import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";
import { faCheckCircle, faCopy } from "@fortawesome/free-regular-svg-icons";

export interface ReferenceIdInputProps {
  label?: string;
}

// REFERENCE ID INPUT
export const ReferenceIdInput = ({ label }: ReferenceIdInputProps) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <p className="text-[12px] px-2">
      <span style={{ display: "inline", fontSize: "11px" }}>
        {label}
        <FontAwesomeIcon
          icon={isCopied ? faCheckCircle : faCopy}
          className={`w-4 h-4 cursor-pointer align-middle ml-1 ${isCopied ? "text-primary" : "text-secondary"} text-[11px]`}
          onClick={(e) => {
            e.preventDefault();
            if (!label) return;
            navigator.clipboard.writeText(label);
            toast.info(`${label} copied to clipboard`);
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 1000);
          }}
        />
      </span>
    </p>
  );
};
