import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BsCoin } from "react-icons/bs";
import { FaCoins, FaTimes, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function LowCreditModal({ isOpen, onClose, credits = 0 }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(4);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/pricing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, navigate]);

  if (!isOpen) return null;

  const handleBuyCredits = () => {
    if (onClose) onClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={16} />
          </button>

          {/* Animated Icon Badge */}
          <div className="w-18 h-18 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <BsCoin size={36} className="animate-bounce" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Not Enough Credits
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            You don't have enough credits to start an interview. Each interview
            costs <span className="font-semibold text-gray-900">50 credits</span>.
            Please buy more credits to proceed.
          </p>

          {/* Credit balance visual comparison */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex items-center justify-around">
            <div className="text-center">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1">
                Required
              </span>
              <span className="text-lg font-bold text-gray-800">50 Credits</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1">
                Your Balance
              </span>
              <span className="text-lg font-bold text-amber-600">
                {credits} Credits
              </span>
            </div>
          </div>

          {/* Call to action button */}
          <button
            onClick={handleBuyCredits}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <FaCoins className="text-amber-200" />
            <span>Buy Credits</span>
            <FaArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {/* Auto redirect note */}
          <p className="text-xs text-gray-400 mt-4">
            Redirecting to buy credits in{" "}
            <span className="font-semibold text-gray-600">{countdown}s</span>...
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LowCreditModal;
