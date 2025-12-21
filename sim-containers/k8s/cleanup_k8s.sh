#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "[*] Deleting Kubernetes Simulation Resources..."

kubectl delete -f "$SCRIPT_DIR/bot/bot-sim.yaml" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/ddos/ddos-sim.yaml" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/infiltration/infiltration-sim.yaml" --ignore-not-found
kubectl delete -f "$SCRIPT_DIR/base/storage.yaml" --ignore-not-found

echo "[+] Cleanup complete."
