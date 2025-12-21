#!/bin/bash

echo "[*] Ensuring clean state..."
docker-compose down -v --remove-orphans

echo "[*] Cleaning old simulation data..."
rm -f data/flows_raw.csv
rm -f data/flows.csv
rm -f data/ddos_stats.csv

echo "[*] Building and starting containers..."
# --abort-on-container-exit ensures the simulation stops once the attacker finishes
docker-compose up --build --abort-on-container-exit

echo "[*] Cleaning up containers..."
docker-compose down

echo "[*] Processing raw attack data..."
python flows_builder.py

echo "[+] DDoS Attack Simulation automated pipeline completed successfully."
