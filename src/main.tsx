import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setAuthToken } from '@/lib/apiClient';

// restore token from localStorage (if present) and initialize session
const token = localStorage.getItem('medapp_token');
if (token) {
	setAuthToken(token);
	// initialize session data in-memory
	import('@/lib/session').then(({ ensureSession }) => ensureSession()).catch(() => null);
}

createRoot(document.getElementById("root")!).render(<App />);
