import { useMemo } from "react";

export function useProviderValueMemo(valueObj) {
  return useMemo(() => valueObj, Object.values(valueObj));
}
