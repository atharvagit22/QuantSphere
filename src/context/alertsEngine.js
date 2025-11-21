// AlertsEngine.js
// Simple alerts registry and history for DataContext to delegate to.
// Exposes: getAlerts, addAlert, removeAlert, toggleAlert, getLog, pushEvent

export default function createAlertsEngine() {
  const KEY_A = "qd_alerts_v1";
  const KEY_L = "qd_alerts_log_v1";

  let alerts = [];
  let log = [];

  try {
    const raw = localStorage.getItem(KEY_A);
    if (raw) alerts = JSON.parse(raw) || [];
  } catch {}
  try {
    const raw = localStorage.getItem(KEY_L);
    if (raw) log = JSON.parse(raw) || [];
  } catch {}

  function persist() {
    try { localStorage.setItem(KEY_A, JSON.stringify(alerts || [])); } catch {}
    try { localStorage.setItem(KEY_L, JSON.stringify(log || [])); } catch {}
  }

  function getAlerts() { return alerts; }
  function getLog() { return log; }

  function pushEvent(event) {
    const e = { id: `evt-${Date.now()}`, ts: new Date().toISOString(), ...event };
    log = [e, ...log].slice(0, 300);
    persist();
    return e;
  }

  function addAlert(payload) {
    const a = { id: `alert-${Date.now()}`, enabled: true, ...payload };
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
    alerts = alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
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
