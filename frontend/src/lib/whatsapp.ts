// Green API WhatsApp Automation Service
export async function sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!instanceId || !apiToken) {
    console.log(`[Green API WhatsApp Mode: Unconfigured / Simulated]`);
    console.log(`To: ${phoneNumber}\nMessage:\n${message}`);
    return false;
  }

  try {
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    const chatId = `${formattedPhone}@c.us`;

    const response = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
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
    console.log('📱 Green API WhatsApp Response:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Failed to send Green API WhatsApp notification:', error);
    return false;
  }
}
