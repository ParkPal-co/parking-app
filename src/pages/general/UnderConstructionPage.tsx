import React from "react";
import { Card } from "../../components/ui/Card";
import Footer from "../../components/navigation/Footer";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import Icon1 from "../../assets/images/Icon1.png";
import { BackButton } from "../../components/navigation/BackButton";

const UnderConstruction: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <FloatingQuotesBackground />
      <div className="flex-1 flex items-center justify-center z-10">
        <Card
          padding="large"
          shadow="large"
          className="flex flex-col items-center max-w-md w-full bg-white backdrop-blur-md mx-8"
        >
          <img
            src={Icon1}
            alt="Under Construction Icon"
            className="h-20 w-20 mb-6 drop-shadow-md"
            draggable={false}
          />
          <h1 className="text-2xl font-bold text-primary-900 mb-2 text-center">
            Page Under Construction
          </h1>
          <p className="text-primary-700 text-center text-base max-w-xs">
            This page is currently being built. Please check back soon for
            updates and new features!
          </p>
          <div className="flex justify-center mt-6 w-full">
            <BackButton />
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UnderConstruction;
