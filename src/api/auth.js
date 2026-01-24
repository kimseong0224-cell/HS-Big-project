export const CURRENT_USER_ID_KEY = "currentUserId";
export const IS_LOGGED_IN_KEY = "isLoggedIn";

export const getCurrentUserId = () => {
  try {
    return localStorage.getItem(CURRENT_USER_ID_KEY);
  } catch {
    return null;
  }
};

export const setCurrentUserId = (userId) => {
  if (userId === undefined || userId === null || userId === "") return;
  try {
    localStorage.setItem(CURRENT_USER_ID_KEY, String(userId));
  } catch {
    return;
  }
};

export const clearCurrentUserId = () => {
  try {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  } catch {
    return;
  }
};

export const getIsLoggedIn = () => {
  try {
    return localStorage.getItem(IS_LOGGED_IN_KEY) === "true";
  } catch {
    return false;
  }
};

export const setIsLoggedIn = (value) => {
  try {
    localStorage.setItem(IS_LOGGED_IN_KEY, value ? "true" : "false");
  } catch {
    return;
  }
};

export const clearIsLoggedIn = () => {
  try {
    localStorage.removeItem(IS_LOGGED_IN_KEY);
  } catch {
    return;
  }
};
