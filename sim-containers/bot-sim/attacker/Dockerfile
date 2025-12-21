FROM python:3.11-slim

WORKDIR /attacker

RUN pip install requests

COPY attacker.py .

CMD ["python", "attacker.py"]
