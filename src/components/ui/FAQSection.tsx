import React from "react";
import { Card } from "./Card";

const faqs = [
  {
    question: "How do I get paid?",
    answer:
      "Payments are processed securely through Stripe. Once your driveway is booked and the event is complete, funds (minus fees) are automatically transferred to your connected bank account.",
  },
  {
    question: "What if I want to list multiple spots in my driveway?",
    answer:
      "You can list as many driveways spaces as you want. Just make sure each listing specifies which side of the driveway it is on, etc.",
  },
  {
    question: "How will I communicate with who books my spot?",
    answer:
      "You will be able to communicate with the renter through the app. You will also be able to see the renter's name and profile picture.",
  },
  {
    question: "What information does Stripe require?",
    answer:
      "Stripe will ask for your name, date of birth, and last 4 digits of your SSN to verify your identity, as required by U.S. law. ParkPal never sees or stores this information.",
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

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <Card
      className="flex flex-col lg:flex-row items-center gap-8 p-8 w-full lg:items-stretch"
      shadow="large"
      padding="large"
    >
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-primary-200 rounded-lg border border-primary-100 bg-primary-50">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button
                className="w-full text-left flex items-center justify-between py-4 px-4 focus:outline-none transition-normal bg-transparent hover:bg-primary-100 rounded-t-lg"
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
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
      </div>
    </Card>
  );
};

export default FAQSection;
