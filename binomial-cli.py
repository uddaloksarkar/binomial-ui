import threading
from dashboard import run_binomial_dashboard
import numpy as np
import time


def sampling_loop(n, p, samples, stop_flag):
    while not stop_flag[0]:
        try:
            samples.append(int(np.random.binomial(n, p)))

            if len(samples) > 5000:
                del samples[:-2000]

            time.sleep(0.01)

        except Exception:
            pass


if __name__ == "__main__":
   
    n = 2**57
    p = 2**(-54) # 2**(-54)

    samples = []
    stop_flag = [False] 
    threading.Thread(
        target=sampling_loop,
        args=(n, p, samples, stop_flag),
        daemon=True
    ).start()

    try:
        run_binomial_dashboard(n, p, samples)
    finally:
        stop_flag[0] = True