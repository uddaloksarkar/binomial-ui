import { useState, useRef, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BinomialStream() {
  const [nInput, setNInput] = useState("10");
  const [pInput, setPInput] = useState("0.5");

  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState([]);
  const [lambda, setLambda] = useState(null);

  const containerRef = useRef(null);
  const runningRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // -------- Expression evaluator --------
  const evaluate = (expr) => {
    try {
      return Function(`"use strict"; return (${expr})`)();
    } catch {
      return null;
    }
  };

  // -------- Fetch lambda --------
  const fetchLambda = async () => {
    const n = evaluate(nInput);
    const p = evaluate(pInput);
    if (n === null || p === null) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/np", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ n, p }),
      });
      if (!res.ok) return;

      const data = await res.json();
      setLambda(data.np);
    } catch {}
  };

  useEffect(() => {
    fetchLambda();
  }, [nInput, pInput]);

  // -------- Auto-scroll --------
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight;
    }
  }, [samples]);

  // -------- Sampling --------
  const fetchSample = async () => {
    const n = evaluate(nInput);
    const p = evaluate(pInput);

    if (n === null || p === null) return null;
    if (p < 0 || p > 1) return null;

    try {
      const res = await fetch("http://127.0.0.1:8000/sample", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ n, p }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.sample;
    } catch {
      return null;
    }
  };

  const loop = async () => {
    while (runningRef.current) {
      const sample = await fetchSample();

      if (!runningRef.current) break;
      if (sample === null) continue;

      setSamples((prev) => {
        const next = [...prev, sample];
        return next.slice(-500);
      });

      await new Promise((r) => setTimeout(r, 120));
    }
  };

  const start = () => {
    if (runningRef.current) return;

    setSamples([]);
    setRefreshKey((k) => k + 1);

    runningRef.current = true;
    setRunning(true);
    loop();
  };

  const stop = () => {
    runningRef.current = false;
    setRunning(false);
  };

  // -------- Histogram --------
  const histogramData = useMemo(() => {
    const n = evaluate(nInput);
    if (lambda === null || n === null) return [];

    if (n <= 200) {
      const counts = Array(n + 1).fill(0);
      samples.forEach((s) => {
        if (s >= 0 && s <= n) counts[s]++;
      });
      return counts.map((count, k) => ({ value: k, count }));
    }

    if (lambda <= 200) {
      const maxK = Math.floor(lambda + Math.sqrt(lambda));
      const counts = Array(maxK + 1).fill(0);
      samples.forEach((s) => {
        if (s >= 0 && s <= maxK) counts[s]++;
      });
      return counts.map((count, k) => ({ value: k, count }));
    }

    const counts = {};
    samples.forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });

    return Object.keys(counts)
      .map((k) => ({ value: Number(k), count: counts[k] }))
      .sort((a, b) => a.value - b.value);
  }, [samples, lambda, nInput]);

  // -------- X-axis domain --------
  const xDomain = useMemo(() => {
    const n = evaluate(nInput);

    if (lambda === null || n === null) return [0, 10];

    // 🟢 Case 1: small n
    if (n <= 1000) {
      return [0, n];
    }

    // 🟡 Case 2: small λ
    if (lambda < 200) {
      return [0, Math.ceil(2 * lambda)];
    }

    // 🔴 Case 3: concentration window
    const lower = Math.max(0, Math.floor(lambda - Math.sqrt(lambda)));
    const upper = Math.ceil(lambda + Math.sqrt(lambda));

    return [lower, upper];
  }, [lambda, nInput]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F7",
        padding: "30px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#1d1d1f",
      }}
    >
    <div style={{ textAlign: "center", marginBottom: "16px" }}>
      <div style={{ fontSize: "28px", fontWeight: 600 }}>
        Binomial Sampler
      </div>
      <div style={{ fontSize: "18px", opacity: 0.6 }}>
        Powered by NumPy(v2.0.2)
      </div>
    </div>

      {/* Inputs */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontWeight: "500", minWidth: "24px" }}>n:</label>
          <input
            type="text"
            value={nInput}
            onChange={(e) => setNInput(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d0d0d0",
              width: "100px",
              fontSize: "14px",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontWeight: "500", minWidth: "24px" }}>p:</label>
          <input
            type="text"
            value={pInput}
            onChange={(e) => setPInput(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d0d0d0",
              width: "100px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Lambda */}
      <div style={{ textAlign: "center", marginTop: "10px", opacity: 0.6 }}>
        n.p = {lambda ?? "—"}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
        <button
          onClick={() => {
            runningRef.current = false;
            setRunning(false);
            setSamples([]);
            setRefreshKey((k) => k + 1);
          }}
        >
          Reset
        </button>
      </div>

      {/* Layout */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        {/* Stream */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            height: "300px",
            overflowY: "auto",
            background: "white",
            borderRadius: "12px",
            padding: "10px",
            border: "1px solid #ddd",
            fontFamily: "monospace",
          }}
        >
          {samples.map((s, i) => (
            <div key={i}>
              [{i}] → {s}
            </div>
          ))}
        </div>

        {/* Histogram */}
        <div
          style={{
            flex: 2,
            height: "300px",
            background: "white",
            borderRadius: "12px",
            padding: "10px",
            border: "1px solid #ddd",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} key={refreshKey}>
              <XAxis
                dataKey="value"
                type="number"
                domain={xDomain}
                allowDataOverflow={true}
              />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#007AFF"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}