
def classify_risk(score):
    if score >= 85: return "CRITICAL"
    if score >= 65: return "HIGH"
    if score >= 40: return "MEDIUM"
    return "LOW"

def reinforce_score(patterns, base_score):
    if len(patterns) >= 2: base_score += 10
    if len(patterns) >= 3: base_score += 15
    return min(base_score, 100)

def map_accounts_to_rings(rings):
    account_ring_map = {}
    for ring in rings:
        for acc in ring["member_accounts"]:
            account_ring_map[acc] = ring["ring_id"]
    return account_ring_map

def calculate_ring_time_window(df, ring_accounts):
    ring_df = df[df["sender_id"].isin(ring_accounts) |
                 df["receiver_id"].isin(ring_accounts)]
    if ring_df.empty:
        return None
    start = ring_df["timestamp"].min()
    end = ring_df["timestamp"].max()
    return {
        "start_time": str(start),
        "end_time": str(end),
        "duration_hours": round((end - start).total_seconds()/3600,2)
    }

def final_format(accounts, rings, df, processing_time, total_entities, total_transactions, total_edges):

    account_ring_map = map_accounts_to_rings(rings)

    formatted_accounts = []
    for acc in accounts:
        score = reinforce_score(acc["detected_patterns"], acc["suspicion_score"])
        formatted_accounts.append({
            "account_id": acc["account_id"],
            "suspicion_score": float(score),
            "detected_patterns": sorted(acc["detected_patterns"]),
            "ring_id": account_ring_map.get(acc["account_id"], "NONE")
        })

    formatted_accounts = sorted(formatted_accounts,
                                key=lambda x: x["suspicion_score"],
                                reverse=True)

    for ring in rings:
        ring["time_window"] = calculate_ring_time_window(df, ring["member_accounts"])

    return {
        "suspicious_accounts": formatted_accounts,
        "fraud_rings": rings,
        "summary": {
            "total_accounts_analyzed": total_entities,
            "total_transactions": total_transactions,
            "total_edges": total_edges,
            "suspicious_accounts_flagged": len(formatted_accounts),
            "fraud_rings_detected": len(rings),
            "processing_time_seconds": round(processing_time, 2),
        }
    }
