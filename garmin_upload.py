"""
HYROX -> Garmin Connect Workout Uploader v1
Uploads all 21 workouts (Weeks 1-3) directly via Garmin Connect API.
Workouts sync to watch automatically via Bluetooth.
"""
import os
import json
import time
from garminconnect import Garmin

TOKEN_DIR = os.path.expanduser("~/.garminconnect")
os.makedirs(TOKEN_DIR, exist_ok=True)
TOKENSTORE = os.path.join(TOKEN_DIR, "garmin_tokens.json")

# ===========================================================
# GARMIN CONNECT SPORT TYPE IDs
# ===========================================================
SPORT_RUNNING = {"sportTypeId": 1, "sportTypeKey": "running"}
SPORT_STRENGTH = {"sportTypeId": 5, "sportTypeKey": "strength_training"}
SPORT_CARDIO = {"sportTypeId": 10, "sportTypeKey": "cardio_training"}
SPORT_TRAINING = {"sportTypeId": 4, "sportTypeKey": "other"}  # generic "other" for flexibility

# ===========================================================
# STEP TYPE IDs
# ===========================================================
STEP_WARMUP   = {"stepTypeId": 1, "stepTypeKey": "warmup"}
STEP_COOLDOWN = {"stepTypeId": 2, "stepTypeKey": "cooldown"}
STEP_INTERVAL = {"stepTypeId": 3, "stepTypeKey": "interval"}
STEP_REST     = {"stepTypeId": 4, "stepTypeKey": "rest"}
STEP_RECOVERY = {"stepTypeId": 4, "stepTypeKey": "rest"}  # recovery = rest in Garmin

# ===========================================================
# END CONDITION IDs
# ===========================================================
END_LAP_BUTTON = {"conditionTypeId": 1, "conditionTypeKey": "lap.button"}  # manual advance
END_TIME       = {"conditionTypeId": 2, "conditionTypeKey": "time"}
END_DISTANCE   = {"conditionTypeId": 3, "conditionTypeKey": "distance"}
END_REPS       = {"conditionTypeId": 10, "conditionTypeKey": "reps"}

# ===========================================================
# TARGET TYPE
# ===========================================================
NO_TARGET = {"workoutTargetTypeId": 1, "workoutTargetTypeKey": "no.target"}

# ===========================================================
# STEP BUILDER HELPERS
# ===========================================================
def make_step(order, step_type, end_condition, end_value=None,
              exercise_category=None, exercise_name=None, description=None):
    """Build a single Garmin Connect workout step."""
    step = {
        "type": "ExecutableStepDTO",
        "stepOrder": order,
        "stepType": step_type,
        "endCondition": end_condition,
        "targetType": NO_TARGET,
    }
    
    if end_value is not None:
        step["endConditionValue"] = end_value
    
    if exercise_category:
        step["exerciseCategory"] = {"exerciseCategoryKey": exercise_category}
    
    if exercise_name:
        step["exerciseName"] = exercise_name
    
    if description:
        step["description"] = description
    
    return step


def warmup_step(order, seconds=None, description=None, exercise_category=None, exercise_name=None):
    """Warmup step - timed or manual."""
    if seconds:
        return make_step(order, STEP_WARMUP, END_TIME, seconds,
                        exercise_category, exercise_name, description)
    return make_step(order, STEP_WARMUP, END_LAP_BUTTON, None,
                    exercise_category, exercise_name, description)


def active_step(order, reps=None, seconds=None, distance_m=None,
                exercise_category=None, exercise_name=None, description=None):
    """Active/interval step - reps, time, distance, or manual."""
    if reps:
        return make_step(order, STEP_INTERVAL, END_REPS, reps,
                        exercise_category, exercise_name, description)
    elif seconds:
        return make_step(order, STEP_INTERVAL, END_TIME, seconds,
                        exercise_category, exercise_name, description)
    elif distance_m:
        return make_step(order, STEP_INTERVAL, END_DISTANCE, distance_m,
                        exercise_category, exercise_name, description)
    else:
        return make_step(order, STEP_INTERVAL, END_LAP_BUTTON, None,
                        exercise_category, exercise_name, description)


