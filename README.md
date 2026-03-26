# 🍎 Binomial Sampler (NumPy Backend)

A real-time interactive dashboard for sampling and analyzing the **Binomial(n, p)** distribution using a **NumPy-powered backend**.

This project supports **two modes**:

1. 🧪 **Python Interactive Dashboard (Dash)**
2. 🌐 **Web UI (React + FastAPI)**

Designed for experimentation, visualization, and validation of binomial samplers across different regimes.



## 🧪 Python Interactive Dashboard (Dash)

A lightweight, self-contained visualization using **Dash + Plotly**.


```text
main.py         # sampling loop (NumPy)
dashboard.py    # Dash visualization
```

#### ⚙️ Setup

```bash
pip install numpy dash plotly
```

#### ▶️ Run

```bash
python main.py
```

Open:

```
http://127.0.0.1:8050
```

#### 🎮 Usage

Edit parameters in `main.py`:

```python
n = 2**57
p = 2**(-54)
```

Run and observe:

* 📈 Live histogram
* 🔢 Current parameters (n, p, λ)
* 📊 Adaptive scaling


## 🌐 Web UI (React + FastAPI)


#### 🔧 Backend Setup

```bash
pip install fastapi uvicorn numpy
```

Run:

```bash
uvicorn server:app --reload
```

#### 🌐 Frontend Setup

```bash
npm install
npm install recharts
npm run dev
```

#### 🎮 Usage

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
* Histogram updates
* λ = np display

4. Controls:

* **Start** → begin sampling
* **Stop** → pause
* **Reset** → clear histogram

