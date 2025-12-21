#!/bin/bash

echo "[*] Cleaning old data..."
rm -f data/flows_raw.csv
rm -f data/flows.csv

echo "[*] Building and starting containers..."
# --abort-on-container-exit ensures the simulation stops once the attacker finishes
docker-compose up --build --abort-on-container-exit

echo "[*] Cleaning up containers..."
docker-compose down

echo "[*] Building flow dataset..."
python flows_builder.py

echo "[+] Experiment completed successfully."
