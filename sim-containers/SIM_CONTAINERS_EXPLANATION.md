# Sim-Containers Directory Explanation

This document provides a detailed explanation of the `sim-containers` directory, which houses the containerized simulations for the Cyber Range project. It includes attack simulators (Infiltration, Botnet, DDoS), a Federated Learning IDS component, and Kubernetes deployment scripts.

## Directory Structure

```
sim-containers/
├── Infiltration-sim/       # Infiltration attack simulation
├── bot-sim/                # Botnet attack simulation
├── ddos-simulator/         # DDoS attack simulation
├── fl-ids/                 # Federated Learning Intrusion Detection System
└── k8s/                    # Kubernetes deployment and orchestration
```

---

## 1. Attack Simulators
 The directories `Infiltration-sim`, `bot-sim`, and `ddos-simulator` share a common structure designed to run specific attack scenarios, collect network traffic, and process it into a dataset for machine learning.

### Common File Structure
Each simulator directory contains:
- **`attacker/`**: Contains the source code for the attack simulation.
- **`data/`**: Shared volume to store raw traffic logs (`flows_raw.csv`) and processed datasets (`flows.csv`).
- **`docker-compose.yml`**: Orchestrates the attacker and victim containers locally.
- **`flows_builder.py`**: Python script to process raw network traffic into CIC-IDS 2017 style features.
- **`run_experiment.sh`**: Helper script to run the full simulation lifecycle.

### Component Details

#### `attacker/attacker.py` (Example from Infiltration-sim)
This script is the core of the simulation. It runs an infinite loop to simulate malicious behavior.
- **Phase 1: Exploitation**: Sends a simulated RCE (Remote Code Execution) payload to a target URL (e.g., Juice Shop).
- **Phase 2: Infiltration/C2**: Simulates Command & Control (C2) traffic by repeatedly connecting to a specific port on the victim machine and sending "heartbeat" messages.
- **Health Check**: Runs a simple HTTP server on port 8000 to report container health.
- **Logging**: Emits structured JSON logs to stdout, which can be picked up by logging drivers.

#### `flows_builder.py`
This script transforms raw network packet logs (likely captured via tshark/tcpdump and exported to CSV) into a machine learning-ready dataset.
- **Input**: `data/flows_raw.csv` (Raw packet export).
- **Output**: `data/flows.csv` (Processed flow data with 76 features).
- **Key Logic**:
    - **Grouping**: Groups packets by `flow_id` (Source IP, Source Port, Dest IP, Dest Port, Protocol).
    - **Feature Engineering**: Calculates statistical features for each flow, including:
        - **Timings**: Flow Duration, Inter-Arrival Times (IAT) (Mean, Std, Max, Min).
        - **Packet Stats**: Total packets, Total bytes, Packet lengths (Max, Min, Mean, Std).
        - **Flags**: Counts of TCP flags (FIN, SYN, RST, PSH, ACK, URG, etc.).
        - **Subflows**: Forward and Backward direction statistics.
    - **Output Format**: Ensure columns match the standard CIC-IDS 2017 dataset format for compatibility with pre-trained models.

#### `run_experiment.sh`
Automates the experiment workflow:
1. **Cleanup**: Removes old data from `data/`.
2. **Execution**: Runs `docker-compose up --build --abort-on-container-exit`. This builds the containers and runs them until the attacker finishes (or runs indefinitely until stopped).
3. **Processing**: Runs `python flows_builder.py` to generate the dataset from the collected traffic.

---

## 2. Federated Learning IDS (`fl-ids`)
This directory contains the deployment logic for the Intrusion Detection System that uses a model trained via Federated Learning.

### Files
- **`ids_server.py`**: A Flask-based REST API server.
    - **Startup**: Loads the XGBoost model (`federated_ids_model.json`) and feature metadata (`feature_names.json`).
    - **`/predict` Endpoint**: Accepts a JSON payload containing network traffic features, converts them to a Pandas DataFrame, and uses the XGBoost model to predict whether the traffic is benign or malicious. Returns the prediction label and confidence score.
    - **`/health` Endpoint**: Returns the server status.
