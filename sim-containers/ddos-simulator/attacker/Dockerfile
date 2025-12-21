FROM python:3.11-slim

WORKDIR /sim

RUN pip install requests pandas

COPY simulate_ddos.py .

CMD ["python", "simulate_ddos.py"]
