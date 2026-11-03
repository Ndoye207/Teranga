const resetters = new Set<() => void>();

export const registerReset = (fn: () => void) => {
  resetters.add(fn);
};

export const resetAllStores = () => {
  resetters.forEach((fn) => fn());
};