- **`federated_ids_model.json`**: The serialized XGBoost model file.
- **`federated_ids_model.pkl`**: A Pickle format version of the model (likely used for backup or development).
- **`feature_names.json`**: A JSON list of feature names required by the model to ensure input vectors match the training data schema.
- **`Dockerfile`**: Builds the Python environment (installing Flask, XGBoost, Pandas) and runs `ids_server.py`.

---

## 3. Kubernetes (`k8s`)
This directory contains manifests and scripts to deploy the Cyber Range simulations onto a Kubernetes cluster.

### Scripts
- **`deploy_k8s.sh`**:
    - **Build**: Builds Docker images for each attacker (`bot-attacker`, `ddos-attacker`, `infiltration-attacker`) locally.
    - **Deploy**: Applies Kubernetes manifests (`kubectl apply`) from subdirectories.
    - **Autoscaling**: Applies Horizontal Pod Autoscalers (HPA) to scale attacks based on load.
    - **Rollout**: Waits for deployments to become ready.
- **`cleanup_k8s.sh`**: Deletes all applied resources (Deployments, Services, HPAs) from the cluster to stop the simulation.

### Subdirectories Breakdown

#### 1. `k8s/base` (Infrastructure)
Contains core infrastructural elements shared or required by all simulations.
- **`storage.yaml`**: Defines **PersistentVolumes (PV)** and **PersistentVolumeClaims (PVC)** for:
    - `bot-data-pv` / `bot-data-pvc`
    - `ddos-data-pv` / `ddos-data-pvc`
    - `infiltration-data-pv` / `infiltration-data-pvc`
    - **Important Note**: These use `hostPath` (mapping a directory from the host machine to the container). The path is currently hardcoded to a specific Windows user path (`/run/desktop/mnt/host/c/Users/nader/...`). **This must be updated to match your local environment for data collection to work.**

#### 2. `k8s/bot` (Botnet Simulation)
- **`bot-sim.yaml`**:
    - **Target Pod**: Deploys `juice-shop` with a `netshoot` sidecar container running `tshark` to capture traffic to `/data/flows_raw.csv`.
    - **Attacker Pod**: Deploys `local/bot-attacker` image. Configures `JUICESHOP_URL` and `VICTIM_IP` env vars.
- **`bot-hpa.yaml`**: Autoscales the bot attacker from 1 to 10 replicas based on 50% CPU utilization.

#### 3. `k8s/ddos` (DDoS Simulation)
- **`ddos-sim.yaml`**:
    - **Target Pod**: Same `juice-shop` + `netshoot` sidecar setup as above.
    - **Attacker Pod**: Deploys `local/ddos-attacker`.
    - **Configuration (Env Vars)**:
        - `THREADS`: Number of attack threads (default `5` in this yaml, though script defaults to 100).
        - `DURATION`: Batch duration in seconds.
        - `DELAY`: Sleep time between requests to throttle load.
- **`ddos-hpa.yaml`**: Autoscales the DDoS attacker from 1 to 20 replicas. This is the most aggressive autoscaler, allowing up to 20 concurrent attacker pods.

#### 4. `k8s/infiltration` (Infiltration Simulation)
- **`infiltration-sim.yaml`**:
    - **Target Pod**: `juice-shop` + `netshoot`.
    - **Attacker Pod**: `local/infiltration-attacker`. Designed for low-volume, stealthy traffic (C2 heartbeats) rather than saturation.
- **`infiltration-hpa.yaml`**: Autoscales from 1 to 5 replicas.

#### 5. `k8s/fl-ids` (Defensive System)
- **`fl-ids.yaml`**: Deploys the Federated Learning IDS REST API (`ids_server.py`).
    - Exposes port `5000` via a Kubernetes Service (`type: LoadBalancer`).
    - Allocated significant resources (Request: 0.5 CPU, 1Gi RAM; Limit: 1 CPU, 2Gi RAM) to handle XGBoost inference.
