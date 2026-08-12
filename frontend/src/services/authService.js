const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sends captured selfie image blob to backend for 1:N face verification.
 * @param {Blob} imageBlob - JPEG/PNG image blob captured from webcam
 * @returns {Promise<{success: boolean, status: number, message: string, data?: {user: object}}>}
 */
export async function verifyFaceImage(imageBlob) {
  const form = new FormData();
  form.append('selfie', imageBlob, 'selfie.jpg');

  const res = await fetch(`${API_BASE_URL}/api/auth/verify-face`, {
    method: 'POST',
    body: form,
  });
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { success: false, message: `Server returned invalid response format (${res.status})` };
  }
  return { success: res.ok && data.success, status: res.status, ...data };
}

/**
 * Creates a new user profile on the backend.
 * @param {Object} userData - User registration details
 * @returns {Promise<{success: boolean, status: number, message: string, data?: {token: string, user: object}}>}
 */
export async function signUpUser(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { success: false, message: `Server returned invalid response format (${res.status})` };
  }
  return { success: res.ok && data.success, status: res.status, ...data };
}

/**
 * Registers face embedding for authenticated user.
 * @param {Blob} imageBlob - JPEG/PNG image blob
 * @param {string} token - JWT authentication token
 * @returns {Promise<{success: boolean, status: number, message: string, data?: object}>}
 */
export async function registerFaceImage(imageBlob, token) {
  const form = new FormData();
  form.append('selfie', imageBlob, 'selfie.jpg');

  const res = await fetch(`${API_BASE_URL}/api/auth/register-face`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { success: false, message: `Server returned invalid response format (${res.status})` };
  }
  return { success: res.ok && data.success, status: res.status, ...data };
}
