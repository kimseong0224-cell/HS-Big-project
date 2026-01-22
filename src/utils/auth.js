export const getToken = () => localStorage.getItem("accessToken");
export const setToken = (token) => localStorage.setItem("accessToken", token);
export const clearToken = () => localStorage.removeItem("accessToken");
export const isLoggedIn = () => !!getToken();

// 투자 라운지(로컬 게시글)에서 작성자 구분용.
// 1) 앱이 저장해둔 userId/memberId 등이 있으면 우선 사용
// 2) accessToken이 JWT라면 payload에서 id/sub 등을 추출 시도
export const getCurrentUserId = () => {
  try {
    const candidateKeys = [
      "userId",
      "memberId",
      "id",
      "uid",
      "user_id",
      "member_id",
      "email",
    ];
    for (const k of candidateKeys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }

    const token = getToken();
    if (!token) return null;

    // JWT: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json);

    return (
      payload?.userId ??
      payload?.id ??
      payload?.memberId ??
      payload?.sub ??
      payload?.email ??
      null
    );
  } catch (e) {
    console.warn("getCurrentUserId failed:", e);
    return null;
  }
};

