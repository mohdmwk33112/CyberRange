FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including SSL certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Update CA certificates for SSL
RUN update-ca-certificates

COPY requirements.txt .

# Use HTTPS with proper SSL - install one by one for better error tracking
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=600 xgboost && \
    pip install --no-cache-dir --default-timeout=600 scikit-learn && \
    pip install --no-cache-dir --default-timeout=600 pandas && \
    pip install --no-cache-dir flask gunicorn

COPY ids_server.py federated_ids_model.json feature_names.json ./

EXPOSE 5000
ENV PORT=5000

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "ids_server:app"]