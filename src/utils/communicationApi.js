import axios from 'axios';

const TERMII_API_KEY = import.meta.env.VITE_TERMII_API_KEY;
const TERMII_SENDER_ID = import.meta.env.VITE_TERMII_SENDER_ID || 'RICGCW';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api'; // Standard endpoint

/**
 * Sends an SMS via Termii Gateway
 * @param {string} to - Destination phone number in international format (e.g., 233...)
 * @param {string} message - The content of the SMS
 * @returns {Promise<object>} - API response
 */
export const sendSMS = async (to, message) => {
  if (!TERMII_API_KEY) {
    console.error('Termii API Key missing');
    return { success: false, error: 'Communication service not configured' };
  }

  // Clean phone number: remove '+' or leading '0' and ensure it starts with country code (assuming 233 for Ghana if not provided)
  let cleanedTo = to.replace(/\D/g, '');
  if (cleanedTo.startsWith('0')) {
    cleanedTo = '233' + cleanedTo.substring(1);
  } else if (!cleanedTo.startsWith('233') && cleanedTo.length === 9) {
      cleanedTo = '233' + cleanedTo;
  }

  const payload = {
    to: cleanedTo,
    from: TERMII_SENDER_ID,
    sms: message,
    type: 'plain',
    channel: 'generic', // or 'dnd' depending on account type
    api_key: TERMII_API_KEY
  };

  try {
    const response = await axios.post(`${TERMII_BASE_URL}/sms/send`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Termii SMS Error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send SMS' 
    };
  }
};

/**
 * Sends a Bulk SMS to multiple recipients
 * @param {string[]} recipients - Array of phone numbers
 * @param {string} message - The content of the SMS
 */
export const sendBulkSMS = async (recipients, message) => {
    // Termii has a bulk endpoint, but for simplicity and safety, 
    // we can iterate or use their bulk API. 
    // Implementing the iterative approach with a small delay to avoid rate limits if necessary.
    const results = [];
    for (const recipient of recipients) {
        results.push(await sendSMS(recipient, message));
    }
    return results;
};