- **`fl-ids-hpa.yaml`**: Autoscaler for the IDS service itself, ensuring the defense layer scales up if traffic analysis demand increases.

---

## 4. Code & Configuration Deep Dive

This section provides a line-by-line style analysis of the key components requested: **Python Attacker Scripts**, **Kubernetes HPA**, and **Health Checks**.

### A. Python Attacker Scripts (Health & Logic)
All three simulators (`infiltration`, `bot`, `ddos`) use a similar Python pattern to handle simulation logic and Kubernetes health probes simultaneously.

#### The Health Server Pattern
To allow Kubernetes to know if the container is alive, a lightweight HTTP server is run in a background thread. This is crucial because the "main" thread is busy running an infinite attack loop and cannot respond to HTTP requests.

```python
# From Infiltration-sim/attacker/attacker.py (lines 17-36)

# 1. Define a Request Handler
class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Always return HTTP 200 OK with a generic JSON response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status": "healthy"}')
    
    # Override log_message to prevent clogging logs with health checks
    def log_message(self, format, *args):
        return

# 2. Function to start the server
def start_health_server():
    try:
        # Listen on ALL interfaces ("") at port 8000
        with socketserver.TCPServer(("", 8000), HealthHandler) as httpd:
            print("[*] Health server running on port 8000")
            httpd.serve_forever()
    except Exception as e:
        print(f"[-] Failed to start health server: {e}")

# 3. Start in a Daemon Thread
# daemon=True means this thread will automatically die if the main program exits
threading.Thread(target=start_health_server, daemon=True).start()
```

#### The Main Attack Loop
While the health server runs in the background, the main thread orchestrates the attack.

**Example: `simulate_ddos.py` (DDoS)**
- **Threading**: Uses `threading.Thread(target=flood)` to spawn hundreds of threads.
- **Batches**: Runs attacks in batches (defined by `DURATION`), calculating statistics (requests/errors) for each batch.
- **Locks**: Uses `threading.Lock()` to safely update shared `stats` counters from multiple threads.
- **User Agents**: Rotates through a list of realistic User-Agent strings to mimic legitimate traffic or specific tools (like HOIC).

**Example: `attacker.py` (Infiltration)**
- **Phased Execution**:
    - **Phase 1 (Exploitation)**: Sends a malicious payload (`'; process.exit(); //`) to the target.
    - **Phase 2 (C2)**: Connects to a raw TCP socket on the victim to simulate Command & Control heartbeats.
- **Metrics**: Emits JSON-formatted logs (`log_event`) which are likely parsed by a log aggregator (like Fluentd/Elasticsearch) to visualize the attack progression.

#### Bot Attack Logic (`bot-sim/attacker.py`)
This simulator implements a **Credential Stuffing** attack.
- **Attack Vector**: Iterates through a hardcoded list of compromised credentials (e.g., `admin@juice-sh.op`, `mc.safesearch@juice-sh.op`) and attempts to log in to the Juice Shop `/rest/user/login` endpoint.
- **Batched Execution**:
    - The script runs in an infinite loop, processing the credential list in batches.
    - It sleeps `0.5s` between attempts to simulate realistic bot latency (avoiding immediate rate limits but keeping volume high).
- **Data logging**: Unlike the others that might rely purely on stdout, this script writes detailed attempt logs (Timestamp, Username, HTTP Status, Response Time) directly to a shared CSV file: `/data/bot_attempts.csv`.

#### DDoS Attack Logic (`ddos-simulator/simulate_ddos.py`)
This simulator mimics a **HOIC (High Orbit Ion Cannon)** style HTTP flood, designed to saturate resources.
- **Threading Model**: Highly parallelized. It spawns significantly more threads (default `100`) than the other simulators.
- **Traffic Patterns**:
    - **Randomization**: Randomly selects from a list of realistic paths (`/`, `/#/contact`, `/ftp`, etc.) and User-Agents (Chrome, Firefox, HOIC specific strings) to evade simple signature detection.
    - **Session Handling**: Uses `requests.Session()` within each thread to reuse TCP connections (`Connection: keep-alive`), making the attack more efficient and harder to mitigate than simple single-request scripts.
