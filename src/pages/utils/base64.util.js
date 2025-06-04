export const toBase64 = async (str) => {
  const bytes = new TextEncoder().encode(str);
  return btoa(String.fromCharCode(...bytes));
};

