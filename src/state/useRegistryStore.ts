import { create } from "zustand";
import { OperationRegistry } from "../services/operationRegistry";

type RegistryState = {
  registry: OperationRegistry | null;
  setRegistry: (registry: OperationRegistry) => void;
};

export const useRegistryStore = create<RegistryState>((set) => ({
  registry: null,
  setRegistry: (registry) => set({ registry }),
}));
