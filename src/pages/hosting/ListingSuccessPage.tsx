import React from "react";
import { Button, Card } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import ThreeDIcon from "../../assets/images/3DIcon.png";

const ListingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-x-hidden px-4">
      <FloatingQuotesBackground />
      <Card className="relative z-10 flex flex-col items-center my-10 p-10 max-w-lg w-full text-center shadow-2xl animate-fade-in-from-top">
        <h1 className="text-4xl font-extrabold text-primary-900 mb-2">
          🎉 Listing Created!
        </h1>
        <p className="text-lg text-primary-800 mb-4">
          Your driveway is now live and ready for bookings. You will recieve an email when it gets booked. <br /> 
          Thank you for helping your community and making event parking easier!
        </p>
        <div className="flex flex-col items-center">
          <img
            src={ThreeDIcon}
            alt="3D Icon"
            className=" mx-auto mb-4 w-1/2"
          />
        </div>
        <Button
          size="large"
          variant="primary"
          className="font-bold mt-2"
          onClick={() => navigate("/my-listings")}
        >
          View My Listing
        </Button>
      </Card>
    </div>
  );
};

export default ListingSuccessPage;