def rest_step(order, seconds=None, description=None):
    """Rest step - timed or manual."""
    if seconds:
        return make_step(order, STEP_REST, END_TIME, seconds, description=description)
    return make_step(order, STEP_REST, END_LAP_BUTTON, description=description)


def cooldown_step(order, seconds=None, description=None, exercise_category=None, exercise_name=None):
    """Cooldown step."""
    if seconds:
        return make_step(order, STEP_COOLDOWN, END_TIME, seconds,
                        exercise_category, exercise_name, description)
    return make_step(order, STEP_COOLDOWN, END_LAP_BUTTON, None,
                    exercise_category, exercise_name, description)


def build_workout_json(name, sport_type, steps):
    """Build the full workout JSON payload."""
    return {
        "workoutName": name,
        "sportType": sport_type,
        "workoutSegments": [
            {
                "segmentOrder": 1,
                "sportType": sport_type,
                "workoutSteps": steps,
            }
        ],
    }


# ===========================================================
# WORKOUT DEFINITIONS - WEEKS 1-3
# ===========================================================

def gen_monday(week):
    """Lower Strength-Endurance + Core"""
    steps = [
        warmup_step(1, seconds=300, description="Easy Bike 5min"),
        warmup_step(2, description="Lateral Band Walks"),
        warmup_step(3, description="Glute Bridges 2x15", exercise_category="hip_raise", exercise_name="Weighted Glute Bridge"),
        warmup_step(4, description="BW Squats 2x10", exercise_category="squat", exercise_name="Air Squat"),
        active_step(5, description="Goblet Squat 4x12", exercise_category="squat", exercise_name="Goblet Squat"),
        active_step(6, description="RDL (DB) 4x12", exercise_category="deadlift", exercise_name="Dumbbell Deadlift"),
        active_step(7, description="Walking Lunges 3x20", exercise_category="lunge", exercise_name="Walking Lunge"),
        active_step(8, description="Leg Press 3x15", exercise_category="squat", exercise_name="Leg Press"),
        active_step(9, description="Calf Raises 3x15", exercise_category="calf_raise", exercise_name="Standing Calf Raise"),
        active_step(10, description="Clamshells 3x15", exercise_category="hip_stability"),
        active_step(11, description="Copenhagen Side Plank", exercise_category="plank", exercise_name="Side Plank"),
        active_step(12, description="Dead Bug 3x10", exercise_category="core", exercise_name="Dead Bug"),
        active_step(13, description="Pallof Press 3x12", exercise_category="core"),
        cooldown_step(14, description="SL Glute Bridge 3x12", exercise_category="hip_raise"),
    ]
    return build_workout_json(f"W{week}D1 Lower Strength", SPORT_STRENGTH, steps)


def gen_tuesday(week):
    """Running: Easy + Intervals"""
    steps = [
        warmup_step(1, seconds=600, description="Easy Jog Warmup"),
        warmup_step(2, description="Dynamic Stretches"),
        active_step(3, seconds=1800, description="Z2 Steady Run 30min"),
        active_step(4, distance_m=100, description="100m Stride #1"),
        rest_step(5, description="Walk Back Recovery"),
        active_step(6, distance_m=100, description="100m Stride #2"),
        rest_step(7, description="Walk Back Recovery"),
        active_step(8, distance_m=100, description="100m Stride #3"),
        rest_step(9, description="Walk Back Recovery"),
        active_step(10, distance_m=100, description="100m Stride #4"),
        cooldown_step(11, seconds=300, description="Cool Down Jog"),
    ]
    return build_workout_json(f"W{week}D2 Run+Intervals", SPORT_RUNNING, steps)


def gen_wednesday(week):
    """Active Recovery / Mobility"""
    steps = [
        warmup_step(1, seconds=1200, description="Easy Bike/Walk 20min"),
        active_step(2, seconds=900, description="Mobility Flow 15min"),
        active_step(3, seconds=600, description="Foam Rolling 10min"),
        cooldown_step(4, seconds=600, description="IT Band Work 10min"),
    ]
    return build_workout_json(f"W{week}D3 Recovery", SPORT_CARDIO, steps)


