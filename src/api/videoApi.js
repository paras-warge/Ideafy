import { FLASK_API_URL } from '../utils/ip';

export async function getVideoInfo(url) {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/video/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    return data;
  } catch (_error) {
    return { success: false, error: 'Could not reach server' };
  }
}

export async function detectPlatform(url) {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/video/detect-platform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return await response.json();
  } catch (_error) {
    return { success: false, platform: 'unknown' };
  }
}

export async function checkServerHealth() {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/healthz`);
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}