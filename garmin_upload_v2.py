"""
HYROX -> Garmin Connect Workout Uploader v2
Uses browser cookies directly - bypasses Cloudflare login.
"""
import requests
import json
import time

# ===========================================================
# SESSION COOKIES (from user's browser)
# ===========================================================
COOKIES = {
    "GARMIN-SSO": "1",
    "GARMIN-SSO-CUST-GUID": "938ff96d-fc2b-474e-a567-a2842245a44e",
    "SESSIONID": "NmI3NWJlMzEtMjM3MS00MTEwLWJiMjYtY2JjOWI4Njk0ODlj",
    "JWT_WEB": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyI0IiwiNyIsIjgiLCJST0xFX0dBUk1JTl9VU0VSIl0sImV4cCI6MTc3NTYwMTY3NX0.NPeUq2Oy6oGcXcA1anMg8NM-AoX19izdzsyYlu6CMTk",
    "GMN_TRACKABLE": "1",
}

# Full cookie string for the session header
FULL_COOKIE = "_gid=GA1.2.1412938273.1775564347; _ga=GA1.1.1975536388.1775564347; notice_behavior=none; CONSENTMGR=consent:true%7Cts:1775585665791; SESSIONID=NmI3NWJlMzEtMjM3MS00MTEwLWJiMjYtY2JjOWI4Njk0ODlj; GARMIN-SSO=1; GARMIN-SSO-CUST-GUID=938ff96d-fc2b-474e-a567-a2842245a44e; GMN_TRACKABLE=1; JWT_WEB=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyI0IiwiNyIsIjgiLCJST0xFX0dBUk1JTl9VU0VSIl0sImV4cCI6MTc3NTYwMTY3NX0.NPeUq2Oy6oGcXcA1anMg8NM-AoX19izdzsyYlu6CMTk"

BASE_URL = "https://connect.garmin.com/workout-service"

HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Cookie": FULL_COOKIE,
    "NK": "NT",
    "Referer": "https://connect.garmin.com/modern/workouts",
    "Origin": "https://connect.garmin.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "DI-Backend": "connectapi.garmin.com",
    "X-Requested-With": "XMLHttpRequest",
}

# ===========================================================
# GARMIN CONNECT SPORT TYPE IDs
# ===========================================================
SPORT_RUNNING = {"sportTypeId": 1, "sportTypeKey": "running"}
SPORT_STRENGTH = {"sportTypeId": 5, "sportTypeKey": "strength_training"}
SPORT_CARDIO = {"sportTypeId": 10, "sportTypeKey": "cardio_training"}

# ===========================================================
# STEP TYPE IDs
# ===========================================================
STEP_WARMUP   = {"stepTypeId": 1, "stepTypeKey": "warmup"}
STEP_COOLDOWN = {"stepTypeId": 2, "stepTypeKey": "cooldown"}
STEP_INTERVAL = {"stepTypeId": 3, "stepTypeKey": "interval"}
STEP_REST     = {"stepTypeId": 4, "stepTypeKey": "rest"}

# ===========================================================
# END CONDITION IDs
# ===========================================================
END_LAP_BUTTON = {"conditionTypeId": 1, "conditionTypeKey": "lap.button"}
END_TIME       = {"conditionTypeId": 2, "conditionTypeKey": "time"}
END_DISTANCE   = {"conditionTypeId": 3, "conditionTypeKey": "distance"}
END_REPS       = {"conditionTypeId": 10, "conditionTypeKey": "reps"}

NO_TARGET = {"workoutTargetTypeId": 1, "workoutTargetTypeKey": "no.target"}

# ===========================================================
# STEP BUILDER HELPERS
# ===========================================================
def make_step(order, step_type, end_condition, end_value=None,
              exercise_category=None, exercise_name=None, description=None):
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
    if seconds:
        return make_step(order, STEP_WARMUP, END_TIME, seconds, exercise_category, exercise_name, description)
    return make_step(order, STEP_WARMUP, END_LAP_BUTTON, None, exercise_category, exercise_name, description)

def active_step(order, reps=None, seconds=None, distance_m=None,
                exercise_category=None, exercise_name=None, description=None):
    if reps:
        return make_step(order, STEP_INTERVAL, END_REPS, reps, exercise_category, exercise_name, description)
    elif seconds:
        return make_step(order, STEP_INTERVAL, END_TIME, seconds, exercise_category, exercise_name, description)
    elif distance_m:
        return make_step(order, STEP_INTERVAL, END_DISTANCE, distance_m, exercise_category, exercise_name, description)
    else:
        return make_step(order, STEP_INTERVAL, END_LAP_BUTTON, None, exercise_category, exercise_name, description)

