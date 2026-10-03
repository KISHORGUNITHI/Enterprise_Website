/**
 * @file whatsappService.js
 * @description Enterprise-grade WhatsApp messaging service powered by Meta WhatsApp Business Cloud API.
 * Automatically delivers order confirmation notifications and customer updates.
 *
 * Requirements:
 * - WHATSAPP_ACCESS_TOKEN: Meta Permanent or System User Access Token
 * - WHATSAPP_PHONE_NUMBER_ID: Sender Phone Number ID from Meta Developer Dashboard
 * - WHATSAPP_API_VERSION: (Optional) Defaults to 'v22.0'
 * - WHATSAPP_TEMPLATE_NAME: (Optional) Template name, defaults to 'order_confirmation'
 */

const DEFAULT_API_VERSION = 'v22.0';
const DEFAULT_TEMPLATE_NAME = 'order_confirmation';

/**
 * Standardizes a phone number to Meta's required international E.164 format (digits only).
 * Example: "+91 99636 57799" -> "919963657799"
 *
 * @param {string|number} phone - Raw customer phone number
 * @returns {string|null} Cleaned phone number string
 */
export function sanitizeMetaPhoneNumber(phone) {
  if (!phone) return null;

  // Strip all non-digit characters
  let digits = phone.toString().replace(/\D/g, '');

  // If 10 digits (standard Indian mobile number without country code), prepend India country code 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // Remove leading 0 if present (e.g. 091XXXXXXXXXX)
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  return digits.length >= 10 ? digits : null;
}

/**
 * Formats order summary text for WhatsApp messaging
 *
 * @param {Object} orderData
 * @param {string} orderData.customerName - Name of customer
 * @param {string} orderData.orderId - Unique order identifier
 * @param {number|string} orderData.totalAmount - Total order price in INR
 * @param {Array} [orderData.items] - Ordered products
 * @param {string} [orderData.shippingAddress] - Destination address
 * @returns {string} Formatted WhatsApp message body
 */
export function buildOrderSummaryText({ customerName, orderId, totalAmount, items = [], shippingAddress }) {
  const greeting = customerName ? `Hi *${customerName}*` : 'Hello';
  const orderRef = orderId ? `#${orderId}` : '';
  const formattedTotal = totalAmount !== undefined ? Number(totalAmount).toLocaleString('en-IN') : '0';

  let itemsBreakdown = '';
  if (Array.isArray(items) && items.length > 0) {
    itemsBreakdown = '\n*Items Ordered:*\n' + items
      .map((item, idx) => {
        const title = item.productName || item.name || 'Item';
        const qty = item.quantity || 1;
        const price = item.lineTotal || item.unitPrice || item.price;
        const priceTag = price ? ` — ₹${Number(price).toLocaleString('en-IN')}` : '';
        return `  ${idx + 1}. ${title} (x${qty})${priceTag}`;
      })
      .join('\n');
  }

  const shippingInfo = shippingAddress ? `\n📍 *Delivery To:* ${shippingAddress}` : '';

  return `🛍️ *Order Confirmed!* — *Kishor Enterprises*
${greeting}, thank you for shopping with us!

📦 *Order ID:* ${orderRef}
💰 *Total Amount:* ₹${formattedTotal}${shippingInfo}
${itemsBreakdown}

🚚 We are preparing your order. You can track status anytime in your account at https://kishorenterprises.com/orders

Need assistance? Contact our store support at +91 99636 57799.`;
}

/**
 * Sends a Meta WhatsApp Cloud API message request via native fetch
 *
 * @param {Object} payload - Graph API payload
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, raw?: any }>}
 */
async function callMetaGraphApi(payload) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION;

  if (!accessToken || !phoneNumberId) {
    console.warn('[WhatsApp Service] Meta API credentials missing in .env (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID).');
    return {
      success: false,
      error: 'Meta WhatsApp Cloud API credentials not configured in .env'
    };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP ${response.status}: Failed to dispatch WhatsApp message`;
      console.error(`[WhatsApp Service] Meta Cloud API Error: ${errorMsg}`);
      return { success: false, error: errorMsg, raw: data };
    }

    const messageId = data?.messages?.[0]?.id;
    console.log(`[WhatsApp Service] Meta WhatsApp sent successfully! Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
      raw: data
    };
  } catch (err) {
    console.error(`[WhatsApp Service] Network/Fetch Error: ${err.message}`);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send an automated WhatsApp Order Confirmation using Meta Cloud API.
 * Uses official WhatsApp Template message as mandated by Meta for business-initiated notifications.
 *
 * @param {Object} params
 * @param {string|number} params.to - Customer WhatsApp phone number
 * @param {string} [params.customerName] - Customer display name
 * @param {string} params.orderId - Unique order shortId or ID
 * @param {number|string} params.totalAmount - Order total price
 * @param {Array} [params.items] - Array of order items
 * @param {string} [params.shippingAddress] - Delivery address
 * @param {string} [params.templateName] - Custom Meta template name override
 * @param {string} [params.languageCode] - Language code (default: 'en_US' or 'en')
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendOrderConfirmationWhatsApp({
  to,
  customerName = 'Customer',
  orderId = '',
  totalAmount = 0,
  items = [],
  shippingAddress = '',
  templateName,
  languageCode = 'en_US'
}) {
  const recipient = sanitizeMetaPhoneNumber(to);

  if (!recipient) {
    console.error('[WhatsApp Service] Invalid recipient phone number.');
    return { success: false, error: 'Invalid recipient phone number' };
  }

  const selectedTemplate = templateName || process.env.WHATSAPP_TEMPLATE_NAME || DEFAULT_TEMPLATE_NAME;
  const formattedTotal = Number(totalAmount).toLocaleString('en-IN');

  // Payload: Meta WhatsApp Business Template Message
  const templatePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'template',
    template: {
      name: selectedTemplate,
      language: {
        code: languageCode
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName || 'Customer' },
            { type: 'text', text: orderId || 'Order' },
            { type: 'text', text: `₹${formattedTotal}` }
          ]
        }
      ]
    }
  };

  const result = await callMetaGraphApi(templatePayload);

  // If template is not yet approved in Meta Business Manager, fallback to free-form text
  // (Works if user has messaged within 24h customer support window)
  if (!result.success && result.raw?.error?.code === 132000) {
    console.warn(`[WhatsApp Service] Template '${selectedTemplate}' not found/approved. Retrying as direct text...`);
    return await sendDirectTextMessage({
      to: recipient,
      message: buildOrderSummaryText({ customerName, orderId, totalAmount, items, shippingAddress })
    });
  }

  return result;
}

/**
 * Send direct free-form text message via Meta Cloud API
 * Note: Only allowed within 24 hours of customer initiating a conversation
 *
 * @param {Object} params
 * @param {string|number} params.to - Customer WhatsApp phone number
 * @param {string} params.message - Raw text message to send
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendDirectTextMessage({ to, message }) {
  const recipient = sanitizeMetaPhoneNumber(to);
  if (!recipient) {
    return { success: false, error: 'Invalid recipient phone number' };
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  return await callMetaGraphApi(payload);
}

export default {
  sendOrderConfirmationWhatsApp,
  sendDirectTextMessage,
  sanitizeMetaPhoneNumber,
  buildOrderSummaryText
};
