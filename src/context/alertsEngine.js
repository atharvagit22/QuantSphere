// src/context/AlertsEngine.js
//
// Simple alerts registry + history used by DataContext.
// Factory function — NOT a class.

export default function createAlertsEngine() {
  const KEY_ALERTS = "qd_alerts_v1";
  const KEY_LOG = "qd_alerts_log_v1";

  let alerts = [];
  let log = [];

  // Load existing alerts
  try {
    const raw = localStorage.getItem(KEY_ALERTS);
    if (raw) alerts = JSON.parse(raw) || [];
  } catch {}

  // Load existing log
  try {
    const raw = localStorage.getItem(KEY_LOG);
    if (raw) log = JSON.parse(raw) || [];
  } catch {}

  function persist() {
    try {
      localStorage.setItem(KEY_ALERTS, JSON.stringify(alerts));
    } catch {}
    try {
      localStorage.setItem(KEY_LOG, JSON.stringify(log));
    } catch {}
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