def gen_thursday(week):
    """Hybrid Conditioning: Stations + Run"""
    steps = [
        warmup_step(1, distance_m=500, description="Row 500m Easy"),
        warmup_step(2, description="Dynamic Stretches"),
    ]
    s = 3
    for r in range(1, 5):
        steps.append(active_step(s, distance_m=500, description=f"R{r}: Row 500m")); s += 1
        steps.append(active_step(s, distance_m=100, description=f"R{r}: Farmers Carry 100m",
                                exercise_category="carry", exercise_name="Farmers Walk")); s += 1
        steps.append(active_step(s, distance_m=50, description=f"R{r}: Walking Lunges 50m",
                                exercise_category="lunge", exercise_name="Walking Lunge")); s += 1
        steps.append(active_step(s, reps=20, description=f"R{r}: Wall Balls x20",
                                exercise_category="squat", exercise_name="Wall Ball")); s += 1
        steps.append(active_step(s, distance_m=400, description=f"R{r}: RUN 400m!")); s += 1
    steps.append(cooldown_step(s, seconds=300, description="Cool Down"))
    return build_workout_json(f"W{week}D4 Hybrid Stations", SPORT_CARDIO, steps)


def gen_friday(week):
    """Upper Body + Plyometrics"""
    steps = [
        warmup_step(1, description="Pogo Hops 3x10", exercise_category="plyo"),
        warmup_step(2, description="Box Step-Up+Jump 3x6", exercise_category="squat", exercise_name="Box Step Squat"),
        warmup_step(3, description="Squat Jumps 3x5", exercise_category="plyo", exercise_name="Squat Jump"),
        warmup_step(4, description="Med Ball Slams 3x8", exercise_category="plyo", exercise_name="Medicine Ball Slam"),
        active_step(5, description="Bench Press 4x10", exercise_category="bench_press", exercise_name="Barbell Bench Press"),
        active_step(6, description="DB OH Press 3x12", exercise_category="shoulder_press", exercise_name="Overhead Dumbbell Press"),
        active_step(7, description="Barbell Row 4x12", exercise_category="row", exercise_name="Barbell Row"),
        active_step(8, description="Cable Pulldown 3x15", exercise_category="pull_up"),
        active_step(9, description="Pull-Ups 3x8-10", exercise_category="pull_up", exercise_name="Pull Up"),
        active_step(10, description="Face Pulls 3x15", exercise_category="row", exercise_name="Face Pull"),
        active_step(11, description="Hanging Leg Raise 3x10", exercise_category="leg_raise", exercise_name="Hanging Leg Raise"),
        active_step(12, description="Cable Crunches 3x15", exercise_category="crunch"),
        cooldown_step(13, seconds=30, description="Farmers Hold 3x30s", exercise_category="carry", exercise_name="Farmers Walk"),
    ]
    return build_workout_json(f"W{week}D5 Upper+Plyo", SPORT_STRENGTH, steps)


def gen_saturday(week):
    """REST DAY"""
    steps = [
        rest_step(1, description="REST DAY!"),
        active_step(2, seconds=1800, description="Light Walk (optional)"),
    ]
    return build_workout_json(f"W{week}D6 REST DAY", SPORT_CARDIO, steps)


def gen_sunday(week):
    """Long Run + Station Practice"""
    steps = [
        active_step(1, distance_m=8000, description="Zone 2 Run 8-10K"),
        active_step(2, reps=30, description="Wall Balls 30 reps", exercise_category="squat", exercise_name="Wall Ball"),
        rest_step(3, seconds=60, description="Rest 60s"),
        active_step(4, reps=30, description="Wall Balls Set 2", exercise_category="squat", exercise_name="Wall Ball"),
        rest_step(5, seconds=60, description="Rest 60s"),
        active_step(6, reps=30, description="Wall Balls Set 3", exercise_category="squat", exercise_name="Wall Ball"),
        active_step(7, distance_m=30, description="Burpee Broad Jump 30m"),
        cooldown_step(8, seconds=300, description="Cool Down"),
    ]
    return build_workout_json(f"W{week}D7 Long Run+Stations", SPORT_RUNNING, steps)


