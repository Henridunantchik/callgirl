import dotenv from "dotenv";

dotenv.config();

const pesapalConfig = {
  // PesaPal API credentials
  consumerKey:
    process.env.PESAPAL_CONSUMER_KEY || "C+/fgSKFvYTRpZeC3bD+yymF3ZsjFgZ/",
  consumerSecret:
    process.env.PESAPAL_CONSUMER_SECRET || "G7z8k/euaoycKJcmPSqEzRmWc1s=",

  // Environment (sandbox or live)
  environment: process.env.PESAPAL_ENVIRONMENT || "sandbox",

  // Base URLs for PesaPal API 3.0
  baseUrls: {
    sandbox: "https://cybqa.pesapal.com/pesapalv3",
    live: "https://pay.pesapal.com/v3",
  },

  // API endpoints for PesaPal API 3.0
  endpoints: {
    // Get base URL based on environment
    getBaseUrl: function () {
      return pesapalConfig.baseUrls[pesapalConfig.environment];
    },

    // Authentication
    auth: "/api/Auth/RequestToken",

    // Payment endpoints (API 3.0)
    createOrder: "/api/URLs/PostPesapalDirectOrderV4",
    getTransactionStatus: "/api/URLs/GetTransactionStatus",
    queryPaymentStatus: "/api/URLs/QueryPaymentStatus",

    // IPN (Instant Payment Notification)
    ipn: "/api/URLs/RegisterIPN",

    // Refund
    refund: "/api/URLs/ProcessRefund",
  },

  // Callback URLs
  callbackUrls: {
    success:
      process.env.PESAPAL_SUCCESS_URL ||
      "http://localhost:3000/payment/success",
    failure:
      process.env.PESAPAL_FAILURE_URL ||
      "http://localhost:3000/payment/failure",
    ipn:
      process.env.PESAPAL_IPN_URL ||
      "http://localhost:5000/api/payment/pesapal/ipn",
  },

  // Payment types supported
  paymentTypes: {
    ORDER: "MERCHANT",
    SUBSCRIPTION: "SUBSCRIPTION",
    BOOKING: "BOOKING",
  },

  // Currency codes
  currencies: {
    USD: "USD",
    KES: "KES",
    UGX: "UGX",
    TZS: "TZS",
    RWF: "RWF",
    CDF: "CDF",
    BIF: "BIF",
  },

  // Payment methods
  paymentMethods: {
    MPESA: "M-PESA",
    AIRTEL: "AIRTEL",
    MTN: "MTN",
    VISA: "VISA",
    MASTERCARD: "MASTERCARD",
    BANK: "BANK",
  },
};

export default pesapalConfig;
