// Green API WhatsApp Automation Service
// Designated 3 Free Developer Chat Numbers (Primary, Vishal, Malavika)
export const DESIGNATED_WHATSAPP_CHATS = [
  '919652456879', // Primary Connected Number
  '919949584392', // Vishal
  '918317695769', // Malavika
];

export async function sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID || '710722711905';
  const apiToken = process.env.GREEN_API_TOKEN || '01ff7bb8826749a29058dd6d107751ca67d8bfdcb9eb43d7b5';
  const baseUrl = process.env.GREEN_API_URL || 'https://7107.api.greenapi.com';

  if (!instanceId || !apiToken) {
    console.log(`[Green API WhatsApp Mode: Unconfigured / Simulated]`);
    console.log(`To: ${phoneNumber}\nMessage:\n${message}`);
    return false;
  }

  try {
    const rawDigits = phoneNumber.replace(/[^0-9]/g, '');
    const formattedPhone = rawDigits.startsWith('91') || rawDigits.length > 10 ? rawDigits : `91${rawDigits}`;
    const chatId = `${formattedPhone}@c.us`;

    const response = await fetch(
      `${baseUrl}/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          message,
        }),
      }
    );

    const data = await response.json();
    console.log(`📱 Green API WhatsApp Response for ${formattedPhone}:`, data);
    return response.ok;
  } catch (error) {
    console.error(`❌ Failed to send Green API WhatsApp notification to ${phoneNumber}:`, error);
    return false;
  }
}

// Automatically dispatches WhatsApp notification to all 3 designated chat numbers (You, Vishal, Malavika)
export async function broadcastWhatsAppBookingNotification(message: string): Promise<boolean[]> {
  console.log('📢 Broadcasting Green API WhatsApp notification to 3 designated chats (Primary, Vishal, Malavika)...');
  const results = await Promise.all(
    DESIGNATED_WHATSAPP_CHATS.map((num) => sendWhatsAppNotification(num, message))
  );
  return results;
}
