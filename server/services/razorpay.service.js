import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRazorpayInstance = () => {
  // Reload .env on demand with override: true so any key updates take effect immediately
  dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

  const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  return new Razorpay({
    key_id: key_id || "rzp_test_placeholder",
    key_secret: key_secret || "placeholder_secret",
  });
};

// Proxy object for backwards compatibility with `razorpay.orders.create`
const razorpayProxy = {
  get orders() {
    return getRazorpayInstance().orders;
  },
  get payments() {
    return getRazorpayInstance().payments;
  },
};

export default razorpayProxy;