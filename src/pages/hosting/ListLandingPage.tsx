/**
 * src/pages/hosting/ListLandingPage.tsx
 * Page component for handling the List navigation option
 */

import React, { useState } from "react";
import { Card, Button, Alert } from "../../components/ui";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import carInDrivewayImg from "../../assets/images/LogoOverHouse.png";
import { useInView } from "../../hooks/useInView";
import Footer from "../../components/navigation/Footer";
import { BackButton } from "../../components/navigation/BackButton";
import { useAuth } from "../../hooks/useAuth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import FAQSection from "../../components/ui/FAQSection";

const ListLandingPage: React.FC = () => {
  // Animation hooks for each section
  const [heroCard1Ref, heroCard1InView] = useInView();
  const [heroCard2Ref, heroCard2InView] = useInView();
  const [howItWorksRef, howItWorksInView] = useInView();
  const { user } = useAuth();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeSuccess, setStripeSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSuccess(null);
    try {
      const functions = getFunctions();
      const createOrGetStripeAccountLink = httpsCallable(
        functions,
        "createOrGetStripeAccountLink"
      );
      const origin = window.location.origin;
      const { data } = await createOrGetStripeAccountLink({ origin });
      const url = (data as any).url;
      if (url) {
        setStripeSuccess("Redirecting to Stripe...");
        window.location.href = url;
      } else {
        setStripeError("Failed to get Stripe onboarding link.");
      }
    } catch (err: any) {
      setStripeError(err.message || "Failed to connect with Stripe.");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleGoToStripeDashboard = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSuccess(null);
    try {
      const functions = getFunctions();
      const createStripeDashboardLink = httpsCallable(
        functions,
        "createStripeDashboardLink"
      );
      const { data } = await createStripeDashboardLink({});
      const url = (data as any).url;
      if (url) {
        setStripeSuccess("Redirecting to Stripe...");
        window.location.href = url;
      } else {
        setStripeError("Failed to get Stripe dashboard link.");
      }
    } catch (err: any) {
      setStripeError(err.message || "Failed to open Stripe dashboard.");
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] overflow-x-hidden">
      {/* Animated floating quotes background */}
      <FloatingQuotesBackground />
      {/* Main content overlay */}
      <div className="relative z-10 flex flex-col gap-8 container mx-auto px-4 py-8">
        <BackButton />
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row gap-6 md:gap-4 mt-4 md:items-stretch">
          {/* Card 1: Headline + CTA */}
          <div
            ref={heroCard1Ref}
            className={`flex-auto flex-col [animation-fill-mode:forwards] opacity-0 ${
              heroCard1InView ? "animate-fade-in-from-top" : ""
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <Card
              padding="large"
              shadow="large"
              className="h-full flex flex-col justify-center min-h-72 gap-4"
            >
              <div className="flex flex-col items-center max-w-md mx-auto md:hidden">
                <img
                  src={carInDrivewayImg}
                  alt="Car in driveway"
                  className=" mx-auto mb-4 w-full"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-primary-900 mb-2">
                Let your <span className="font-black">pavement</span> pay you
              </h1>
              <Button
                size="large"
                variant="primary"
                onClick={() => {
                  const element = document.getElementById(
                    "stripe-connect-section"
                  );
                  const topOffset = element?.getBoundingClientRect().top ?? 0;
                  window.scrollTo({
                    top: window.scrollY + topOffset - 80,
                    behavior: "smooth",
                  });
                }}
                className="mt-4 shadow-md font-bold max-w-48"
              >
                Become a Host
              </Button>
            </Card>
          </div>
          {/* Card 2: Driveway graphic placeholder */}
          <div
            ref={heroCard2Ref}
            className={`flex hidden md:flex [animation-fill-mode:forwards] opacity-0 ${
              heroCard2InView ? "animate-fade-in-from-right" : ""
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            <Card padding="large" shadow="large" className="p-0">
              <img
                src={carInDrivewayImg}
                alt="Car in driveway"
                className="max-h-96 w-auto object-contain drop-shadow-lg rounded-2xl"
                style={{ filter: "saturate(1.1)" }}
              />
            </Card>
          </div>
        </section>

        {/* How it Works Section */}
        <section
          ref={howItWorksRef}
          className="w-full flex flex-col items-center gap-8"
        >
          <Card
            className={`flex flex-col lg:flex-row items-center gap-8 p-6 lg:p-8 w-full [&>*]:lg:w-1/2 lg:items-stretch opacity-0 [animation-fill-mode:forwards] ${
              howItWorksInView ? "animate-fade-in-from-left" : ""
            }`}
            style={{ animationDelay: "0.5s" }}
            shadow="large"
          >
            <Card
              className="bg-primary-50 border border-primary-200 rounded-lg lg:p-8 p-4 w-full flex flex-col justify-center items-center"
            >
              <p className=" text-start font-bold text-3xl">
                List your driveway as parking for Events near your home
              </p>
            </Card>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl md:text-4xl font-bold text-primary-900 mb-2">
                How it works
              </h2>
              <ol className="list-decimal list-inside text-lg text-primary-800 space-y-3 max-w-xl">
                <li>Find the next event happening near your home</li>
                <li>
                  Register your host account on Stripe and connect your bank
                  account
                </li>
                <li>Post your listing</li>
              </ol>
            </div>
          </Card>
        </section>

        {/* Stripe Connect Section */}
        <section
          id="stripe-connect-section"
          className="w-full flex flex-col items-center gap-8"
        >
          <Card
            className="flex flex-col md:flex-row items-center md:items-stretch gap-8 lg:p-8 p-6 w-full [&>*]:md:w-1/2"
            shadow="large"
          >
            <div className="flex flex-col gap-4 justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-2">
                Payout Setup
              </h2>
              <p className="text-primary-800 text-lg flex items-center gap-2">
                To get you paid, ParkPal uses Stripe - a leading payments
                platform trusted for its top-tier security and compliance.
              </p>
              <p className="text-primary-800 text-lg flex items-center gap-2">
                Stripe needs to verify your identity. This includes your name,
                DOB, and last 4 of your SSN (required by U.S. law).
              </p>
              <p className="text-primary-800 text-lg flex items-center gap-2 font-extrabold">
                You'll also be asked for your industry and website: use 'Parking
                lots' and 'parkpal.co'
              </p>
              <div className="mt-2">
                {user?.stripeAccountId ? (
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button
                      size="large"
                      variant="primary"
                      className="shadow-md w-full md:w-auto"
                      isLoading={stripeLoading}
                      onClick={handleGoToStripeDashboard}
                    >
                      Go to Stripe Dashboard
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      className="shadow-md w-full md:w-auto"
                      isLoading={stripeLoading}
                      onClick={handleConnectStripe}
                    >
                      Finish Stripe Setup
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="large"
                    variant="primary"
                    className="shadow-md w-full md:w-auto"
                    isLoading={stripeLoading}
                    onClick={handleConnectStripe}
                  >
                    Connect Stripe Account
                  </Button>
                )}
                {stripeError && (
                  <Alert
                    variant="error"
                    message={stripeError}
                    className="mb-2 mt-2"
                  />
                )}
                {stripeSuccess && (
                  <Alert
                    variant="success"
                    message={stripeSuccess}
                    className="mb-2 mt-2"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center">
              {/* <img
                src={reactSvg}
                alt="Stripe onboarding preview"
                className="rounded-lg border border-primary-100 shadow-md max-w-xs w-full"
              /> */}
              <div className="w-full">
                <Alert
                  variant="info"
                  message={
                    "Stripe securely handles all payments. Your SSN and identity info is never shared with ParkPal. These details are required by U.S. financial regulations."
                  }
                  className="text-sm"
                  showIcon
                />
                <a
                  href="https://stripe.com/docs/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary-700 ml-1 text-sm block mt-1 text-center"
                >
                  Learn more about Stripe's security
                </a>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 w-full">
                <div className="font-semibold mb-1 text-primary-900">
                  Platform Fee
                </div>
                <div className="text-primary-800 text-sm">
                  ParkPal charges a{" "}
                  <span className="font-bold">15% platform fee</span> on each
                  booking.
                  <br />
                  <span className="block mt-1">
                    Example: If a customer pays{" "}
                    <span className="font-bold">$25</span>:
                  </span>
                  <ul className="list-disc list-inside ml-4">
                    <li>
                      ParkPal receives <span className="font-bold">$3.75</span>
                    </li>
                    <li>
                      You receive <span className="font-bold">$21.25</span>{" "}
                      (minus Stripe fees)
                    </li>
                  </ul>
                </div>
                <Button
                  size="large"
                  variant="primary"
                  className="shadow-md w-full md:w-auto mt-2"
                  onClick={() => {
                    if (!user?.stripeAccountId) {
                      alert(
                        "You must finish Stripe setup before listing your driveway."
                      );
                      return;
                    }
                    navigate("/register-driveway");
                  }}
                >
                  List Your First Driveway
                </Button>
              </div>
            </div>
          </Card>
        </section>
        <section className="w-full flex flex-col items-center gap-8">
          <FAQSection />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ListLandingPage;
