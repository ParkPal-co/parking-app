/**
 * src/pages/bookings/BookingSuccessPage.tsx
 * Page shown after a successful booking
 */
import React from "react";
import { Button, Card } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import ThreeDIcon from "../../assets/images/3DIcon.png";
// You can use an emoji or import an image like ThreeDIcon if you want

const BookingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-x-hidden px-4">
      <FloatingQuotesBackground />
      <Card className="relative z-10 flex flex-col items-center p-10 max-w-lg w-full text-center shadow-2xl animate-fade-in-from-top">
        <h1 className="text-4xl font-extrabold text-primary-900 mb-2">
          🎉 Booking Confirmed!
        </h1>
        <p className="text-lg text-primary-800 mb-4">
          Your booking was successful.
          <br />
          Thank you for using ParkPal!
        </p>
        <div className="flex flex-col items-center">
          <img src={ThreeDIcon} alt="3D Icon" className=" mx-auto mb-4 w-1/2" />
        </div>
        <Button
          size="large"
          variant="primary"
          className="font-bold mt-2"
          onClick={() => navigate("/my-bookings")}
        >
          View My Bookings
        </Button>
      </Card>
    </div>
  );
};

export default BookingSuccessPage;
