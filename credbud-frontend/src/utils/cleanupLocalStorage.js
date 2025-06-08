export const cleanupLocalStorage = () => {
  const now = new Date();

  const item = JSON.parse(localStorage.userProfile);

  if (item.expiry && now.getTime() > item.expiry) {
    localStorage.removeItem("userProfile");
  }
};