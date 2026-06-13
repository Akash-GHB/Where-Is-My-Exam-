const TOKEN_KEY = "where_token";
const THEME_KEY = "where_theme";

// Token management
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  const token = getToken();
  return token !== null && token.length > 0;
};

// Theme management
export type Theme = "light" | "dark";

export const getTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const setTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};

// Initialize theme on app load
export const initializeTheme = (): void => {
  const theme = getTheme();
  setTheme(theme);
};