def rest_step(order, seconds=None, description=None):
    if seconds:
        return make_step(order, STEP_REST, END_TIME, seconds, description=description)
    return make_step(order, STEP_REST, END_LAP_BUTTON, description=description)

def cooldown_step(order, seconds=None, description=None, exercise_category=None, exercise_name=None):
    if seconds:
        return make_step(order, STEP_COOLDOWN, END_TIME, seconds, exercise_category, exercise_name, description)
    return make_step(order, STEP_COOLDOWN, END_LAP_BUTTON, None, exercise_category, exercise_name, description)

def build_workout(name, sport_type, steps):
    return {
        "workoutName": name,
        "sportType": sport_type,
        "workoutSegments": [{
            "segmentOrder": 1,
            "sportType": sport_type,
            "workoutSteps": steps,
        }],
    }

# ===========================================================
# WORKOUT DEFINITIONS
# ===========================================================
def gen_monday(week):
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
    return build_workout(f"W{week}D1 Lower Strength", SPORT_STRENGTH, steps)

def gen_tuesday(week):
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
    return build_workout(f"W{week}D2 Run+Intervals", SPORT_RUNNING, steps)

def gen_wednesday(week):
    steps = [
        warmup_step(1, seconds=1200, description="Easy Bike/Walk 20min"),
        active_step(2, seconds=900, description="Mobility Flow 15min"),
        active_step(3, seconds=600, description="Foam Rolling 10min"),
        cooldown_step(4, seconds=600, description="IT Band Work 10min"),
    ]
    return build_workout(f"W{week}D3 Recovery", SPORT_CARDIO, steps)

def gen_thursday(week):
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
    return build_workout(f"W{week}D4 Hybrid Stations", SPORT_CARDIO, steps)

def gen_friday(week):
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
    return build_workout(f"W{week}D5 Upper+Plyo", SPORT_STRENGTH, steps)

def gen_saturday(week):
    steps = [
        warmup_step(1, seconds=300, description="REST DAY - Light Walk"),
        active_step(2, seconds=1800, description="Walk/Stretch (optional)"),
        cooldown_step(3, description="Done!"),
    ]
    return build_workout(f"W{week}D6 REST DAY", SPORT_CARDIO, steps)

def gen_sunday(week):
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
    return build_workout(f"W{week}D7 Long Run+Stations", SPORT_RUNNING, steps)


# ===========================================================
# UPLOAD VIA DIRECT HTTP
# ===========================================================
def upload_workout(workout_json):
    """POST workout JSON directly to Garmin Connect."""
    url = f"{BASE_URL}/workout"
    resp = requests.post(url, headers=HEADERS, json=workout_json)
    
    if resp.status_code in (200, 201):
        data = resp.json()
        return data
    else:
        raise Exception(f"HTTP {resp.status_code}: {resp.text[:300]}")


def main():
    print("=" * 55)
    print("  HYROX -> Garmin Connect Uploader v2")
    print("  [Direct HTTP - Using browser cookies]")
    print("=" * 55)
    
    # Quick connection test
    print("\n[*] Testing connection...")
    test_url = f"{BASE_URL}/workouts?start=0&limit=1"
    resp = requests.get(test_url, headers=HEADERS)
    if resp.status_code == 200:
        print("[OK] Connected to Garmin Connect!")
    else:
        print(f"[ERROR] Connection failed: HTTP {resp.status_code}")
        print("  Your cookies may have expired. Re-grab from browser.")
        return
    
    generators = [
        ("Monday", gen_monday),
        ("Tuesday", gen_tuesday),
        ("Wednesday", gen_wednesday),
        ("Thursday", gen_thursday),
        ("Friday", gen_friday),
        ("Saturday", gen_saturday),
        ("Sunday", gen_sunday),
    ]
    
    uploaded = 0
    failed = 0
    
    for week in [1, 2, 3]:
        print(f"\n--- Week {week} ---")
        for day_name, gen_func in generators:
            workout = gen_func(week)
            name = workout["workoutName"]
            
            try:
                result = upload_workout(workout)
                wid = result.get("workoutId", "?") if isinstance(result, dict) else "?"
                print(f"  [OK] {name} (id: {wid})")
                uploaded += 1
                time.sleep(0.5)
            except Exception as e:
                print(f"  [FAIL] {name}: {e}")
                failed += 1
                time.sleep(1)
    
    print()
    print("=" * 55)
    print(f"  DONE! Uploaded: {uploaded} | Failed: {failed}")
    print()
    if uploaded > 0:
        print("  Open Garmin Connect app on your phone")
        print("  and sync your watch via Bluetooth!")
    print("=" * 55)


if __name__ == "__main__":
    main()
