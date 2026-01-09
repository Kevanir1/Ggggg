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
  // apply token to api client and fetch user info via /auth/me
  setAuthToken(token);
  try {
    const me = await apiClient.get('/auth/me');
    if (!me || me.status !== 'success' || !me.user) {
      // couldn't fetch user details; do not purge token here (avoid clearing on 500)
      return null;
    }

    const sess: Session = { user_id: me.user.id, role: me.user.role };

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
  } catch (err) {
    // Do not clear token on server errors; just return null so UI can decide.
    return null;
  }
}

export function clearSession() {
  _session = null;
}
