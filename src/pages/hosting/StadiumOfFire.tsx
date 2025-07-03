/**
 * src/pages/hosting/PortlandLandingPage.tsx
 * Page component for handling the List navigation option
 */

import React from "react";
import { Card, Button } from "../../components/ui";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import BYUstadium from "../../assets/images/BYUstadium.png";
import { useInView } from "../../hooks/useInView";
import Footer from "../../components/navigation/Footer";
import { BackButton } from "../../components/navigation/BackButton";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FAQSection from "../../components/ui/FAQSection";

const StadiumOfFireLandingPage: React.FC = () => {
  // Animation hooks for each section
  const [heroCard1Ref, heroCard1InView] = useInView();

  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[80vh] overflow-x-hidden">
      {/* Animated floating quotes background */}
      <FloatingQuotesBackground />
      {/* Main content overlay */}
      <div className="relative z-10 flex flex-col gap-8 container mx-auto px-4 py-8">
        <BackButton />
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row-reverse gap-6 md:gap-4 mt-4 md:items-stretch">
          {/* Card 1: Headline + CTA */}
          <div
            ref={heroCard1Ref}
            className={`flex-auto flex-col [animation-fill-mode:forwards] opacity-0 ${
              heroCard1InView ? "animate-fade-in-from-top" : ""
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <Card
              padding="normal"
              shadow="large"
              className="h-full flex flex-col justify-center min-h-72 gap-4 lg:max-w-2xl"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-primary-900 mb-2">
                Do you live near Lavell Edwards Stadium?
              </h1>
              <p className="text-primary-800 text-lg">
                Stadium of Fire, America's Freedom Festival, is happening this
                July 4th at LaVell Edwards Stadium in Provo, Utah. This
                spectacular event draws tens of thousands of attendees every
                year, making parking a major challenge for everyone in the area.
              </p>

              <div className="flex lg:hidden flex md:w-3/4 md: my-4">
                <Card padding="large" shadow="large" className="p-0">
                  <img
                    src={BYUstadium}
                    alt="BYU Stadium"
                    className="h-full w-full object-cover drop-shadow-lg rounded-2xl"
                    style={{ filter: "saturate(1.1) brightness(1.5)" }}
                  />
                </Card>
              </div>

              <p className="text-primary-800 text-lg">
                ParkPal is a platform that allows you to list your driveway
                space as parking spots for the event. You can set your own price
                and availability, and we will handle the rest to get you paid.
                <br />
                <br />
                We are a small team of developers and event organizers who are
                passionate about giving back to the community.
              </p>
              <Button
                size="large"
                variant="primary"
                onClick={() => {
                  if (user) {
                    navigate("/list");
                  } else {
                    sessionStorage.setItem("returnPath", "/list");
                    navigate("/register");
                  }
                }}
                className="mt-4 shadow-md font-bold lg:max-w-56"
              >
                List your driveway
              </Button>
            </Card>
          </div>
          {/* Card 2: Driveway graphic placeholder */}
          <div
            className={`flex hidden lg:flex md:w-1/2 animate-fade-in-from-top`}
          >
            <Card padding="normal" shadow="large" className="p-0">
              <img
                src={BYUstadium}
                alt="BYU Stadium"
                className="h-full w-full object-cover drop-shadow-lg rounded-2xl"
                style={{ filter: "saturate(1.1) brightness(1.5)" }}
              />
            </Card>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="w-full flex flex-col items-center gap-8">
          <FAQSection />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default StadiumOfFireLandingPage;
