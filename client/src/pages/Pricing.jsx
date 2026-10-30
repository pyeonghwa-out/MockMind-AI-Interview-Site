import React, { useState } from "react";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { ServerUrl } from "../App";
import AuthModel from "../components/AuthModel";

// Helper to load Razorpay checkout script if not already present
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits (2 Interviews)",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits (3 Interviews)",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits (13 Interviews)",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    // 1. Ensure user is logged in
    if (!userData) {
      setShowAuth(true);
      return;
    }

    try {
      setLoadingPlan(plan.id);

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Unable to load Razorpay checkout SDK. Please verify your internet connection.");
        setLoadingPlan(null);
        return;
      }

      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      // 3. Request backend order creation
      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount: amount,
          credits: plan.credits,
        },
        { withCredentials: true }
      );

      console.log("Order created:", result.data);

      const razorpayKey =
        result.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // 4. Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: result.data.amount,
        currency: result.data.currency || "INR",
        name: "MockMind",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          try {
            console.log("Payment response:", response);

            const verifypay = await axios.post(
              ServerUrl + "/api/payment/verify",
              response,
              { withCredentials: true }
            );

            console.log("Verification response:", verifypay.data);

            if (verifypay.data.user) {
              dispatch(setUserData(verifypay.data.user));
            }

            alert("Payment Successful 🎉 Credits Added!");
            navigate("/");
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            const msg =
              verifyError.response?.data?.message ||
              "Failed to verify payment with server";
            alert(msg);
          } finally {
            setLoadingPlan(null);
          }
        },

        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout modal closed");
            setLoadingPlan(null);
          },
        },

        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (failResponse) {
        console.error("Razorpay payment failed:", failResponse.error);
        const failMsg =
          failResponse.error?.description ||
          failResponse.error?.reason ||
          "Payment processing failed";
        alert(`Payment Failed: ${failMsg}`);
        setLoadingPlan(null);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Could not initiate payment. Please try again.";
      alert(errorMsg);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6">
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <button
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition cursor-pointer"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>

          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
          <p className="text-emerald-700 font-medium text-sm mt-1 bg-emerald-100/70 inline-block px-4 py-1 rounded-full">
            ⚡ Each mock interview session costs exactly 50 credits
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={!plan.default && { scale: 1.03 }}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-8 transition-all duration-300 border
                ${
                  isSelected
                    ? "border-emerald-600 shadow-2xl bg-white"
                    : "border-gray-200 bg-white shadow-md"
                }
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {plan.badge && (
                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow font-semibold">
                  {plan.badge}
                </div>
              )}

              {plan.default && (
                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                  Default
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h3>

              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {plan.price}
                </span>

                <p className="text-gray-500 mt-1 font-medium">{plan.credits} Credits</p>
              </div>

              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {!plan.default && (
                <button
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!isSelected) {
                      setSelectedPlan(plan.id);
                    } else {
                      handlePayment(plan);
                    }
                  }}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                  } ${loadingPlan === plan.id ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : isSelected
                    ? "Proceed to Pay"
                    : "Select Plan"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Pricing;
