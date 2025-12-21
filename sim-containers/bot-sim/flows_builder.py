import pandas as pd
import numpy as np
import os
import sys

RAW_NET_FILE = "data/flows_raw.csv"
RAW_BOT_FILE = "data/bot_attempts.csv"
OUT_NET_FILE = "data/flows.csv"
OUT_BOT_FILE = "data/bot_results.csv"

# --- PART 1: Process Bot Results ---
if os.path.exists(RAW_BOT_FILE):
    try:
        df_bot = pd.read_csv(RAW_BOT_FILE)
        # Outcome mapping
        df_bot["Outcome"] = df_bot["http_status"].apply(lambda x: "SUCCESS" if x in [200, 201] else "FAILED")
        
        # Select and rename columns for the final report
        if all(col in df_bot.columns for col in ["attack_type", "username", "response_time"]):
            df_bot_final = df_bot[["attack_type", "username", "Outcome", "response_time"]]
            df_bot_final.columns = ["Attack Type", "Target Account", "Outcome", "Response Time"]
            df_bot_final.to_csv(OUT_BOT_FILE, index=False)
            print(f"[+] Bot results saved to {OUT_BOT_FILE}")
    except Exception as e:
        print(f"[-] Error processing bot results: {e}")

# --- PART 2: Extract Full CIC-IDS Style Flows ---
if os.path.exists(RAW_NET_FILE):
    try:
        # Load raw data
        if os.path.exists(RAW_NET_FILE) and os.path.getsize(RAW_NET_FILE) > 0:
            df_net = pd.read_csv(RAW_NET_FILE)
        else:
            print(f"[-] {RAW_NET_FILE} is empty. No network flows to process.")
            sys.exit(0)

        if df_net.empty:
            print("[-] No network data found in file.")
            sys.exit(0)
        # Map tshark fields to friendly names
        # Command order: time, proto, src, dst, sport, dport, flen, tlen, fin, syn, rst, push, ack, urg, cwr, ecn, win, hlen
        cols = [
            "timestamp", "protocol", "src_ip", "dst_ip", "src_port", "dst_port", 
            "frame_len", "tcp_len", "fin", "syn", "rst", "psh", "ack", "urg", "cwr", "ece", 
            "win_size", "hdr_len"
        ]
        df_net.columns = cols

        # Convert flags to numeric (tshark sometimes outputs them as strings or handles empty differently)
        for col in ["fin", "syn", "rst", "psh", "ack", "urg", "cwr", "ece"]:
            df_net[col] = pd.to_numeric(df_net[col], errors='coerce').fillna(0).astype(int)

        flows = []
        
        def get_flow_id(row):
            endpoints = sorted([(row['src_ip'], row['src_port']), (row['dst_ip'], row['dst_port'])])
            return f"{endpoints[0][0]}:{endpoints[0][1]}-{endpoints[1][0]}:{endpoints[1][1]}-{row['protocol']}"

        df_net['flow_id'] = df_net.apply(get_flow_id, axis=1)

        for flow_id, g in df_net.groupby('flow_id'):
            g = g.sort_values('timestamp')
            
            # Forward direction is the direction of the first packet
            fwd_ip = g.iloc[0]['src_ip']
            fwd_pkts = g[g['src_ip'] == fwd_ip]
            bwd_pkts = g[g['src_ip'] != fwd_ip]
            
            start_t = g.iloc[0]['timestamp']
            end_t = g.iloc[-1]['timestamp']
            duration = max((end_t - start_t) * 1e6, 1) # Duration in microseconds
            
            # Packet Lengths
            fwd_lens = fwd_pkts['frame_len']
            bwd_lens = bwd_pkts['frame_len']
            all_lens = g['frame_len']
            
            # IATs
            iat = g['timestamp'].diff().dropna() * 1e6
            fwd_iat = fwd_pkts['timestamp'].diff().dropna() * 1e6
            bwd_iat = bwd_pkts['timestamp'].diff().dropna() * 1e6
            
            # Flags
            # In CICFlowMeter, flags are counted per direction or total
            # We follow the standard naming
            
            flow = {
                "Dst Port": g.iloc[0]['dst_port'],
                "Protocol": g.iloc[0]['protocol'],
                "Timestamp": pd.to_datetime(start_t, unit='s').strftime('%d/%m/%Y %H:%M:%S'),
                "Flow Duration": duration,
                "Tot Fwd Pkts": len(fwd_pkts),
                "Tot Bwd Pkts": len(bwd_pkts),
                "TotLen Fwd Pkts": fwd_lens.sum(),
                "TotLen Bwd Pkts": bwd_lens.sum(),
                "Fwd Pkt Len Max": fwd_lens.max() if not fwd_lens.empty else 0,
                "Fwd Pkt Len Min": fwd_lens.min() if not fwd_lens.empty else 0,
                "Fwd Pkt Len Mean": fwd_lens.mean() if not fwd_lens.empty else 0,
                "Fwd Pkt Len Std": fwd_lens.std() if len(fwd_lens) > 1 else 0,
                "Bwd Pkt Len Max": bwd_lens.max() if not bwd_lens.empty else 0,
                "Bwd Pkt Len Min": bwd_lens.min() if not bwd_lens.empty else 0,
                "Bwd Pkt Len Mean": bwd_lens.mean() if not bwd_lens.empty else 0,
                "Bwd Pkt Len Std": bwd_lens.std() if len(bwd_lens) > 1 else 0,
                "Flow Byts/s": (all_lens.sum() / duration * 1e6) if duration > 0 else 0,
                "Flow Pkts/s": (len(g) / duration * 1e6) if duration > 0 else 0,
                "Flow IAT Mean": iat.mean() if not iat.empty else 0,
                "Flow IAT Std": iat.std() if len(iat) > 1 else 0,
                "Flow IAT Max": iat.max() if not iat.empty else 0,
                "Flow IAT Min": iat.min() if not iat.empty else 0,
                "Fwd IAT Tot": fwd_iat.sum() if not fwd_iat.empty else 0,
                "Fwd IAT Mean": fwd_iat.mean() if not fwd_iat.empty else 0,
                "Fwd IAT Std": fwd_iat.std() if len(fwd_iat) > 1 else 0,
                "Fwd IAT Max": fwd_iat.max() if not fwd_iat.empty else 0,
                "Fwd IAT Min": fwd_iat.min() if not fwd_iat.empty else 0,
                "Bwd IAT Tot": bwd_iat.sum() if not bwd_iat.empty else 0,
                "Bwd IAT Mean": bwd_iat.mean() if not bwd_iat.empty else 0,
                "Bwd IAT Std": bwd_iat.std() if len(bwd_iat) > 1 else 0,
                "Bwd IAT Max": bwd_iat.max() if not bwd_iat.empty else 0,
                "Bwd IAT Min": bwd_iat.min() if not bwd_iat.empty else 0,
                "Fwd PSH Flags": fwd_pkts['psh'].sum(),
                "Bwd PSH Flags": bwd_pkts['psh'].sum(),
                "Fwd URG Flags": fwd_pkts['urg'].sum(),
                "Bwd URG Flags": bwd_pkts['urg'].sum(),
                "Fwd Header Len": fwd_pkts['hdr_len'].sum(),
                "Bwd Header Len": bwd_pkts['hdr_len'].sum(),
                "Fwd Pkts/s": (len(fwd_pkts) / duration * 1e6) if duration > 0 else 0,
                "Bwd Pkts/s": (len(bwd_pkts) / duration * 1e6) if duration > 0 else 0,
                "Pkt Len Min": all_lens.min(),
                "Pkt Len Max": all_lens.max(),
                "Pkt Len Mean": all_lens.mean(),
                "Pkt Len Std": all_lens.std() if len(all_lens) > 1 else 0,
                "Pkt Len Var": all_lens.var() if len(all_lens) > 1 else 0,
                "FIN Flag Cnt": g['fin'].sum(),
                "SYN Flag Cnt": g['syn'].sum(),
                "RST Flag Cnt": g['rst'].sum(),
                "PSH Flag Cnt": g['psh'].sum(),
                "ACK Flag Cnt": g['ack'].sum(),
                "URG Flag Cnt": g['urg'].sum(),
                "CWE Flag Count": g['cwr'].sum(),
                "ECE Flag Cnt": g['ece'].sum(),
                "Down/Up Ratio": (len(bwd_pkts) / len(fwd_pkts)) if len(fwd_pkts) > 0 else 0,
                "Pkt Size Avg": all_lens.mean(),
                "Fwd Seg Size Avg": fwd_lens.mean() if not fwd_lens.empty else 0,
                "Bwd Seg Size Avg": bwd_lens.mean() if not bwd_lens.empty else 0,
                "Fwd Byts/b Avg": 0, "Fwd Pkts/b Avg": 0, "Fwd Blk Rate Avg": 0,
                "Bwd Byts/b Avg": 0, "Bwd Pkts/b Avg": 0, "Bwd Blk Rate Avg": 0,
                "Subflow Fwd Pkts": len(fwd_pkts),
                "Subflow Fwd Byts": fwd_lens.sum(),
                "Subflow Bwd Pkts": len(bwd_pkts),
                "Subflow Bwd Byts": bwd_lens.sum(),
                "Init Fwd Win Byts": fwd_pkts.iloc[0]['win_size'] if not fwd_pkts.empty else 0,
                "Init Bwd Win Byts": bwd_pkts.iloc[0]['win_size'] if not bwd_pkts.empty else 0,
                "Fwd Act Data Pkts": len(fwd_pkts[fwd_pkts['tcp_len'] > 0]),
                "Fwd Seg Size Min": fwd_lens.min() if not fwd_lens.empty else 0,
                "Active Mean": duration, "Active Std": 0, "Active Max": duration, "Active Min": duration,
                "Idle Mean": 0, "Idle Std": 0, "Idle Max": 0, "Idle Min": 0
            }
            flows.append(flow)

        out_df = pd.DataFrame(flows)
        # Reorder columns to match user request exactly
        ordered_cols = [
            "Dst Port", "Protocol", "Timestamp", "Flow Duration", "Tot Fwd Pkts", "Tot Bwd Pkts",
            "TotLen Fwd Pkts", "TotLen Bwd Pkts", "Fwd Pkt Len Max", "Fwd Pkt Len Min",
            "Fwd Pkt Len Mean", "Fwd Pkt Len Std", "Bwd Pkt Len Max", "Bwd Pkt Len Min",
            "Bwd Pkt Len Mean", "Bwd Pkt Len Std", "Flow Byts/s", "Flow Pkts/s",
            "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max", "Flow IAT Min",
            "Fwd IAT Tot", "Fwd IAT Mean", "Fwd IAT Std", "Fwd IAT Max", "Fwd IAT Min",
            "Bwd IAT Tot", "Bwd IAT Mean", "Bwd IAT Std", "Bwd IAT Max", "Bwd IAT Min",
            "Fwd PSH Flags", "Bwd PSH Flags", "Fwd URG Flags", "Bwd URG Flags",
            "Fwd Header Len", "Bwd Header Len", "Fwd Pkts/s", "Bwd Pkts/s",
            "Pkt Len Min", "Pkt Len Max", "Pkt Len Mean", "Pkt Len Std", "Pkt Len Var",
            "FIN Flag Cnt", "SYN Flag Cnt", "RST Flag Cnt", "PSH Flag Cnt", "ACK Flag Cnt",
            "URG Flag Cnt", "CWE Flag Count", "ECE Flag Cnt", "Down/Up Ratio", "Pkt Size Avg",
            "Fwd Seg Size Avg", "Bwd Seg Size Avg", "Fwd Byts/b Avg", "Fwd Pkts/b Avg",
            "Fwd Blk Rate Avg", "Bwd Byts/b Avg", "Bwd Pkts/b Avg", "Bwd Blk Rate Avg",
            "Subflow Fwd Pkts", "Subflow Fwd Byts", "Subflow Bwd Pkts", "Subflow Bwd Byts",
            "Init Fwd Win Byts", "Init Bwd Win Byts", "Fwd Act Data Pkts", "Fwd Seg Size Min",
            "Active Mean", "Active Std", "Active Max", "Active Min", "Idle Mean", "Idle Std",
            "Idle Max", "Idle Min"
        ]
        out_df = out_df[ordered_cols]
        out_df.to_csv(OUT_NET_FILE, index=False)
        print(f"[+] Network flows with 76 features saved to {OUT_NET_FILE}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[-] Error processing network flows: {e}")
else:
    print(f"[-] Error: {RAW_NET_FILE} not found.")
