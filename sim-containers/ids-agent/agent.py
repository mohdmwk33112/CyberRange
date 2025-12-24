import pandas as pd
import numpy as np
import os
import sys
import time
import requests
import json
from datetime import datetime

RAW_NET_FILE = "/data/flows_raw.csv"
IDS_SERVER_URL = os.environ.get("IDS_SERVER_URL", "http://fl-ids-service:5000/predict")
CHECK_INTERVAL = 10  # seconds

# Feature names required by fl-ids model
FEATURE_NAMES = [
    "Dst_Port", "Protocol", "Timestamp", "Flow_Duration", "Tot_Fwd_Pkts", "Tot_Bwd_Pkts",
    "TotLen_Fwd_Pkts", "TotLen_Bwd_Pkts", "Fwd_Pkt_Len_Max", "Fwd_Pkt_Len_Min",
    "Fwd_Pkt_Len_Mean", "Fwd_Pkt_Len_Std", "Bwd_Pkt_Len_Max", "Bwd_Pkt_Len_Min",
    "Bwd_Pkt_Len_Mean", "Bwd_Pkt_Len_Std", "Flow_Byts/s", "Flow_Pkts/s",
    "Flow_IAT_Mean", "Flow_IAT_Std", "Flow_IAT_Max", "Flow_IAT_Min",
    "Fwd_IAT_Tot", "Fwd_IAT_Mean", "Fwd_IAT_Std", "Fwd_IAT_Max", "Fwd_IAT_Min",
    "Bwd_IAT_Tot", "Bwd_IAT_Mean", "Bwd_IAT_Std", "Bwd_IAT_Max", "Bwd_IAT_Min",
    "Fwd_PSH_Flags", "Bwd_PSH_Flags", "Fwd_URG_Flags", "Bwd_URG_Flags",
    "Fwd_Header_Len", "Bwd_Header_Len", "Fwd_Pkts/s", "Bwd_Pkts/s",
    "Pkt_Len_Min", "Pkt_Len_Max", "Pkt_Len_Mean", "Pkt_Len_Std", "Pkt_Len_Var",
    "FIN_Flag_Cnt", "SYN_Flag_Cnt", "RST_Flag_Cnt", "PSH_Flag_Cnt", "ACK_Flag_Cnt",
    "URG_Flag_Cnt", "CWE_Flag_Count", "ECE_Flag_Cnt", "Down/Up_Ratio", "Pkt_Size_Avg",
    "Fwd_Seg_Size_Avg", "Bwd_Seg_Size_Avg", "Fwd_Byts/b_Avg", "Fwd_Pkts/b_Avg",
    "Fwd_Blk_Rate_Avg", "Bwd_Byts/b_Avg", "Bwd_Pkts/b_Avg", "Bwd_Blk_Rate_Avg",
    "Subflow_Fwd_Pkts", "Subflow_Fwd_Byts", "Subflow_Bwd_Pkts", "Subflow_Bwd_Byts",
    "Init_Fwd_Win_Byts", "Init_Bwd_Win_Byts", "Fwd_Act_Data_Pkts", "Fwd_Seg_Size_Min",
    "Active_Mean", "Active_Std", "Active_Max", "Active_Min", "Idle_Mean", "Idle_Std",
    "Idle_Max", "Idle_Min"
]

