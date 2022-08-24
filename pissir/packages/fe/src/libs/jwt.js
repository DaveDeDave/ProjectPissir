export const getData = (token) => {
  if (!token) return;
  try {
    return JSON.parse(atob(token.split(".")[1]).toString());
  } catch (e) {
    return;
  }
};
