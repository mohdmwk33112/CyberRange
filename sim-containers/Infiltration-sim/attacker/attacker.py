import os
import requests
import time
import socket
import random
import json
import sys

import http.server
import socketserver
import threading

TARGET_URL = os.getenv("TARGET_URL", "http://juice-shop:3000/rest/products/search")
VICTIM_IP = os.getenv("VICTIM_IP", "juice-shop")
C2_PORT = int(os.getenv("C2_PORT", "4444"))

# --- Health Check Server ---
class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/livez':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "alive"}')
        elif self.path == '/readyz':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ready"}')
        elif self.path == '/startupz':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "started"}')
        else:
            self.send_response(404)
            self.end_headers()
    def log_message(self, format, *args):
        return

def start_health_server():
    try:
        with socketserver.TCPServer(("", 8000), HealthHandler) as httpd:
            print("[*] Health server running on port 8000")
            httpd.serve_forever()
    except Exception as e:
        print(f"[-] Failed to start health server: {e}")

# Start health server
threading.Thread(target=start_health_server, daemon=True).start()

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
    except (socket.timeout, ConnectionRefusedError, OSError):
        time.sleep(2)

print("[*] Starting Continuous 4-Stage Infiltration Simulation...")

while True:
    # 1. Reconnaissance Phase
    log_event("phase", "Stage 1: Reconnaissance - Scanning target network...", {"phase": 1})
    for i in range(5):
        try:
            # Simulate a port scan or discovery
            log_event("traffic", f"Port scan attempt {i} to {VICTIM_IP}", {"bytes": 64, "packets": 1, "packet_type": "TCP/SYN"})
            time.sleep(1)
        except Exception:
            pass
    
    # 2. Exploitation Phase (RCE-style payload)
    log_event("phase", "Stage 2: Exploitation - Sending RCE Exploit payload...", {"phase": 2})
    rce_payload = "'; process.exit(); //" # Simplified RCE-style injection
    try:
        r = requests.get(TARGET_URL, params={"q": rce_payload}, timeout=5)
        log_event("attack", f"Exploit sent to {TARGET_URL}", {"status_code": r.status_code, "traffic_bytes": len(rce_payload)})
    except Exception as e:
        log_event("error", f"Exploit failed: {str(e)}")
    time.sleep(3)

    # 3. Infiltration / C2 Phase
    log_event("phase", f"Stage 3: Infiltration - Establishing C2 communication on port {C2_PORT}...", {"phase": 3})
    for i in range(10): 
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2)
                # We try to connect to the C2 port; it might fail, which is fine for simulation
                s.connect((VICTIM_IP, C2_PORT))
                msg = f"heartbeat_{i}".encode()
                s.sendall(msg)
                log_event("traffic", f"C2 heartbeat {i} sent", {"bytes": len(msg), "packets": 1, "packet_type": "TCP"})
        except Exception as e:
            # Still record the traffic as an 'attempt'
            log_event("traffic", f"C2 heartbeat {i} attempted", {"bytes": 64, "packets": 1, "packet_type": "TCP/SYN", "error": str(e)})
        
        time.sleep(1)

    # 4. Exfiltration Phase
    log_event("phase", "Stage 4: Exfiltration - Stealing sensitive data...", {"phase": 4})
    for i in range(5):
        try:
            # Simulate data exfiltration via POST
            data = {"file": f"database_dump_{i}.sql", "content": "BASE64_ENCODED_DATA..."}
            log_event("traffic", f"Exfiltrating chunk {i}", {"bytes": 1024, "packets": 2, "packet_type": "TCP/POST"})
            time.sleep(1.5)
        except Exception:
            pass

    log_event("complete", "Infiltration simulation cycle completed successfully. Restarting in 10s...", {"status": "success"})
    time.sleep(10)
