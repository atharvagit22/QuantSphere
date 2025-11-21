// src/context/WebSocketManager.js
// Improved single-connection WebSocket manager with safer connect/disconnect and throttling.

export default function WebSocketManager() {
  let ws = null;
  let symbol = null;
  let type = null;
  let lastMsgTs = 0;
  const subscribers = new Set();
  let reconnectTimer = null;
  const THROTTLE_MS = 100; // allow slightly higher rate for second-level ticks

  function _clearReconnect() {
    try { clearTimeout(reconnectTimer); } catch {}
    reconnectTimer = null;
  }

  function _safeClose() {
    if (!ws) return;
    // If still connecting, defer close until open/close to avoid browser error
    try {
      if (ws.readyState === WebSocket.CONNECTING) {
        // mark to close after open
        const pending = ws;
        // once open or closed, close it
        const cleanup = () => {
          try { pending.close(); } catch {}
          pending.onopen = pending.onclose = pending.onerror = pending.onmessage = null;
        };
        pending.onopen = cleanup;
        pending.onclose = cleanup;
        return;
      }
      ws.close();
    } catch (err) {}
  }

  function connect(sym, opts = { type: "trade" }) {
    if (!sym) return null;
    const s = sym.toLowerCase();
    const stream = opts.type === "depth" ? `${s}@depth@100ms` : `${s}@trade`;
    const url = `wss://stream.binance.com:9443/ws/${stream}`;

    // reuse same connection if identical
    if (ws && symbol === s && type === opts.type && ws.readyState === WebSocket.OPEN) {
      return ws;
    }

    // close previous safely
    try { _safeClose(); } catch {}

    symbol = s;
    type = opts.type;

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        _clearReconnect();
        try { console.info(`[WS] OPEN: ${url}`); } catch {}
      };

      ws.onmessage = (evt) => {
        try {
          const now = Date.now();
          if (now - lastMsgTs < THROTTLE_MS) return;
          lastMsgTs = now;
          const payload = JSON.parse(evt.data);
          subscribers.forEach((h) => {
            try { h(payload); } catch (e) { console.warn("subscriber error", e); }
          });
        } catch (err) {
          // ignore parse / handler errors
        }
      };

      ws.onclose = (e) => {
        try { console.warn("[WS] CLOSED. Reconnecting…", e.code); } catch {}
        _clearReconnect();
        // backoff reconnect
        reconnectTimer = setTimeout(() => {
          try { connect(symbol, { type }); } catch {}
        }, 1500 + Math.random() * 2000);
      };

      ws.onerror = (e) => {
        try { console.warn("[WS] ERROR", e); } catch {}
        try { ws.close(); } catch {}
      };

      return ws;
    } catch (err) {
      console.error("[WS] connect error", err);
      return null;
    }
  }

  function disconnect() {
    _clearReconnect();
    try { _safeClose(); } catch {}
    ws = null;
    symbol = null;
    type = null;
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return;
    subscribers.add(fn);
  }
  function unsubscribe(fn) {
    try { subscribers.delete(fn); } catch {}
  }

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    _internals: { get ws() { return ws; }, subscribers },
  };
}
