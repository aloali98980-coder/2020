const SESSION_KEY = "clubowner.auth.session";
const listeners = new Set();

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const session = getSession();
  return !!session?.token;
}

export function getCurrentUser() {
  return getSession()?.user || null;
}

function setSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  for (const fn of listeners) {
    try {
      fn(session);
    } catch (err) {
      console.error(err);
    }
  }
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function register(email, username, password) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "تعذر إنشاء الحساب.");
  }
  const session = {
    token: data.token,
    user: data.user,
    lastSync: null,
  };
  setSession(session);
  return session;
}

export async function login(identifier, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "تعذر تسجيل الدخول.");
  }
  const session = {
    token: data.token,
    user: data.user,
    lastSync: null,
  };
  setSession(session);
  return session;
}

export async function logout() {
  const session = getSession();
  if (session?.token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
    } catch {
      // Ignore network failure on logout
    }
  }
  setSession(null);
}

export async function checkAuth() {
  const session = getSession();
  if (!session?.token) return null;
  try {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    if (!res.ok) {
      setSession(null);
      return null;
    }
    const data = await res.json();
    if (data.ok && data.user) {
      session.user = data.user;
      setSession(session);
      return session;
    }
  } catch {
    // If offline, keep local session
  }
  return session;
}