def process_traffic():
    if not os.path.exists(RAW_NET_FILE):
        return

    try:
        # Load raw data
        df_net = pd.read_csv(RAW_NET_FILE)
        if df_net.empty:
            return

        # Map tshark fields to friendly names
        cols = [
            "timestamp", "protocol", "src_ip", "dst_ip", "src_port", "dst_port", 
            "frame_len", "tcp_len", "fin", "syn", "rst", "psh", "ack", "urg", "cwr", "ece", 
            "win_size", "hdr_len"
        ]
        df_net.columns = cols

        # Convert flags to numeric
        for col in ["fin", "syn", "rst", "psh", "ack", "urg", "cwr", "ece"]:
            df_net[col] = pd.to_numeric(df_net[col], errors='coerce').fillna(0).astype(int)

        def get_flow_id(row):
            endpoints = sorted([(row['src_ip'], row['src_port']), (row['dst_ip'], row['dst_port'])])
            return f"{endpoints[0][0]}:{endpoints[0][1]}-{endpoints[1][0]}:{endpoints[1][1]}-{row['protocol']}"

        df_net['flow_id'] = df_net.apply(get_flow_id, axis=1)

        flows = []
        # Group by flow and process most recent flows first
        for flow_id, g in df_net.groupby('flow_id'):
            g = g.sort_values('timestamp')
            
            fwd_ip = g.iloc[0]['src_ip']
            fwd_pkts = g[g['src_ip'] == fwd_ip]
            bwd_pkts = g[g['src_ip'] != fwd_ip]
            
            start_t = g.iloc[0]['timestamp']
            end_t = g.iloc[-1]['timestamp']
            duration = max((end_t - start_t) * 1e6, 1)
            
            fwd_lens = fwd_pkts['frame_len']
            bwd_lens = bwd_pkts['frame_len']
            all_lens = g['frame_len']
            
            iat = g['timestamp'].diff().dropna() * 1e6
            fwd_iat = fwd_pkts['timestamp'].diff().dropna() * 1e6
            bwd_iat = bwd_pkts['timestamp'].diff().dropna() * 1e6
            
            flow = {
                "Dst_Port": int(g.iloc[0]['dst_port']),
                "Protocol": int(g.iloc[0]['protocol']),
                "Timestamp": int(start_t), # Using epoch for model compatibility if needed, though model might expect float
                "Flow_Duration": float(duration),
                "Tot_Fwd_Pkts": int(len(fwd_pkts)),
                "Tot_Bwd_Pkts": int(len(bwd_pkts)),
                "TotLen_Fwd_Pkts": float(fwd_lens.sum()),
                "TotLen_Bwd_Pkts": float(bwd_lens.sum()),
                "Fwd_Pkt_Len_Max": float(fwd_lens.max() if not fwd_lens.empty else 0),
                "Fwd_Pkt_Len_Min": float(fwd_lens.min() if not fwd_lens.empty else 0),
                "Fwd_Pkt_Len_Mean": float(fwd_lens.mean() if not fwd_lens.empty else 0),
                "Fwd_Pkt_Len_Std": float(fwd_lens.std() if len(fwd_lens) > 1 else 0),
                "Bwd_Pkt_Len_Max": float(bwd_lens.max() if not bwd_lens.empty else 0),
                "Bwd_Pkt_Len_Min": float(bwd_lens.min() if not bwd_lens.empty else 0),
                "Bwd_Pkt_Len_Mean": float(bwd_lens.mean() if not bwd_lens.empty else 0),
                "Bwd_Pkt_Len_Std": float(bwd_lens.std() if len(bwd_lens) > 1 else 0),
                "Flow_Byts/s": float((all_lens.sum() / duration * 1e6) if duration > 0 else 0),
                "Flow_Pkts/s": float((len(g) / duration * 1e6) if duration > 0 else 0),
                "Flow_IAT_Mean": float(iat.mean() if not iat.empty else 0),
                "Flow_IAT_Std": float(iat.std() if len(iat) > 1 else 0),
                "Flow_IAT_Max": float(iat.max() if not iat.empty else 0),
                "Flow_IAT_Min": float(iat.min() if not iat.empty else 0),
                "Fwd_IAT_Tot": float(fwd_iat.sum() if not fwd_iat.empty else 0),
                "Fwd_IAT_Mean": float(fwd_iat.mean() if not fwd_iat.empty else 0),
                "Fwd_IAT_Std": float(fwd_iat.std() if len(fwd_iat) > 1 else 0),
                "Fwd_IAT_Max": float(fwd_iat.max() if not fwd_iat.empty else 0),
                "Fwd_IAT_Min": float(fwd_iat.min() if not fwd_iat.empty else 0),
                "Bwd_IAT_Tot": float(bwd_iat.sum() if not bwd_iat.empty else 0),
                "Bwd_IAT_Mean": float(bwd_iat.mean() if not bwd_iat.empty else 0),
                "Bwd_IAT_Std": float(bwd_iat.std() if len(bwd_iat) > 1 else 0),
                "Bwd_IAT_Max": float(bwd_iat.max() if not bwd_iat.empty else 0),
                "Bwd_IAT_Min": float(bwd_iat.min() if not bwd_iat.empty else 0),
                "Fwd_PSH_Flags": int(fwd_pkts['psh'].sum()),
                "Bwd_PSH_Flags": int(bwd_pkts['psh'].sum()),
                "Fwd_URG_Flags": int(fwd_pkts['urg'].sum()),
                "Bwd_URG_Flags": int(bwd_pkts['urg'].sum()),
                "Fwd_Header_Len": int(fwd_pkts['hdr_len'].sum()),
                "Bwd_Header_Len": int(bwd_pkts['hdr_len'].sum()),
                "Fwd_Pkts/s": float((len(fwd_pkts) / duration * 1e6) if duration > 0 else 0),
                "Bwd_Pkts/s": float((len(bwd_pkts) / duration * 1e6) if duration > 0 else 0),
                "Pkt_Len_Min": float(all_lens.min()),
                "Pkt_Len_Max": float(all_lens.max()),
                "Pkt_Len_Mean": float(all_lens.mean()),
                "Pkt_Len_Std": float(all_lens.std() if len(all_lens) > 1 else 0),
                "Pkt_Len_Var": float(all_lens.var() if len(all_lens) > 1 else 0),
                "FIN_Flag_Cnt": int(g['fin'].sum()),
                "SYN_Flag_Cnt": int(g['syn'].sum()),
                "RST_Flag_Cnt": int(g['rst'].sum()),
                "PSH_Flag_Cnt": int(g['psh'].sum()),
                "ACK_Flag_Cnt": int(g['ack'].sum()),
                "URG_Flag_Cnt": int(g['urg'].sum()),
                "CWE_Flag_Count": int(g['cwr'].sum()),
                "ECE_Flag_Cnt": int(g['ece'].sum()),
                "Down/Up_Ratio": float((len(bwd_pkts) / len(fwd_pkts)) if len(fwd_pkts) > 0 else 0),
                "Pkt_Size_Avg": float(all_lens.mean()),
                "Fwd_Seg_Size_Avg": float(fwd_lens.mean() if not fwd_lens.empty else 0),
                "Bwd_Seg_Size_Avg": float(bwd_lens.mean() if not bwd_lens.empty else 0),
                "Fwd_Byts/b_Avg": 0, "Fwd_Pkts/b_Avg": 0, "Fwd_Blk_Rate_Avg": 0,
                "Bwd_Byts/b_Avg": 0, "Bwd_Pkts/b_Avg": 0, "Bwd_Blk_Rate_Avg": 0,
                "Subflow_Fwd_Pkts": int(len(fwd_pkts)),
                "Subflow_Fwd_Byts": float(fwd_lens.sum()),
                "Subflow_Bwd_Pkts": int(len(bwd_pkts)),
                "Subflow_Bwd_Byts": float(bwd_lens.sum()),
                "Init_Fwd_Win_Byts": int(fwd_pkts.iloc[0]['win_size'] if not fwd_pkts.empty else 0),
                "Init_Bwd_Win_Byts": int(bwd_pkts.iloc[0]['win_size'] if not bwd_pkts.empty else 0),
                "Fwd_Act_Data_Pkts": int(len(fwd_pkts[fwd_pkts['tcp_len'] > 0])),
                "Fwd_Seg_Size_Min": float(fwd_lens.min() if not fwd_lens.empty else 0),
                "Active_Mean": float(duration), "Active_Std": 0.0, "Active_Max": float(duration), "Active_Min": float(duration),
                "Idle_Mean": 0.0, "Idle_Std": 0.0, "Idle_Max": 0.0, "Idle_Min": 0.0
            }
            flows.append(flow)

        if not flows:
            return

        # Take last 5 unique flows to avoid overwhelming but capture variety
        recent_flows = flows[-5:]
        
        for flow in recent_flows:
            # Reorder according to FEATURE_NAMES to be sure
            ordered_features = [flow.get(name, 0) for name in FEATURE_NAMES]
            
            try:
                response = requests.post(IDS_SERVER_URL, json={"features": ordered_features}, timeout=5)
                if response.status_code == 200:
                    result = response.json()
                    label = result.get('prediction_label', 'Unknown')
                    confidence = result.get('confidence', 0)
                    
                    if label != "Benign":
                        print(json.dumps({
                            "type": "ids-alert",
                            "timestamp": time.time(),
                            "message": f"IDS ALERT: {label} detected!",
                            "confidence": confidence,
                            "perspective": "victim"
                        }))
                    else:
                        print(json.dumps({
                            "type": "ids-status",
                            "timestamp": time.time(),
                            "message": "Traffic analysis: Benign",
                            "confidence": confidence,
                            "perspective": "victim"
                        }))
            except Exception as e:
                print(f"[-] Error calling IDS server: {e}")

    except Exception as e:
        print(f"[-] Error processing traffic: {e}")

if __name__ == "__main__":
    print("[+] IDS Agent started. Watching traffic...")
    while True:
        process_traffic()
        time.sleep(CHECK_INTERVAL)
