#!/bin/bash

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NAMESPACE="simulations"

echo "[*] Initializing Kubernetes Namespace and Storage..."
kubectl apply -f "$SCRIPT_DIR/base/storage.yaml"

echo "[*] Building Attacker Images (Docker Desktop context)..."

# Bot Attacker
docker build -t local/bot-attacker:latest "$PROJECT_ROOT/bot-sim/attacker"
# DDoS Attacker
docker build -t local/ddos-attacker:latest "$PROJECT_ROOT/ddos-simulator/attacker"
# Infiltration Attacker
docker build -t local/infiltration-attacker:latest "$PROJECT_ROOT/Infiltration-sim/attacker"

echo "[*] Deploying Simulations..."

kubectl delete job bot-attacker --namespace $NAMESPACE --ignore-not-found
kubectl delete job ddos-attacker --namespace $NAMESPACE --ignore-not-found
kubectl delete job infiltration-attacker --namespace $NAMESPACE --ignore-not-found

kubectl apply -f "$SCRIPT_DIR/bot/bot-sim.yaml"
kubectl apply -f "$SCRIPT_DIR/ddos/ddos-sim.yaml"
kubectl apply -f "$SCRIPT_DIR/infiltration/infiltration-sim.yaml"

echo "[*] Waiting for simulations to complete..."
kubectl wait --for=condition=complete job/bot-attacker -n simulations --timeout=300s || echo "[!] Bot simulation did not complete in time."
kubectl wait --for=condition=complete job/ddos-attacker -n simulations --timeout=300s || echo "[!] DDoS simulation did not complete in time."
kubectl wait --for=condition=complete job/infiltration-attacker -n simulations --timeout=300s || echo "[!] Infiltration simulation did not complete in time."

echo "[*] Automatically processing data..."
# Use subshells (parentheses) to change directory and run builder without affecting the current shell's path
(cd "$PROJECT_ROOT/bot-sim" && python flows_builder.py)
(cd "$PROJECT_ROOT/ddos-simulator" && python flows_builder.py)
(cd "$PROJECT_ROOT/Infiltration-sim" && python flows_builder.py)

echo "[+] Deployment and data processing complete."
echo "[*] Monitor pods with: kubectl get pods -n $NAMESPACE"

