# dashboard.py
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
import numpy as np
import math

def run_binomial_dashboard(n, p, samples):
    app = Dash(__name__)

    app.layout = html.Div([
        html.H2("Binomial Sampler (NumPy Backend)"),

        dcc.Graph(id="histogram"),

        dcc.Interval(
            id="interval",
            interval=500,
            n_intervals=0
        )
    ])

    @app.callback(
        Output("histogram", "figure"),
        Input("interval", "n_intervals")
    )
    def update_histogram(_):
        data = samples[-1000:]
        lam = n * p

        hist = go.Histogram(
            x=data,
            nbinsx=50,
            marker=dict(color="#007AFF")
        )

        # -------- X-axis logic --------
        if len(data) < 20:
            x_range = [0, lam]
        elif n <= 100:
            x_range = [0, n]
        elif lam < 200:
            x_range = [0, 2 * lam]
        else:
            lower = max(0, lam - np.sqrt(lam))
            upper = lam + np.sqrt(lam)
            x_range = [lower, upper]

        layout = go.Layout(
            title=f"n = 2^{int(math.log2(n))}, \t  p = 2^{int(math.log2(p))},  \t np = {lam:.2f}",
            xaxis=dict(title="Value", range=x_range),
            yaxis=dict(title="Count"),
            template="plotly_white"
        )

        return go.Figure(data=[hist], layout=layout)

    app.run(debug=False)