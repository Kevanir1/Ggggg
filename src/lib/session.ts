import apiClient, { setAuthToken } from './apiClient';

type Session = {
  user_id: number | null;
  role: string | null;
  doctor_id?: number | null;
  patient_id?: number | null;
};

let _session: Session | null = null;

export function getSession(): Session | null {
  return _session;
}

// Ensure session initializes from token in localStorage.
// Returns null if no valid session (no token or token invalid/expired).
export async function ensureSession(): Promise<Session | null> {
  if (_session) return _session;
  const token = localStorage.getItem('medapp_token');
  if (!token) return null;

  try {
    const verify = await apiClient.get('/auth/verify');
    if (!verify || verify.status !== 'success') {
      // invalid token
      localStorage.removeItem('medapp_token');
      setAuthToken(null);
      return null;
    }

    const sess: Session = { user_id: verify.user_id, role: verify.role };

    if (sess.role === 'doctor') {
      try {
        const doc = await apiClient.get(`/user/doctor/${sess.user_id}`);
        if (doc && doc.status === 'success' && doc.doctor) sess.doctor_id = doc.doctor.id;
      } catch (err) {
        // ignore non-critical
      }
    } else if (sess.role === 'user') {
      try {
        const pat = await apiClient.get(`/user/patient/${sess.user_id}`);
        if (pat && pat.status === 'success' && pat.patient) sess.patient_id = pat.patient.id;
      } catch (err) {
        // ignore non-critical
      }
    }

    _session = sess;
    return _session;
  } catch (err: any) {
    // If API returned 401 or similar, clear token
    try {
      const msg = (err && err.message) || '';
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('medapp_token');
        setAuthToken(null);
      }
    } catch (_) {}
    return null;
  }
}

export function clearSession() {
  _session = null;
}
