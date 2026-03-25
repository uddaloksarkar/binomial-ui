# 🍎 Binomial Sampler (NumPy Backend)

A real-time interactive dashboard for sampling and analyzing the **Binomial(n, p)** distribution using a **NumPy-powered backend**. This tool is designed for experimentation, visualization, and validation of binomial samplers across different regimes.

## 🚀 Features

### 🎯 Core Functionality

* Live sampling from **Binomial(n, p)** via Python/NumPy backend
* Continuous streaming of samples
* Real-time histogram visualization

### 📊 Smart Visualization

Adaptive histogram behavior based on regime:

* **Small n (n ≤ 100)** → full support `[0, n]`
* **Small λ (λ = np < 200)** → `[0, 2λ]`
* **Large regime** → concentration window
  [
  [\lambda - \sqrt{\lambda}, \lambda + \sqrt{\lambda}]
  ]

### 🧠 Expression Support

Inputs accept mathematical expressions:

```
2**52
1e-9
10**6
2**-60
```

## 🔧 Backend Setup (Python)

### Install dependencies

```bash
pip install fastapi uvicorn numpy
```

### Run server

```bash
uvicorn server:app --reload
```

### Required endpoints

```python
@app.post("/sample")
def sample_binomial(params: Params):
    return {"sample": int(np.random.binomial(params.n, params.p))}

@app.post("/np")
def compute_np(params: Params):
    return {"np": params.n * params.p}
```

## 🌐 Frontend Setup (React + Vite)

### Install

```bash
npm install
npm install recharts
```

### Run

```bash
npm run dev
```

## 🎮 Usage

1. Enter parameters:

   ```
   n = 10
   p = 0.5
   ```

   or advanced:

   ```
   n = 2**20
   p = 2**-10
   ```

2. Click **Start**

3. Observe:

   * Live sample stream
   * Histogram evolution
   * λ = np value

4. Use:

   * **Stop** → pause sampling
   * **Reset** → clear histogram

