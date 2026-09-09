const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export const sendPushNotification = async (pushToken, { title, body, data = {} }) => {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
       Accept: "application/json",
    },
    body: JSON.stringify({ to: pushToken, title, body, data, sound: "default" }),
  });

  if (!response.ok) {
    console.error(`[push] Failed to send notification to ${pushToken}`);
    return null;
  }

  return response.json();
};