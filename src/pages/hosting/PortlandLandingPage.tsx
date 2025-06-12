/**
 * src/pages/hosting/PortlandLandingPage.tsx
 * Page component for handling the List navigation option
 */

import React, { useState } from "react";
import { Card, Button, Alert } from "../../components/ui";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import LaurelhurstPark from "../../assets/images/LaurelhurstPark.png";
import { useInView } from "../../hooks/useInView";
import Footer from "../../components/navigation/Footer";
import { BackButton } from "../../components/navigation/BackButton";
import { useAuth } from "../../hooks/useAuth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";

const PortlandLandingPage: React.FC = () => {
  // Animation hooks for each section
  const [heroCard1Ref, heroCard1InView] = useInView();

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
              padding="large"
              shadow="large"
              className="h-full flex flex-col justify-center min-h-72 gap-4 lg:max-w-2xl"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-primary-900 mb-2">
                Live near Laurelhurst Park?
              </h1>
              <p className="text-primary-800 text-lg">
                The annual Water Lantern Festival - happening this Saturday and
                Sunday - brings thousands of participants to your neighborhood
                every year. Since there are no parking lots, the event is known
                for parking issues, which has created a frustrating experience
                for attendees.
                <br />
                <br />
                <div className="flex lg:hidden flex md:w-3/4 md: my-4">
                  <Card padding="large" shadow="large" className="p-0">
                    <img
                      src={LaurelhurstPark}
                      alt="Laurelhurst Park"
                      className="h-full w-full object-cover drop-shadow-lg rounded-2xl"
                      style={{ filter: "saturate(1.1) brightness(1.5)" }}
                    />
                  </Card>
                </div>
                ParkPal is a platform that allows you to list your driveway as a
                parking spot for the event. You can set your own price and
                availability, and we will handle the rest to get you paid.
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
                    navigate("/hosting/list");
                  } else {
                    navigate("/register");
                  }
                }}
                className="mt-4 shadow-md font-bold max-w-48"
              >
                Become a Host
              </Button>
            </Card>
          </div>
          {/* Card 2: Driveway graphic placeholder */}
          <div
            className={`flex hidden lg:flex md:w-1/2 animate-fade-in-from-top`}
          >
            <Card padding="large" shadow="large" className="p-0">
              <img
                src={LaurelhurstPark}
                alt="Laurelhurst Park"
                className="h-full w-full object-cover drop-shadow-lg rounded-2xl"
                style={{ filter: "saturate(1.1) brightness(1.5)" }}
              />
            </Card>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="w-full flex flex-col items-center gap-8">
          <Card
            className="flex flex-col lg:flex-row items-center gap-8 p-8 w-full lg:items-stretch"
            shadow="large"
            padding="large"
          >
            {/* FAQ Section */}
            <div className="w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4">
                Frequently Asked Questions
              </h2>
              {(() => {
                const faqs = [
                  {
                    question: "How do I get paid?",
                    answer:
                      "Payments are processed securely through Stripe. Once your driveway is booked and the event is complete, funds (minus fees) are automatically transferred to your connected bank account.",
                  },
                  {
                    question: "What information does Stripe require?",
                    answer:
                      "Stripe will ask for your name, date of birth, and last 4 digits of your SSN to verify your identity, as required by U.S. law. ParkPal never sees or stores this information.",
                  },
                  {
                    question:
                      "What if I want to list multiple spots in my driveway?",
                    answer:
                      "You can list as many driveways spaces as you want. Just make sure each listing specifies which side of the driveway it is on, etc.",
                  },
                  {
                    question: "Can I set my own price?",
                    answer:
                      "Yes! You can set your own price and availability for your driveway. You can also update or remove your listing at any time.",
                  },
                  {
                    question: "Is my information secure?",
                    answer:
                      "Absolutely. All sensitive information is handled by Stripe, a leading global payments provider. ParkPal never stores your personal or banking details.",
                  },
                  {
                    question: "What if I need to cancel a booking?",
                    answer:
                      "If you need to cancel, please contact us as soon as possible so we can notify the guest and help them find alternative parking.",
                  },
                ];
                const [openIndex, setOpenIndex] = React.useState<number | null>(
                  null
                );
                return (
                  <div className="divide-y divide-primary-200 rounded-lg border border-primary-100 bg-primary-50">
                    {faqs.map((faq, idx) => (
                      <div key={idx}>
                        <button
                          className="w-full text-left flex items-center justify-between py-4 px-4 focus:outline-none transition-normal bg-transparent hover:bg-primary-100 rounded-t-lg"
                          aria-expanded={openIndex === idx}
                          aria-controls={`faq-answer-${idx}`}
                          onClick={() =>
                            setOpenIndex(openIndex === idx ? null : idx)
                          }
                        >
                          <span className="font-semibold text-primary-900 text-lg">
                            {faq.question}
                          </span>
                          <svg
                            className={`h-5 w-5 ml-2 text-primary-500 transition-transform ${
                              openIndex === idx ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div
                          id={`faq-answer-${idx}`}
                          className={`px-4 pb-4 text-primary-800 text-base transition-all duration-300 ease-in-out ${
                            openIndex === idx
                              ? "max-h-40 opacity-100"
                              : "max-h-0 opacity-0 overflow-hidden"
                          }`}
                          aria-hidden={openIndex !== idx}
                        >
                          {faq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </Card>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PortlandLandingPage;
