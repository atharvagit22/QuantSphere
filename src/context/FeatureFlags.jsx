// src/context/FeatureFlags.jsx
import React, { createContext, useContext, useState } from "react";

const defaultFlags = {
  dashboardPowerPack: true,
  signalsProPack: true,
  riskMasterPack: true,
  compareProUltra: true,
  liveMarketPlus: true,
  portfolioAlphaPack: true,
  uiUxEnhancerPack: true,
  settingsPowerPanel: true,
};

const FeatureFlagsContext = createContext({
  flags: defaultFlags,
  setFlag: (k, v) => {},
  toggle: (k) => {},
});

export function FeatureFlagsProvider({ children, initial = {} }) {
  const [flags, setFlags] = useState({ ...defaultFlags, ...initial });
  const setFlag = (k, v) => setFlags((s) => ({ ...s, [k]: v }));
  const toggle = (k) => setFlags((s) => ({ ...s, [k]: !s[k] }));
  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag, toggle }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
