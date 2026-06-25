const tokenKey = "minerva.accessToken";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(tokenKey);
  },

  set(token: string): void {
    window.localStorage.setItem(tokenKey, token);
  },

  clear(): void {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(tokenKey);
    }
  }
};
