import { create } from "zustand";

type OasState = {
  oas: unknown | null;
  setOas: (oas: unknown) => void;
};

export const useOasStore = create<OasState>((set) => ({
  oas: null,
  setOas: (oas) => set({ oas }),
}));
