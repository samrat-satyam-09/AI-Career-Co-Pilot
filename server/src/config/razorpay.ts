import Razorpay from "razorpay";
import { logger } from "./logger";

let razorpayInstance: InstanceType<typeof Razorpay>;

const connectRazorpay = (): InstanceType<typeof Razorpay> => {
  if (razorpayInstance) return razorpayInstance;

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  logger.info("Razorpay initialized");
  return razorpayInstance;
};

export { connectRazorpay };
export const getRazorpay = (): InstanceType<typeof Razorpay> => {
  if (!razorpayInstance) {
    throw new Error("Razorpay not initialized. Call connectRazorpay() first.");
  }
  return razorpayInstance;
};
