import pandas as pd

REQUIRED_COLUMNS = ["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"]

def validate_csv(df):
    errors = []
    stats = {
        "rowsParsed": len(df),
        "invalidRows": 0,
        "duplicateTxCount": 0,
        "columns": list(df.columns)
    }

    # 1. Required columns
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        errors.append(f"Missing required columns: {', '.join(missing)}")
        return {"ok": False, "errors": errors, "stats": stats}

    # 2. Unique transaction_id
    dupes = df[df.duplicated("transaction_id")]
    if not dupes.empty:
        stats["duplicateTxCount"] = len(dupes)
        errors.append(f"Duplicate transaction_ids detected: {len(dupes)} duplicates found.")

    # 3. Numeric and positive amount
    try:
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        invalid_amounts = df[df["amount"].isna() | (df["amount"] <= 0)]
        if not invalid_amounts.empty:
            errors.append(f"Invalid amounts detected in {len(invalid_amounts)} rows (must be numeric and > 0).")
    except Exception as e:
        errors.append(f"Amount validation error: {str(e)}")

    # 4. Timestamp parsing
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        invalid_ts = df[df["timestamp"].isna()]
        if not invalid_ts.empty:
            errors.append(f"Invalid timestamps detected in {len(invalid_ts)} rows.")
    except Exception as e:
        errors.append(f"Timestamp parsing error: {str(e)}")

    # 5. Timestamp Monotony (The Hidden Trap)
    # Only check if there are no parsing errors so far for timestamps
    if not errors or not any("timestamp" in err.lower() for err in errors):
        # Check if timestamps are sorted
        is_sorted = df["timestamp"].is_monotonic_increasing
        if not is_sorted:
            # Find the first violation
            for i in range(1, len(df)):
                if df.iloc[i]["timestamp"] < df.iloc[i-1]["timestamp"]:
                    errors.append(
                        f"Timestamps not sorted: row {i+1} ({df.iloc[i]['timestamp']}) "
                        f"is earlier than row {i} ({df.iloc[i-1]['timestamp']}). "
                        "Please sort by timestamp."
                    )
                    break

    ok = len(errors) == 0
    return {"ok": ok, "errors": errors, "stats": stats}
