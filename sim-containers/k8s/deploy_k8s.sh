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
# Federated IDS
docker build -t fl-ids:latest "$PROJECT_ROOT/fl-ids"
# IDS Agent Sidecar
docker build -t local/ids-agent:latest "$PROJECT_ROOT/ids-agent"

echo "[*] Deploying Simulations..."

# Clean up any potential old jobs/deployments first (though apply handles updates usually)
kubectl delete deployment bot-attacker --namespace $NAMESPACE --ignore-not-found
kubectl delete deployment ddos-attacker --namespace $NAMESPACE --ignore-not-found
kubectl delete deployment infiltration-attacker --namespace $NAMESPACE --ignore-not-found
kubectl delete deployment fl-ids-deployment --namespace $NAMESPACE --ignore-not-found

# Apply Deployments
kubectl apply -f "$SCRIPT_DIR/bot/bot-sim.yaml"
kubectl apply -f "$SCRIPT_DIR/ddos/ddos-sim.yaml"
kubectl apply -f "$SCRIPT_DIR/infiltration/infiltration-sim.yaml"
kubectl apply -f "$SCRIPT_DIR/fl-ids/fl-ids.yaml"

# Apply HPAs
echo "[*] Applying Autoscalers (HPA)..."
kubectl apply -f "$SCRIPT_DIR/bot/bot-hpa.yaml"
kubectl apply -f "$SCRIPT_DIR/ddos/ddos-hpa.yaml"
kubectl apply -f "$SCRIPT_DIR/infiltration/infiltration-hpa.yaml"
kubectl apply -f "$SCRIPT_DIR/fl-ids/fl-ids-hpa.yaml"

echo "[*] Waiting for deployments to be ready..."
kubectl rollout status deployment/bot-attacker -n $NAMESPACE
kubectl rollout status deployment/ddos-attacker -n $NAMESPACE
kubectl rollout status deployment/infiltration-attacker -n $NAMESPACE
kubectl rollout status deployment/fl-ids-deployment -n $NAMESPACE

echo "[+] Deployment complete. Attack simulations are running continuously."
echo "[*] NOTE: To collect data, you must manually run 'python flows_builder.py' in the respective experiment folders after sufficient traffic has been generated."
echo "[*] Monitor pods with: kubectl get pods -n $NAMESPACE"

