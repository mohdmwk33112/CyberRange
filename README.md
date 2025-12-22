# CyberRange 🛡️

A state-of-the-art, interactive Cyber Security Training Platform (Cyber Range) that combines hands-on simulations, real-time visualization, and machine learning-powered intrusion detection.

![GitHub last commit](https://img.shields.io/github/last-commit/mohdmwk33112/CyberRange?style=flat-square)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-blue?style=flat-square)

---

## 🌟 Overview

CyberRange is designed to bridge the gap between theoretical security concepts and practical application. It recreates realistic attack scenarios within a sandboxed Kubernetes environment, allowing users to:
- **Learn**: Study attack vectors through theory and examples.
- **Challenge**: Test knowledge via interactive, multi-stage questionnaires.
- **Simulate**: Trigger live attacks and monitor real-time traffic telemetry.
- **Detect**: Observe how an ML-powered Intrusion Detection System (FL-IDS) classifies malicious flows.

---

## 🏗️ Architecture

The project follows a modern distributed microservices architecture:

- **Frontend**: A sleek, dark-themed **Next.js** application featuring real-time log streaming and interactive Kill Chain visualizations.
- **API Gateway**: A **NestJS** based entry point that orchestrates requests between the frontend and internal microservices.
- **Backend Microservices**: Manages user state, scenario data (stored in **MongoDB**), and acts as a controller for the simulation environment.
- **Simulation Layer**: A dedicated **Kubernetes** namespace (`simulations`) running containerized "Victim" (Juice Shop) and "Attacker" pods.
- **FL-IDS**: A **Flask**-based REST API serving an **XGBoost** model trained via Federated Learning to classify network traffic in real-time.

---

## 🚀 Key Features

### 1. Interactive Learning Path
Each scenario follows a structured workflow:
- **Theory & Examples**: Understand the mechanics of the attack.
- **Interactive Questionnaire**: Solve challenges based on realistic terminal commands ($>90\%$ score required to unlock the live simulation).
- **Progressive Unlock**: Gamified experience that ensures users are prepared before launching attacks.

### 2. Live Attack Simulations
Launch real-world attack vectors with a single click:
- **DDoS (Distributed Denial of Service)**: High-volume HTTP floods with Horizontal Pod Autoscaling (HPA) to mimic a massive botnet.
- **Bot Attack (Credential Stuffing)**: Automated attempts to breach accounts using leaked databases.
- **Network Infiltration**: A full 4-stage Cyber Kill Chain (Recon, Exploitation, C2, and Exfiltration).

### 3. Real-Time Telemetry
Visualize the invisible:
- **Live Terminal**: Streamed logs from the attacker containers via WebSockets.
- **Network Traffic Area Charts**: Real-time byte-count visualization.
- **Attack Distribution**: Breakdown of different traffic types.
- **Kill Chain Tracker**: Visual progress through the stages of a complex attack.

### 4. Machine Learning Defense
The **FL-IDS** (Federated Learning Intrusion Detection System) analyzes captured traffic flows. It processes 79 network features to classify traffic as:
- Benign
- Bot
- DDoS (HOIC/LOIC)
- Infiltration

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Recharts, Framer Motion, Axios, React Query.
- **Backend**: NestJS, TypeScript, MongoDB (Mongoose), Socket.io.
- **Infras**: Kubernetes (K8s), Docker, Horizontal Pod Autoscaler.
- **ML/DS**: Python, Flask, XGBoost, Scikit-learn, Pandas, Tshark (for packet capture).

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker Desktop (with Kubernetes enabled)
- kubectl

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohdmwk33112/CyberRange.git
   cd CyberRange
   ```

2. **Initialize the Backend**
   ```bash
   cd backend/microservices && npm install
   cd ../api-gateway && npm install
   ```

3. **Initialize the Frontend**
   ```bash
   cd frontend && npm install
   ```

4. **Deploy Simulations (Kubernetes)**
   ```bash
   cd sim-containers/k8s
   ./deploy_k8s.sh
   ```

5. **Run the Project**
   Use `npm run dev` for both frontend and backend directories.

---

## 📜 License
*Proprietary - Developed for Academic/Educational purposes.*