# ===========================================================
# LOGIN + UPLOAD
# ===========================================================

def login():
    """Login to Garmin Connect using garmin_config.json."""
    # Try saved tokens first
    if os.path.exists(TOKENSTORE):
        print("[*] Found saved tokens, resuming session...")
        try:
            api = Garmin()
            api.login(tokenstore=TOKENSTORE)
            print(f"[OK] Logged in as: {api.display_name}")
            return api
        except Exception as e:
            print(f"[!] Token login failed: {e}")
    
    # Read credentials from config file
    config_path = os.path.join(os.path.dirname(__file__), "garmin_config.json")
    if not os.path.exists(config_path):
        print("[ERROR] garmin_config.json not found!")
        print("  Create it with: {\"email\": \"you@email.com\", \"password\": \"yourpass\"}")
        exit(1)
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    email = config.get("email", "")
    password = config.get("password", "")
    
    if "example.com" in email or not email or not password:
        print("[ERROR] Please edit garmin_config.json with your real Garmin credentials!")
        print(f"  File: {config_path}")
        exit(1)
    
    print(f"[*] Logging in as: {email}")
    
    # Retry with backoff for rate limiting
    for attempt in range(5):
        try:
            api = Garmin(email=email, password=password)
            api.login(tokenstore=TOKENSTORE)
            break
        except Exception as e:
            if "429" in str(e) or "Rate" in str(e):
                wait = 60 * (attempt + 1)  # 60s, 120s, 180s, 240s, 300s
                print(f"[!] Rate limited. Waiting {wait}s before retry ({attempt+1}/5)...")
                time.sleep(wait)
            else:
                raise
    else:
        print("[ERROR] Failed after 5 attempts. Try again in 15 minutes.")
        exit(1)
    
    try:
        api.client.dump(TOKENSTORE)
        print("[OK] Tokens saved (won't need password again)")
    except:
        pass
    
    print(f"[OK] Logged in as: {api.display_name}")
    return api


def upload_all(api):
    """Generate and upload all 21 workouts."""
    generators = [
        ("Monday - Lower Strength", gen_monday),
        ("Tuesday - Running", gen_tuesday),
        ("Wednesday - Recovery", gen_wednesday),
        ("Thursday - Hybrid", gen_thursday),
        ("Friday - Upper+Plyo", gen_friday),
        ("Saturday - REST", gen_saturday),
        ("Sunday - Long Run", gen_sunday),
    ]
    
    uploaded = 0
    failed = 0
    
    for week in [1, 2, 3]:
        print(f"\n--- Week {week} ---")
        for day_name, gen_func in generators:
            workout_json = gen_func(week)
            name = workout_json["workoutName"]
            
            try:
                result = api.upload_workout(workout_json)
                workout_id = result.get("workoutId", "?") if isinstance(result, dict) else "?"
                print(f"  [OK] {name} (id: {workout_id})")
                uploaded += 1
                time.sleep(1)  # Rate limit protection
            except Exception as e:
                print(f"  [FAIL] {name}: {e}")
                failed += 1
                time.sleep(2)
    
    return uploaded, failed


# ===========================================================
# MAIN
# ===========================================================

if __name__ == "__main__":
    print("=" * 55)
    print("  HYROX -> Garmin Connect Workout Uploader")
    print("  Phase 1: Foundation (Weeks 1-3)")
    print("  [DIRECT API - Auto-syncs to watch!]")
    print("=" * 55)
    print()
    
    api = login()
    
    print()
    print("[*] Uploading 21 HYROX workouts...")
    
    uploaded, failed = upload_all(api)
    
    print()
    print("=" * 55)
    print(f"  Uploaded: {uploaded} | Failed: {failed}")
    print()
    print("  YOUR WORKOUTS WILL SYNC AUTOMATICALLY!")
    print("  Open Garmin Connect app on your phone")
    print("  and sync your watch via Bluetooth.")
    print("=" * 55)