- **Synchronization**: Uses a `threading.Lock()` to safely aggregate statistics (`requests_sent`, `errors`) across hundreds of concurrent threads.

---

### B. Kubernetes Configuration (YAML)

#### Deployment & Probes (`*-sim.yaml`)
The deployment manifests define *how* to run the containers and *how* to check their health using the Python server described above.

```yaml
# From infiltration-sim.yaml

livenessProbe:
  httpGet:
    path: /          # Helper hits http://localhost:8000/
    port: 8000
  initialDelaySeconds: 10  # Wait 10s after start before first check
  periodSeconds: 15        # Check every 15s

readinessProbe:
  httpGet:
    path: /
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
```
- **Liveness Probe**: If this fails (e.g., the Python script crashes or hangs so badly the thread dies), Kubernetes **restarts** the container.
- **Readiness Probe**: Included for completeness. If this fails, the pod is removed from Service endpoints (doesn't receive external traffic). Since these are *attackers* generating outbound traffic, this is less critical but good practice.

#### Horizontal Pod Autoscaling (HPA) (`*-hpa.yaml`)
This is where the simulation becomes dynamic. The HPA automatically adds or removes attacker pods based on CPU load.

```yaml
# From infiltration-hpa.yaml

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: infiltration-attacker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: infiltration-attacker  # Target the deployment named above
  minReplicas: 1                 # Never go below 1 attacker
  maxReplicas: 5                 # Cap at 5 attackers
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50   # Target 50% CPU usage across all pods
```

**How it works:**
1. **Requests & Limits**: The Deployment defines a request (`100m` = 0.1 CPU) and a limit (`500m` = 0.5 CPU).
2. **Calculation**: Kubernetes calculates current CPU usage as a percentage of the **request**.
    - If a pod is using `200m` (0.2 CPU), that is `200%` of the `100m` request.
    - *Correction*: Modern HPA `averageUtilization` usually refers to the **requested** value.
3. **Scaling Action**:
    - If the Python script is working hard (generating lots of traffic) and CPU usage goes High (>50%), K8s adds more pods.
    - If the script sleeps or finishes a batch, CPU usage drops, and K8s removes pods.

### C. Horizontal Pod Autoscalers (HPA): Roles & Code Analysis

Each `*-hpa.yaml` file plays a specific strategic role in the simulation. Here is the breakdown of the code structure and the intent behind each configuration.

#### 1. The Code Structure (Generic Explanation)
All HPA files follow this Kubernetes `autoscaling/v2` structure:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: <name>            # Unique name for the HPA
spec:
  scaleTargetRef:
    apiVersions: apps/v1
    kind: Deployment
    name: <target-deployment> # LINKS the autoscaler to a specific Deployment
  minReplicas: <min>      # The baseline number of pods (always keep at least this many)
  maxReplicas: <max>      # The hard limit (never go above this, to save resources)
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: <percent> # The Trigger: Scale UP if average CPU > X%
```

#### 2. Specific Roles & Configurations

**a. `ddos-hpa.yaml` (The Hammer)**
- **Role**: Simulate a massive, overpowering flood. The goal is to maximize throughput and potentially crash the target.
- **Key Code**: `maxReplicas: 20`
- **Logic**: This is the highest limit in the system. It allows the simulation to spin up 20 simultaneous attack nodes, generating maximum noise and traffic volume.

**b. `bot-hpa.yaml` (The Army)**
- **Role**: Simulate a distributed botnet performing credential stuffing. It needs volume, but less than a raw DDoS.
- **Key Code**: `maxReplicas: 10`
- **Logic**: Caps at 10 replicas. Enough to simulate "distributed" traffic from different IPs (pods), but controlled enough to mostly test authentication endpoints rather than raw bandwidth.

**c. `infiltration-hpa.yaml` (The Spies)**
- **Role**: Simulate stealthy Advanced Persistent Threat (APT) behavior. High volume is *bad* here as it triggers detection.
- **Key Code**: `maxReplicas: 5`
- **Logic**: Kept intentionally small. The goal is connectivity (C2 heartbeats), not saturation.

**d. `fl-ids-hpa.yaml` (The Guard)**
- **Role**: Reactive defense. The IDS needs to scale *with* the attack to continue analyzing traffic in real-time.
- **Key Code**: `averageUtilization: 70`
- **Logic**: 
    - **Higher Threshold (70%)**: Unlike attackers (50%), the IDS is configured to "sweat" a bit more before scaling. This prevents it from scaling up prematurely due to minor spikes.
    - **Reaction**: If the DDoS attack scales up (more traffic), the IDS CPU load increases (more inference). The HPA detects this and adds more IDS pods to handle the load.

---

### D. Kubernetes Deployments (`*-sim.yaml`): Roles & Code Analysis

These files define the operational architecture of the simulations. They essentially deploy a **Range** (Victim + Monitor) and an **Attacker**.

#### 1. The "Sidecar" Pattern (Traffic Monitoring)
The most critical part of `bot-sim.yaml`, `ddos-sim.yaml`, and `infiltration-sim.yaml` is the **Target Deployment**. It uses a **Sidecar Pattern** to capture traffic without modifying the victim application.

```yaml
# Generic Structure of the Victim Pod
spec:
  containers:
  # Container 1: The Victim
  - name: juice-shop
    image: bkimminich/juice-shop:latest
    ports: [{containerPort: 3000}]

  # Container 2: The Spy (Sidecar)
  - name: monitor
    image: nicolaka/netshoot:latest
    command: ["/bin/sh", "-c"]
    args:
      - |
        tshark -l -i any -f 'tcp' -T fields ... > /data/flows_raw.csv
    securityContext:
      capabilities:
        add: ["NET_ADMIN", "NET_RAW"] # Required to sniff packets
    volumeMounts:
    - name: data-volume
      mountPath: /data # Shared storage written to by Tshark
```
- **Role**: This ensures that *every* packet reaching the Juice Shop is captured, timestamped, and saved to a shared volume (`/data`).
- **Why**: This raw data (`flows_raw.csv`) is the source of truth for the Machine Learning training pipeline.

#### 2. Specific Roles & Configurations

**a. `bot-sim.yaml` & `ddos-sim.yaml` & `infiltration-sim.yaml` (The Attack Scenarios)**
These files are structurally identical but functionally distinct due to their **Attacker** container configuration.
- **The Victim Service**: Defines a Kubernetes Service (e.g., `juice-shop-bot`) to give the victim a stable internal DNS name.
- **The Attacker Deployment**:
    - **Separate Pod**: The attacker runs in its own pod, completely separate from the victim.
    - **Environmental Targeting**:
        ```yaml
        env:
        - name: TARGET_URL 
          value: "http://juice-shop-ddos:3000" # Targets the Service DNS
        ```
    - **Resource Limits**:
        - **DDoS**: High limits (`limit: 1 cpu`) to allow massive throughput.
        - **Infiltration**: Low requests (`100m`) as it is lightweight.

**b. `fl-ids.yaml` (The Brain)**
This file is different. It does not deploy a victim or an attacker. It deploys the **Intelligence**.
- **Role**: A central analysis engine.
- **Service Exposure**:
    ```yaml
    kind: Service
    spec:
      type: LoadBalancer # Exposes IP externally (on supported clouds/MetalLB)
      ports: [{port: 5000}]
    ```
- **Why**: Other components (or a separate traffic forwarder) send feature vectors to `http://fl-ids-service:5000/predict`. The IDS returns `{"class": "DDoS", "confidence": 0.99}`.
- **Resource Intensity**: It requests `1Gi` of memory because it must load the XGBoost model and potentially handle concurrent inference requests.
