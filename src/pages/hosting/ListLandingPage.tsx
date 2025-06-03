/**
 * src/pages/hosting/ListLandingPage.tsx
 * Page component for handling the List navigation option
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "../../components/ui";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import drivewayImg from "../../assets/images/Icon1WhiteBkgd.png";

const ListLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[80vh] overflow-x-hidden">
      {/* Animated floating quotes background */}
      <FloatingQuotesBackground />

      {/* Main content overlay */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Hero Section */}
        <section className="w-full flex flex-col md:flex-row gap-6 md:gap-4 items-center justify-center mt-4">
          {/* Card 1: Headline + CTA */}
          <Card
            className="flex-1 flex flex-col justify-center items-start gap-6 min-h-96"
            padding="large"
            shadow="large"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-primary-900 mb-2">
              Let the <span className="font-black">pavement</span> do the work
            </h1>
            <Button
              size="large"
              variant="primary"
              onClick={() => navigate("/account-settings")}
              className="mt-4"
            >
              Become a Host
            </Button>
          </Card>
          {/* Card 2: Driveway graphic placeholder */}
          <Card
            className="flex-1 flex items-center justify-center min-h-96 hidden sm:flex"
            padding="large"
            shadow="large"
          >
            <img
              src={drivewayImg}
              alt="Driveway with dollar signs"
              className="max-h-48 w-auto object-contain drop-shadow-lg"
              style={{ filter: "saturate(1.1)" }}
            />
          </Card>
        </section>

        {/* How it Works Section */}
        <section className="w-full flex flex-col items-center gap-8">
          <Card className="flex flex-col lg:flex-row items-center gap-8 p-8 w-full" shadow="large" padding="large">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-primary-900 mb-2">
                How it works
              </h2>
              <ol className="list-decimal list-inside text-lg text-primary-800 space-y-3 max-w-xl">
                <li>
                  Find the next event happening near your home
                </li>
                <li>Register your host account</li>
                <li>Post your listing</li>
              </ol>
            </div>
            <p className="text-primary-700 text-end mt-2">
              We will make sure your driveway gets in front of the right people,
              and notify you when someone books it!
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ListLandingPage;
