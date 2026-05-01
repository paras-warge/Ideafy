export const FLASK_API_URL = "https://lustfully-unrest-magnolia.ngrok-free.dev"; // ← replace with ngrok

 
export async function getPublicIP() {
  const res = await fetch("https://api.ipify.org?format=json");
  const data = await res.json();
  return data?.ip || null;
}