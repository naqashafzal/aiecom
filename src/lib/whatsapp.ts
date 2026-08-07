import { getCachedSettings } from "./cache";

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If it starts with 0 (e.g. 03001234567), assume Pakistan +92
  if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = '92' + cleanPhone.substring(1);
  }
  
  // Return without + as Meta API requires just numbers
  return cleanPhone;
};

export const sendWhatsAppMessage = async (toPhone: string, message: string) => {
  const settings = await getCachedSettings();
  const token = settings.whatsapp_api_token || process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = settings.whatsapp_phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("WhatsApp API credentials missing. Skipping message.");
    return false;
  }

  const formattedPhone = formatPhoneNumber(toPhone);

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("WhatsApp API Error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
};
