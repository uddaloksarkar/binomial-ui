from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI()

# -------- CORS (important for frontend) --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- Input model --------
class Params(BaseModel):
    n: int
    p: float

# -------- Health check --------
@app.get("/")
def root():
    return {"status": "Binomial Sampler Backend Running"}

# -------- Sample endpoint --------
@app.post("/sample")
def sample_binomial(params: Params):
    n, p = params.n, params.p

    try:
        # basic validation
        if n < 0:
            return {"error": "n must be >= 0"}
        if not (0 <= p <= 1):
            return {"error": "p must be in [0,1]"}

        sample = int(np.random.binomial(n, p))
        return {"sample": sample}

    except Exception as e:
        # do NOT crash → frontend will ignore
        return {"error": str(e)}

# -------- Lambda (np) endpoint --------
@app.post("/np")
def compute_np(params: Params):
    n, p = params.n, params.p

    try:
        if n < 0:
            return {"error": "n must be >= 0"}
        if not (0 <= p <= 1):
            return {"error": "p must be in [0,1]"}

        return {"np": n * p}

    except Exception as e:
        return {"error": str(e)}