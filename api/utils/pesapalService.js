import axios from "axios";
import pesapalConfig from "../config/pesapal.js";
import { ApiError } from "./ApiError.js";

class PesaPalService {
  constructor() {
    this.baseUrl = pesapalConfig.endpoints.getBaseUrl();
    this.consumerKey = pesapalConfig.consumerKey;
    this.consumerSecret = pesapalConfig.consumerSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token using API 3.0
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const url = `${this.baseUrl}${pesapalConfig.endpoints.auth}`;

      // API 3.0 uses JSON format
      const authData = {
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
      };

      const response = await axios.post(url, authData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      });

      // Check for error response
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      // Extract token from response
      if (response.data.token) {
        this.accessToken = response.data.token;
        this.tokenExpiry = Date.now() + 50 * 60 * 1000; // 50 minutes
        return this.accessToken;
      }

      throw new ApiError(500, "Failed to get PesaPal access token");
    } catch (error) {
      console.error("PesaPal Auth Error:", error);
      throw new ApiError(500, "PesaPal authentication failed");
    }
  }

  // Create payment order using API 3.0
  async createPaymentOrder(orderData) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}${pesapalConfig.endpoints.createOrder}`;

      const {
        orderId,
        amount,
        description,
        type,
        firstName,
        lastName,
        email,
        phoneNumber,
        currency = "USD",
        callbackUrl = pesapalConfig.callbackUrls.success,
        failureUrl = pesapalConfig.callbackUrls.failure,
      } = orderData;

      // API 3.0 JSON payload
      const payload = {
        id: orderId,
        currency: currency,
        amount: amount,
        description: description,
        callback_url: callbackUrl,
        notification_id: pesapalConfig.callbackUrls.ipn,
        billing_address: {
          email_address: email,
          phone_number: phoneNumber,
          country_code: "KE",
          first_name: firstName,
          last_name: lastName,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      });

      // Check for error response
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      // Extract redirect URL from response
      if (response.data.redirect_url) {
        return {
          success: true,
          redirectUrl: response.data.redirect_url,
          orderId: orderId,
          trackingId: response.data.tracking_id,
        };
      }

      throw new ApiError(500, "Failed to create PesaPal payment order");
    } catch (error) {
      console.error("PesaPal Create Order Error:", error);
      throw new ApiError(500, "Failed to create payment order");
    }
  }

  // Get transaction status using API 3.0
  async getTransactionStatus(orderId, trackingId) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}${pesapalConfig.endpoints.getTransactionStatus}`;

      const params = {
        orderTrackingId: trackingId || orderId,
      };

      const response = await axios.get(
        `${url}?${new URLSearchParams(params)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      // Check for error response
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return {
        success: true,
        status: response.data.payment_status_description,
        amount: response.data.amount,
        currency: response.data.currency,
        orderId: orderId,
        trackingId: trackingId,
      };
    } catch (error) {
      console.error("PesaPal Status Check Error:", error);
      throw new ApiError(500, "Failed to check transaction status");
    }
  }

  // Query payment status using API 3.0
  async queryPaymentStatus(orderId) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.baseUrl}${pesapalConfig.endpoints.queryPaymentStatus}`;

      const params = {
        orderTrackingId: orderId,
      };

      const response = await axios.get(
        `${url}?${new URLSearchParams(params)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      // Check for error response
      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return {
        success: true,
        status: response.data.payment_status_description,
        trackingId: response.data.order_tracking_id,
        orderId: orderId,
      };
    } catch (error) {
      console.error("PesaPal Query Error:", error);
      throw new ApiError(500, "Failed to query payment status");
    }
  }
}

export default new PesaPalService();
