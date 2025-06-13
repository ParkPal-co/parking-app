import React from "react";
import { BackButton } from "../../components/navigation/BackButton";

const TermsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] pb-4 pt-12 px-2">
      <BackButton className="absolute left-4 ml-4 top-20 mt-2" />
      <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-4 text-center">
        ParkPal Terms and Conditions
      </h1>
      <div className="w-full max-w-3xl h-[70vh] md:h-[80vh] bg-white rounded shadow overflow-hidden">
        <object
          data="/ParkPalTermsandConditions.pdf"
          type="application/pdf"
          width="100%"
          height="100%"
        >
          <p className="p-4 text-center">
            Unable to display PDF. You can
            <a
              href="/ParkPalTermsandConditions.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary-700 ml-1"
            >
              download and view the Terms and Conditions here
            </a>
            .
          </p>
        </object>
      </div>
    </div>
  );
};

export default TermsPage;
