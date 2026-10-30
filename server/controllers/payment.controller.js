import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    if (!amount || !credits) {
      return res.status(400).json({
        message: "Invalid plan data. Amount and credits are required.",
      });
    }

    const razorpayInstance = razorpay;
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!keyId || !keySecret || keyId === "rzp_test_placeholder") {
      return res.status(500).json({
        message:
          "Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json({
      ...order,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    const description =
      error?.error?.description ||
      error?.message ||
      "Failed to create Razorpay order";

    return res.status(500).json({
      message: `Failed to create Razorpay order: ${description}`,
      details: error?.error || error?.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment verification parameters",
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    if (payment.status === "paid") {
      const existingUser = await User.findById(payment.userId);
      return res.json({
        success: true,
        message: "Payment already processed",
        user: existingUser,
      });
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        $inc: {
          credits: payment.credits,
        },
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Payment verified and credits added 🎉",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    const description =
      error?.error?.description ||
      error?.message ||
      "Failed to verify Razorpay order";

    return res.status(500).json({
      message: `Failed to verify payment: ${description}`,
    });
  }
};