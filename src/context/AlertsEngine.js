// src/context/AlertsEngine.js
// Factory function, not a class.

export default function createAlertsEngine() {
  const KEY_A = "qd_alerts_v1";
  const KEY_L = "qd_alerts_log_v1";

  let alerts = [];
  let log = [];

  try {
    alerts = JSON.parse(localStorage.getItem(KEY_A)) || [];
  } catch {}

  try {
    log = JSON.parse(localStorage.getItem(KEY_L)) || [];
  } catch {}

  function persist() {
    try { localStorage.setItem(KEY_A, JSON.stringify(alerts)); } catch {}
    try { localStorage.setItem(KEY_L, JSON.stringify(log)); } catch {}
  }

  function getAlerts() {
    return alerts;
  }

  function getLog() {
    return log;
  }

  function pushEvent(event) {
    const e = {
      id: `evt-${Date.now()}`,
      ts: new Date().toISOString(),
      ...event,
    };
    log = [e, ...log].slice(0, 500);
    persist();
    return e;
  }

  function addAlert(payload) {
    const a = {
      id: `alert-${Date.now()}`,
      enabled: true,
      ...payload,
    };
    alerts = [a, ...alerts];
    persist();
    return a;
  }

  function removeAlert(id) {
    alerts = alerts.filter((a) => a.id !== id);
    persist();
    return alerts;
  }

  function toggleAlert(id) {
    alerts = alerts.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    persist();
    return alerts;
  }

  return {
    getAlerts,
    getLog,
    pushEvent,
    addAlert,
    removeAlert,
    toggleAlert,
  };
}
