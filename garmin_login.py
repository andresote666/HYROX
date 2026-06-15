"""
HYROX -> Garmin Connect Workout Uploader
Uploads workouts directly via Garmin Connect API.
They will sync to the watch automatically.

Step 1: Login and test connection
"""
import os
import json
from garminconnect import Garmin

TOKEN_DIR = os.path.expanduser("~/.garminconnect")
os.makedirs(TOKEN_DIR, exist_ok=True)
TOKENSTORE = os.path.join(TOKEN_DIR, "garmin_tokens.json")

def login():
    """Login to Garmin Connect. Will prompt for credentials if needed."""
    
    # Check if we have saved tokens
    if os.path.exists(TOKENSTORE):
        print("[*] Found saved tokens, trying to resume session...")
        try:
            api = Garmin()
            api.login(tokenstore=TOKENSTORE)
            print(f"[OK] Logged in as: {api.display_name}")
            return api
        except Exception as e:
            print(f"[!] Token login failed: {e}")
            print("[*] Will try fresh login...")
    
    # Fresh login with credentials
    email = input("Garmin Connect email: ").strip()
    password = input("Garmin Connect password: ").strip()
    
    api = Garmin(email=email, password=password)
    api.login(tokenstore=TOKENSTORE)
    
    # Save tokens for future use
    try:
        api.client.dump(TOKENSTORE)
        print(f"[OK] Tokens saved to {TOKENSTORE}")
    except Exception as e:
        print(f"[!] Warning: Could not save tokens: {e}")
    
    print(f"[OK] Logged in as: {api.display_name}")
    return api

if __name__ == "__main__":
    print("=" * 50)
    print("  HYROX -> Garmin Connect Login Test")
    print("=" * 50)
    print()
    
    api = login()
    
    # Test: list existing workouts
    print()
    print("[*] Fetching existing workouts...")
    workouts = api.get_workouts(start=0, limit=5)
    if workouts:
        print(f"[OK] Found {len(workouts)} workouts:")
        for w in workouts:
            print(f"  - {w.get('workoutName', '?')} (id: {w.get('workoutId', '?')}, sport: {w.get('sportType', {}).get('sportTypeKey', '?')})")
    else:
        print("[OK] No existing workouts found (clean slate)")
    
    print()
    print("[OK] Connection test passed! Ready to upload workouts.")
