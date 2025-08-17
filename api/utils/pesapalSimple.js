import axios from 'axios';
import { ApiError } from './ApiError.js';

class PesaPalSimple {
  constructor() {
    this.baseUrl = 'https://www.pesapal.com';
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || 'C+/fgSKFvYTRpZeC3bD+yymF3ZsjFgZ/';
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || 'G7z8k/euaoycKJcmPSqEzRmWc1s=';
  }

  // Simple authentication test
  async testAuth() {
    try {
      const url = `${this.baseUrl}/api/Auth/RequestToken`;
      
      // Try different authentication methods
      const methods = [
        {
          headers: { 'Content-Type': 'application/xml' },
          data: ''
        },
        {
          headers: { 'Content-Type': 'application/json' },
          data: {
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret
          }
        },
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')}`
          },
          data: ''
        }
      ];

      for (let i = 0; i < methods.length; i++) {
        try {
          console.log(`Trying authentication method ${i + 1}...`);
          const response = await axios.post(url, methods[i].data, {
            headers: methods[i].headers,
            timeout: 10000
          });
          
          console.log(`✅ Method ${i + 1} successful:`, response.status);
          console.log('Response:', response.data);
          return response.data;
        } catch (error) {
          console.log(`❌ Method ${i + 1} failed:`, error.message);
        }
      }
      
      throw new Error('All authentication methods failed');
    } catch (error) {
      console.error('Authentication test failed:', error);
      throw new ApiError(500, 'PesaPal authentication failed');
    }
  }

  // Create a simple payment order
  async createOrder(orderData) {
    try {
      const url = `${this.baseUrl}/api/URLs/PostPesapalDirectOrderV4`;
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<PesapalDirectOrderInfo 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
    Amount="${orderData.amount}" 
    Description="${orderData.description}" 
    Type="${orderData.type}" 
    Reference="${orderData.orderId}" 
    FirstName="${orderData.firstName}" 
    LastName="${orderData.lastName}" 
    Email="${orderData.email}" 
    PhoneNumber="${orderData.phoneNumber}" 
    Currency="${orderData.currency}" 
    xmlns="http://www.pesapal.com" />`;

      const response = await axios.post(url, xmlPayload, {
        headers: {
          'Content-Type': 'application/xml',
          'Accept': 'application/xml'
        },
        timeout: 15000
      });

      console.log('PesaPal Response:', response.data);
      
      // Parse response
      const redirectUrlMatch = response.data.match(/<RedirectURL>(.*?)<\/RedirectURL>/);
      if (redirectUrlMatch) {
        return {
          success: true,
          redirectUrl: redirectUrlMatch[1],
          orderId: orderData.orderId
        };
      }
      
      throw new Error('No redirect URL in response');
    } catch (error) {
      console.error('Create order failed:', error);
      throw new ApiError(500, 'Failed to create payment order');
    }
  }
}

export default new PesaPalSimple();
