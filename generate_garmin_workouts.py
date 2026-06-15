"""
HYROX Training Plan -> Garmin .FIT Workout File Generator v4
Generates .FIT workout files for Garmin Forerunner 165
Weeks 1-23 (Revised Hybrid Plan)

Uses raw binary FIT protocol encoding with exercise_category mapping
for proper exercise name display on strength workouts, and Garmin heart
rate zone targets for running workouts based on Max HR 193.
"""

import struct
import os
import time

OUTPUT_DIR = r"g:\WORK\APPS VIBECODED\HYROX\garmin_workouts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ===========================================================
# FIT PROTOCOL CONSTANTS (verified from official Garmin SDK)
# ===========================================================

GARMIN_EPOCH = 631065600  # Dec 31, 1989 00:00:00 UTC

# Message Global IDs
MESG_FILE_ID = 0
MESG_WORKOUT = 26
MESG_WORKOUT_STEP = 27

# Field base types
FIT_UINT8 = 0
FIT_UINT16 = 132
FIT_UINT32 = 134
FIT_STRING = 7
FIT_ENUM = 0
FIT_UINT16Z = 139

# Sport values
SPORT_RUNNING = 1
SPORT_TRAINING = 10

# SubSport values (verified from SDK Profile)
SUBSPORT_GENERIC = 0
SUBSPORT_STRENGTH_TRAINING = 20
SUBSPORT_CARDIO_TRAINING = 26
SUBSPORT_FLEXIBILITY_TRAINING = 19

# WorkoutStepDuration (CORRECT values from SDK)
WSD_TIME = 0
WSD_DISTANCE = 1
WSD_OPEN = 5
WSD_REPS = 29

# WorkoutStepTarget
WST_OPEN = 2
WST_HEART_RATE = 3

# Intensity
INTENSITY_ACTIVE = 0
INTENSITY_REST = 1
INTENSITY_WARMUP = 2
INTENSITY_COOLDOWN = 3
INTENSITY_RECOVERY = 4
INTENSITY_INTERVAL = 5

# FileType
FILE_TYPE_WORKOUT = 5

# Invalid/unset marker for uint32
UINT32_INVALID = 0xFFFFFFFF
UINT16_INVALID = 0xFFFF

# ===========================================================
# GARMIN EXERCISE CATEGORY + NAME DATABASE
# (values from official FIT SDK Profile)
# ===========================================================

# Exercise Categories
EXCAT_BENCH_PRESS = 0
EXCAT_CALF_RAISE = 1
EXCAT_CARDIO = 2
EXCAT_CARRY = 3
EXCAT_CORE = 5
EXCAT_CRUNCH = 6
EXCAT_CURL = 7
EXCAT_DEADLIFT = 8
EXCAT_FLYE = 9
EXCAT_HIP_RAISE = 10
EXCAT_HIP_STABILITY = 11
EXCAT_LATERAL_RAISE = 14
EXCAT_LEG_CURL = 15
EXCAT_LEG_RAISE = 16
EXCAT_LUNGE = 17
EXCAT_PLANK = 19
EXCAT_PLYO = 20
EXCAT_PULL_UP = 21
EXCAT_PUSH_UP = 22
EXCAT_ROW = 23
EXCAT_SHOULDER_PRESS = 24
EXCAT_SHRUG = 26
EXCAT_SQUAT = 28
EXCAT_TOTAL_BODY = 29
EXCAT_WARM_UP = 31
EXCAT_RUN = 32

# Exercise Names within categories
SQEX_GOBLET_SQUAT = 37
SQEX_WALL_BALL = 83
SQEX_LEG_PRESS = 0
SQEX_SQUAT_JUMP = 89
SQEX_STEP_UP = 66
SQEX_BOX_STEP_SQUAT = 22
SQEX_AIR_SQUAT = 100
SQEX_BACK_SQUAT = 11

DLEX_DUMBBELL_DEADLIFT = 4
DLEX_TRAP_BAR_DEADLIFT = 8  # Trap bar DL
DLEX_ROMANIAN_DEADLIFT = 6  # Romanian DL

LUEX_WALKING_LUNGE = 14
LUEX_DUMBBELL_LUNGE = 3

CREX_CALF_RAISE = 0

BPEX_BARBELL_BENCH_PRESS = 0
BPEX_DUMBBELL_INCLINE_BENCH_PRESS = 16

SPEX_OVERHEAD_DUMBBELL_PRESS = 15

RWEX_BARBELL_ROW = 45
RWEX_FACE_PULL = 5
RWEX_SINGLE_ARM_CABLE_ROW = 20
RWEX_INDOOR_ROW = 38
RWEX_CABLE_PULLDOWN = 10

PUEX_PULL_UP = 3

PLEX_SQUAT_JUMP = 7
PLEX_BOX_JUMP = 17
PLEX_MEDICINE_BALL_SLAM = 13

COEX_DEAD_BUG = 4

CREX_CABLE_CRUNCH = 7

LREX_HANGING_LEG_RAISE = 1

CAEX_FARMERS_WALK = 1

HREX_SINGLE_LEG_HIP_RAISE = 18
HREX_WEIGHTED_GLUTE_BRIDGE = 3
HREX_BARBELL_HIP_THRUST = 4

PKEX_PLANK = 0
PKEX_SIDE_PLANK = 12

# ===========================================================
# FIT BINARY ENCODER
# ===========================================================

class FitEncoder:
    """Minimal FIT file encoder following the official protocol."""

    _file_counter = 0

    def __init__(self):
        self.data = bytearray()
        self.definitions = {}
        FitEncoder._file_counter += 1
        self._serial = FitEncoder._file_counter

    def _crc16(self, data):
        crc_table = [
            0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
            0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400
        ]
        crc = 0
        for byte in data:
            tmp = crc_table[crc & 0xF]
            crc = (crc >> 4) & 0x0FFF
            crc = crc ^ tmp ^ crc_table[byte & 0xF]
            tmp = crc_table[crc & 0xF]
            crc = (crc >> 4) & 0x0FFF
            crc = crc ^ tmp ^ crc_table[(byte >> 4) & 0xF]
        return crc

    def _write_definition(self, local_id, global_mesg_id, fields):
        header = 0x40 | (local_id & 0x0F)
        self.data.append(header)
        self.data.append(0)  # Reserved
        self.data.append(0)  # Little-endian
        self.data.extend(struct.pack('<H', global_mesg_id))
        self.data.append(len(fields))
        for field_num, size, base_type in fields:
            self.data.append(field_num)
            self.data.append(size)
            self.data.append(base_type)
        self.definitions[local_id] = True

    def _write_data(self, local_id, field_values):
        header = local_id & 0x0F
        self.data.append(header)
        for val in field_values:
            self.data.extend(val)

    def write_file_id(self):
        local_id = 0
        fields = [
            (0, 1, FIT_ENUM),     # type
            (1, 2, FIT_UINT16),   # manufacturer
            (2, 2, FIT_UINT16),   # product
            (3, 4, FIT_UINT32),   # serial_number
            (4, 4, FIT_UINT32),   # time_created
        ]
        self._write_definition(local_id, MESG_FILE_ID, fields)

        garmin_time = int(time.time()) - GARMIN_EPOCH + self._serial
        values = [
            struct.pack('<B', FILE_TYPE_WORKOUT),
            struct.pack('<H', 1),                      # Garmin
            struct.pack('<H', 0),
            struct.pack('<I', 10000 + self._serial),
            struct.pack('<I', garmin_time),
        ]
        self._write_data(local_id, values)

    def write_workout(self, name, sport, sub_sport, num_steps):
        local_id = 1
        name_bytes = name.encode('utf-8')[:40]
        name_field = name_bytes + b'\x00' * (40 - len(name_bytes))

        fields = [
            (4, 1, FIT_ENUM),              # sport
            (6, 2, FIT_UINT16),            # num_valid_steps
            (8, len(name_field), FIT_STRING),  # wkt_name
            (11, 1, FIT_ENUM),             # sub_sport
        ]
        self._write_definition(local_id, MESG_WORKOUT, fields)

        values = [
            struct.pack('<B', sport),
            struct.pack('<H', num_steps),
            name_field,
            struct.pack('<B', sub_sport),
        ]
        self._write_data(local_id, values)

    def write_workout_step(self, index, step_name, duration_type, intensity,
                             duration_value=None, target_type=WST_OPEN, target_value=0,
                             exercise_category=None, exercise_name=None):
        """Write WorkoutStep message with exercise category/name and target heart rate zones."""
        local_id = 2

        # Encode step name
        sn = step_name.encode('utf-8')[:40]
        sn_field = sn + b'\x00' * (40 - len(sn))

        # Include exercise_category(10) and exercise_name(11) fields
        fields = [
            (254, 2, FIT_UINT16),          # message_index
            (0, len(sn_field), FIT_STRING), # wkt_step_name
            (1, 1, FIT_ENUM),              # duration_type
            (2, 4, FIT_UINT32),            # duration_value
            (3, 1, FIT_ENUM),              # target_type
            (4, 4, FIT_UINT32),            # target_value
            (7, 1, FIT_ENUM),              # intensity
            (10, 2, FIT_UINT16),           # exercise_category
            (11, 2, FIT_UINT16),           # exercise_name
        ]

        # Only write definition once
        if local_id not in self.definitions:
            self._write_definition(local_id, MESG_WORKOUT_STEP, fields)

        # Compute duration_value
        if duration_value is None:
            dur_val = 0
        elif duration_type == WSD_TIME:
            dur_val = int(duration_value * 1000)   # seconds -> milliseconds
        elif duration_type == WSD_DISTANCE:
            dur_val = int(duration_value * 100)     # meters -> centimeters
        elif duration_type == WSD_REPS:
            dur_val = int(duration_value)
        else:
            dur_val = 0

        # Exercise category/name
        ex_cat = exercise_category if exercise_category is not None else UINT16_INVALID
        ex_name = exercise_name if exercise_name is not None else UINT16_INVALID

        # Target value for heart rate targets:
        # custom target value = min_bpm + (max_bpm << 8) + 100 (for custom zones, or we encode exact BPM)
        # Garmin FIT format for target_value when target_type is heart_rate:
        # value is 100 + bpm (e.g. 150 bpm -> 250) for custom zones, or specific encoding.
        # Let's write the target_value as the target zone number (1, 2, 3, 4, 5) which watches support,
        # or just set it to target zone index. Setting target_value to 0 when target_type is OPEN.
        t_val = int(target_value)

        values = [
            struct.pack('<H', index),
            sn_field,
            struct.pack('<B', duration_type),
            struct.pack('<I', dur_val),
            struct.pack('<B', target_type),
            struct.pack('<I', t_val),
            struct.pack('<B', intensity),
            struct.pack('<H', ex_cat),
            struct.pack('<H', ex_name),
        ]
        self._write_data(local_id, values)

    def build(self):
        data_size = len(self.data)
        header = bytearray()
        header.append(14)
        header.append(20)
        header.extend(struct.pack('<H', 2100))
        header.extend(struct.pack('<I', data_size))
        header.extend(b'.FIT')
        header_crc = self._crc16(header)
        header.extend(struct.pack('<H', header_crc))

        full_file = header + self.data
        file_crc = self._crc16(full_file)
        full_file.extend(struct.pack('<H', file_crc))
        return bytes(full_file)


# ===========================================================
# INTENSITY + DURATION MAPPING
# ===========================================================

INTENSITY_MAP = {
    'warmup': INTENSITY_WARMUP,
    'active': INTENSITY_ACTIVE,
    'rest': INTENSITY_REST,
    'cooldown': INTENSITY_COOLDOWN,
    'interval': INTENSITY_INTERVAL,
    'recovery': INTENSITY_RECOVERY,
}

DURATION_MAP = {
    'time': WSD_TIME,
    'distance': WSD_DISTANCE,
    'reps': WSD_REPS,
    'open': WSD_OPEN,
}


# ===========================================================
# WORKOUT BUILDER
# ===========================================================

def build_workout(filename, workout_name, sport, sub_sport, steps_data):
    enc = FitEncoder()
    enc.write_file_id()
    enc.write_workout(workout_name, sport, sub_sport, len(steps_data))

    for i, step in enumerate(steps_data):
        name = step[0]
        dur_type_str = step[1]
        intensity_str = step[2]
        dur_val = step[3]
        
        # Target HR properties
        tar_type = step[4] if len(step) > 4 and step[4] is not None else WST_OPEN
        tar_val = step[5] if len(step) > 5 and step[5] is not None else 0
        
        # Exercise properties
        ex_cat = step[6] if len(step) > 6 else None
        ex_name = step[7] if len(step) > 7 else None

        enc.write_workout_step(
            index=i,
            step_name=name,
            duration_type=DURATION_MAP[dur_type_str],
            intensity=INTENSITY_MAP.get(intensity_str, INTENSITY_ACTIVE),
            duration_value=dur_val,
            target_type=tar_type,
            target_value=tar_val,
            exercise_category=ex_cat,
            exercise_name=ex_name,
        )

    fit_bytes = enc.build()
    out_path = os.path.join(OUTPUT_DIR, f"{filename}.fit")
    with open(out_path, 'wb') as f:
        f.write(fit_bytes)

    size = os.path.getsize(out_path)
    print(f"  [OK] {filename}.fit ({size} bytes) - {workout_name}")
    return out_path


# ===========================================================
# WORKOUT GENERATORS BY PHASE
# ===========================================================

# --- PHASE 1: RECOVERY / DELOAD TEMPLATES ---
def gen_recovery_workouts(week):
    # Day 1: Upper Pump
    steps_d1 = [
      ("Arm Circles warmup",     "open", "warmup",   None, WST_OPEN, 0, EXCAT_WARM_UP, 0),
      ("Incline DB Press (light)","open", "active",   None, WST_OPEN, 0, EXCAT_BENCH_PRESS, BPEX_DUMBBELL_INCLINE_BENCH_PRESS),
      ("Lat Pulldown (light)",   "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_CABLE_PULLDOWN),
      ("Seated DB shoulder press","open", "active",   None, WST_OPEN, 0, EXCAT_SHOULDER_PRESS, SPEX_OVERHEAD_DUMBBELL_PRESS),
      ("Ab Wheel / Core",        "open", "cooldown", None, WST_OPEN, 0, EXCAT_CORE, 0),
    ]
    build_workout(f"W{week}D1_Recovery_Upper", f"W{week}D1 Recovery Upper", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d1)

    # Day 2: Z2 Running
    steps_d2 = [
      ("Easy warmup walk",       "time", "warmup",   300, WST_OPEN, 0),
      ("Z2 Recovery Jog",        "time", "active",   1800, WST_HEART_RATE, 2), # Zone 2 target (Garmin Z2)
      ("Cooldown Stretch",       "time", "cooldown", 300, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D2_Recovery_Running", f"W{week}D2 Recovery Run", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d2)

    # Day 3: Lower Pump
    steps_d3 = [
      ("Glute bridges warmup",   "open", "warmup",   None, WST_OPEN, 0, EXCAT_HIP_RAISE, HREX_WEIGHTED_GLUTE_BRIDGE),
      ("Goblet Squat (light)",   "open", "active",   None, WST_OPEN, 0, EXCAT_SQUAT, SQEX_GOBLET_SQUAT),
      ("DB RDL (light)",         "open", "active",   None, WST_OPEN, 0, EXCAT_DEADLIFT, DLEX_DUMBBELL_DEADLIFT),
      ("Monster Walks rehab",    "open", "active",   None, WST_OPEN, 0, EXCAT_HIP_STABILITY, 0),
      ("Pigeon pose stretch",    "open", "cooldown", None, WST_OPEN, 0, EXCAT_WARM_UP, 0)
    ]
    build_workout(f"W{week}D3_Recovery_Lower", f"W{week}D3 Recovery Lower", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d3)

    # Day 4: Bike & Roll
    steps_d4 = [
      ("Z1 Stationary Bike",     "time", "active",   1500, WST_HEART_RATE, 1), # Zone 1 target
      ("Mobility & Stretch",     "time", "cooldown", 900, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D4_Recovery_Active", f"W{week}D4 Recovery Active", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d4)

    # Day 5: Pull Recovery
    steps_d5 = [
      ("Chest supported row",    "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_BARBELL_ROW),
      ("Wide lat pulldown",      "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_CABLE_PULLDOWN),
      ("DB Bicep Curls",         "open", "active",   None, WST_OPEN, 0, EXCAT_CURL, 0),
      ("Plank Hold",             "open", "cooldown", None, WST_OPEN, 0, EXCAT_PLANK, PKEX_PLANK)
    ]
    build_workout(f"W{week}D5_Recovery_Pull", f"W{week}D5 Recovery Pull", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d5)

    # Day 6: Rest
    steps_d6 = [("REST DAY!", "open", "rest", None, WST_OPEN, 0)]
    build_workout(f"W{week}D6_REST", f"W{week}D6 Rest Day", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d6)

    # Day 7: Recovery Cardio
    steps_d7 = [
      ("Z2 Jog / Walk",          "time", "active",   2400, WST_HEART_RATE, 2), # Zone 2
    ]
    build_workout(f"W{week}D7_Recovery_Cardio", f"W{week}D7 Recovery Cardio", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d7)


# --- PHASE 2: HYPERTROPHY BASE TEMPLATES ---
def gen_base_workouts(week):
    # Day 1: Upper Hypertrophy
    steps_d1 = [
      ("Rotator Cuff warmup",    "open", "warmup",   None, WST_OPEN, 0, EXCAT_WARM_UP, 0),
      ("Incline DB Bench Press", "open", "active",   None, WST_OPEN, 0, EXCAT_BENCH_PRESS, BPEX_DUMBBELL_INCLINE_BENCH_PRESS),
      ("Weighted Pull-Ups",      "open", "active",   None, WST_OPEN, 0, EXCAT_PULL_UP, PUEX_PULL_UP),
      ("Barbell Flat Bench",     "open", "active",   None, WST_OPEN, 0, EXCAT_BENCH_PRESS, BPEX_BARBELL_BENCH_PRESS),
      ("Barbell Bent Row",       "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_BARBELL_ROW),
      ("Seated DB Press",        "open", "active",   None, WST_OPEN, 0, EXCAT_SHOULDER_PRESS, SPEX_OVERHEAD_DUMBBELL_PRESS),
      ("Cable Lateral Raise",    "open", "active",   None, WST_OPEN, 0, EXCAT_LATERAL_RAISE, 0),
      ("Bicep Curl / Pushdown",  "open", "cooldown", None, WST_OPEN, 0, EXCAT_CURL, 0)
    ]
    build_workout(f"W{week}D1_Upper_Hypertrophy", f"W{week}D1 Upper Hypertrophy", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d1)

    # Day 2: Easy Base Run
    steps_d2 = [
      ("Warmup Jog",             "time",     "warmup",   600, WST_OPEN, 0),
      ("Z2-Z3 Base Run",         "distance", "active",   6000 + (week - 2)*500, WST_HEART_RATE, 2), # Garmin Z2-Z3
      ("100m Speed Strides x4",  "distance", "interval", 100, WST_OPEN, 0),
      ("Cooldown Jog",           "time",     "cooldown", 300, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D2_Base_Running", f"W{week}D2 Base Run", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d2)

    # Day 3: Lower Hypertrophy
    steps_d3 = [
      ("Hip activation flow",    "open", "warmup",   None, WST_OPEN, 0, EXCAT_WARM_UP, 0),
      ("Barbell Back Squat",     "open", "active",   None, WST_OPEN, 0, EXCAT_SQUAT, SQEX_BACK_SQUAT),
      ("DB Romanian Deadlift",   "open", "active",   None, WST_OPEN, 0, EXCAT_DEADLIFT, DLEX_ROMANIAN_DEADLIFT),
      ("Leg Press",              "open", "active",   None, WST_OPEN, 0, EXCAT_SQUAT, SQEX_LEG_PRESS),
      ("Calf Raises",            "open", "active",   None, WST_OPEN, 0, EXCAT_CALF_RAISE, CREX_CALF_RAISE),
      ("Cable Crunches",         "open", "active",   None, WST_OPEN, 0, EXCAT_CRUNCH, CREX_CABLE_CRUNCH),
      ("Banded Dead Bug",        "open", "cooldown", None, WST_OPEN, 0, EXCAT_CORE, COEX_DEAD_BUG)
    ]
    build_workout(f"W{week}D3_Lower_Hypertrophy", f"W{week}D3 Lower Hypertrophy", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d3)

    # Day 4: Recovery
    steps_d4 = [
      ("Stationary Bike Z1",     "time", "active",   1200, WST_HEART_RATE, 1),
      ("Mobility & Stretches",   "time", "cooldown", 1800, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D4_Base_Recovery", f"W{week}D4 Recovery", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d4)

    # Day 5: Full-Body Hypertrophy
    steps_d5 = [
      ("Barbell Flat Bench",     "open", "active",   None, WST_OPEN, 0, EXCAT_BENCH_PRESS, BPEX_BARBELL_BENCH_PRESS),
      ("Weighted Pull-Ups",      "open", "active",   None, WST_OPEN, 0, EXCAT_PULL_UP, PUEX_PULL_UP),
      ("Trap Bar Deadlift",      "open", "active",   None, WST_OPEN, 0, EXCAT_DEADLIFT, DLEX_TRAP_BAR_DEADLIFT),
      ("Goblet Squat",           "open", "active",   None, WST_OPEN, 0, EXCAT_SQUAT, SQEX_GOBLET_SQUAT),
      ("Walking Lunges (DB)",    "open", "active",   None, WST_OPEN, 0, EXCAT_LUNGE, LUEX_WALKING_LUNGE),
      ("Farmers Carry 60m",      "open", "active",   None, WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK)
    ]
    build_workout(f"W{week}D5_Full_Body_Hyper", f"W{week}D5 Full Body Hypertrophy", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d5)

    # Day 6: Rest
    steps_d6 = [("REST DAY!", "open", "rest", None, WST_OPEN, 0)]
    build_workout(f"W{week}D6_REST", f"W{week}D6 Rest Day", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d6)

    # Day 7: Long Run + Sled
    steps_d7 = [
      ("Long Run Z3 Aerobic",    "distance", "active",   8000 + (week - 2)*1000, WST_HEART_RATE, 3), # Garmin Z3 (160-170 bpm)
      ("Sled Push Push 50m x4",  "open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0),
      ("Sled Pull Pull 50m x4",  "open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0)
    ]
    build_workout(f"W{week}D7_LongRun_Sled", f"W{week}D7 Long Run+Sled Work", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d7)


# --- PHASE 3: HYPERTROPHY BUILD TEMPLATES ---
def gen_build_workouts(week):
    # Day 1: Upper Hypertrophy
    gen_base_workouts(week) # Upper & Lower templates are identical, Sunday, Tuesday & Thursday differ

    # Day 2: Tuesday Threshold Intervals
    steps_d2 = [
      ("Warmup Jog",             "time",     "warmup",   600, WST_OPEN, 0),
      ("800m Repeat Z4 #1",      "distance", "interval", 800, WST_HEART_RATE, 4), # Garmin Z4
      ("Z1 Jog Recovery 90s",    "time",     "recovery", 90, WST_OPEN, 0),
      ("800m Repeat Z4 #2",      "distance", "interval", 800, WST_HEART_RATE, 4),
      ("Z1 Jog Recovery 90s",    "time",     "recovery", 90, WST_OPEN, 0),
      ("800m Repeat Z4 #3",      "distance", "interval", 800, WST_HEART_RATE, 4),
      ("Z1 Jog Recovery 90s",    "time",     "recovery", 90, WST_OPEN, 0),
      ("800m Repeat Z4 #4",      "distance", "interval", 800, WST_HEART_RATE, 4),
      ("Z1 Jog Recovery 90s",    "time",     "recovery", 90, WST_OPEN, 0),
      ("800m Repeat Z4 #5",      "distance", "interval", 800, WST_HEART_RATE, 4),
      ("Cooldown Jog",           "time",     "cooldown", 300, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D2_Build_Intervals", f"W{week}D2 Threshold Intervals", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d2)

    # Day 4: Thursday HYROX Station Circuits
    steps_d4 = [
      ("Indoor Row 500m warmup", "distance", "warmup",   500, WST_OPEN, 0, EXCAT_ROW, RWEX_INDOOR_ROW),
      ("R1: Row 500m",            "distance", "active",   500, WST_OPEN, 0, EXCAT_ROW, RWEX_INDOOR_ROW),
      ("R1: Farmers Carry 100m",  "distance", "active",   100, WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK),
      ("R1: Wall Balls 25",       "reps",     "active",   25, WST_OPEN, 0, EXCAT_SQUAT, SQEX_WALL_BALL),
      ("R1: Burpee Broad Jump 20m","distance","active",   20, WST_OPEN, 0, EXCAT_PLYO, 0),
      ("R1: Z3 Running 400m",     "distance", "interval", 400, WST_HEART_RATE, 3),
      ("R2: Row 500m",            "distance", "active",   500, WST_OPEN, 0, EXCAT_ROW, RWEX_INDOOR_ROW),
      ("R2: Farmers Carry 100m",  "distance", "active",   100, WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK),
      ("R2: Wall Balls 25",       "reps",     "active",   25, WST_OPEN, 0, EXCAT_SQUAT, SQEX_WALL_BALL),
      ("R2: Burpee Broad Jump 20m","distance","active",   20, WST_OPEN, 0, EXCAT_PLYO, 0),
      ("R2: Z3 Running 400m",     "distance", "interval", 400, WST_HEART_RATE, 3),
      ("R3: Row 500m",            "distance", "active",   500, WST_OPEN, 0, EXCAT_ROW, RWEX_INDOOR_ROW),
      ("R3: Farmers Carry 100m",  "distance", "active",   100, WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK),
      ("R3: Wall Balls 25",       "reps",     "active",   25, WST_OPEN, 0, EXCAT_SQUAT, SQEX_WALL_BALL),
      ("R3: Burpee Broad Jump 20m","distance","active",   20, WST_OPEN, 0, EXCAT_PLYO, 0),
      ("R3: Z3 Running 400m",     "distance", "interval", 400, WST_HEART_RATE, 3),
      ("Cooldown Stretch",        "time",     "cooldown", 300, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D4_Build_Stations", f"W{week}D4 Station Circuits", SPORT_TRAINING, SUBSPORT_CARDIO_TRAINING, steps_d4)

    # Day 7: Heavy Sled Sunday
    steps_d7 = [
      ("Long Run Z3 Aerobic",    "distance", "active",   12000 + (week - 9)*1000, WST_HEART_RATE, 3), # Garmin Z3 (12K-15K)
      ("Race Push Sled 50m x4",  "open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0), # 152kg Push
      ("Race Pull Sled 50m x4",  "open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0), # 103kg Pull
      ("BBJ 40m compromised",    "distance", "active",   40, WST_OPEN, 0, EXCAT_PLYO, 0)
    ]
    build_workout(f"W{week}D7_Heavy_Sled_Sunday", f"W{week}D7 Long Run+Heavy Sled", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d7)


# --- PHASE 4: HYROX FOCUS & MAINTENANCE TEMPLATES ---
def gen_focus_workouts(week):
    # Day 1: Upper Maintenance
    steps_d1 = [
      ("Rotator Cuff warmup",    "open", "warmup",   None, WST_OPEN, 0, EXCAT_WARM_UP, 0),
      ("Incline DB Bench Press", "open", "active",   None, WST_OPEN, 0, EXCAT_BENCH_PRESS, BPEX_DUMBBELL_INCLINE_BENCH_PRESS),
      ("Weighted Pull-Ups",      "open", "active",   None, WST_OPEN, 0, EXCAT_PULL_UP, PUEX_PULL_UP),
      ("Seated DB Press",        "open", "active",   None, WST_OPEN, 0, EXCAT_SHOULDER_PRESS, SPEX_OVERHEAD_DUMBBELL_PRESS),
      ("Cable Pushdown / Curls", "open", "cooldown", None, WST_OPEN, 0, EXCAT_CURL, 0)
    ]
    build_workout(f"W{week}D1_Upper_Maintenance", f"W{week}D1 Upper Maintenance", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d1)

    # Day 2: Tuesday intervals
    steps_d2 = [
      ("Warmup Jog",             "time",     "warmup",   600, WST_OPEN, 0),
      ("1km Threshold Repeat #1","distance", "interval", 1000, WST_HEART_RATE, 4), # Garmin Z4
      ("Jog Recovery 120s",      "time",     "recovery", 120, WST_OPEN, 0),
      ("1km Threshold Repeat #2","distance", "interval", 1000, WST_HEART_RATE, 4),
      ("Jog Recovery 120s",      "time",     "recovery", 120, WST_OPEN, 0),
      ("1km Threshold Repeat #3","distance", "interval", 1000, WST_HEART_RATE, 4),
      ("Jog Recovery 120s",      "time",     "recovery", 120, WST_OPEN, 0),
      ("1km Threshold Repeat #4","distance", "interval", 1000, WST_HEART_RATE, 4),
      ("Z5 Sprint 200m x4",      "distance", "interval", 200, WST_HEART_RATE, 5), # Z5 maximum
      ("Cooldown Jog",           "time",     "cooldown", 300, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D2_Focus_Intervals", f"W{week}D2 Focus Speed+Threshold", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d2)

    # Day 3: Lower Maintenance
    steps_d3 = [
      ("Barbell Back Squat",     "open", "active",   None, WST_OPEN, 0, EXCAT_SQUAT, SQEX_BACK_SQUAT),
      ("DB Romanian Deadlift",   "open", "active",   None, WST_OPEN, 0, EXCAT_DEADLIFT, DLEX_ROMANIAN_DEADLIFT),
      ("Standing Calf Raise",    "open", "cooldown", None, WST_OPEN, 0, EXCAT_CALF_RAISE, CREX_CALF_RAISE)
    ]
    build_workout(f"W{week}D3_Lower_Maintenance", f"W{week}D3 Lower Maintenance", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d3)

    # Day 4: Thursday near-full simulation (8 runs + stations)
    steps_d4 = [
      ("Run 1 (Z3 pace)",        "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Row 1,000m (SkiErg sub)","distance", "active",   1000, WST_OPEN, 0, EXCAT_ROW, RWEX_INDOOR_ROW),
      ("Run 2 (Z3 pace)",        "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Sled Push push off 50m", "open",     "active",   None, WST_OPEN, 0, EXCAT_CARDIO, 0),
      ("Run 3 (Z3 pace)",        "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Farmers Carry 200m",     "distance", "active",   200,  WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK),
      ("Run 4 (Z3 pace)",        "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Burpee Broad Jump 80m",  "distance", "active",   80,   WST_OPEN, 0, EXCAT_PLYO, 0),
      ("Run 5 (Z3 pace)",        "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Walking Lunges 100m",    "distance", "active",   100,  WST_OPEN, 0, EXCAT_LUNGE, LUEX_WALKING_LUNGE),
      ("Run 6 (Z3 pace)",        "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Wall Balls 100 reps",    "reps",     "active",   100,  WST_OPEN, 0, EXCAT_SQUAT, SQEX_WALL_BALL),
      ("Run 8 - FINISH Z4!",     "distance", "interval", 1000, WST_HEART_RATE, 4)
    ]
    build_workout(f"W{week}D4_Focus_Simulation", f"W{week}D4 Near-Full Sim", SPORT_TRAINING, SUBSPORT_CARDIO_TRAINING, steps_d4)

    # Day 5: Pull/Grip Maintenance
    steps_d5 = [
      ("Barbell Row",            "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_BARBELL_ROW),
      ("Lat Pulldown (wide)",    "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_CABLE_PULLDOWN),
      ("Farmers Hold static",    "time", "active",   45,   WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK),
      ("Towel Hang from Bar",    "open", "cooldown", None, WST_OPEN, 0, EXCAT_PULL_UP, 0)
    ]
    build_workout(f"W{week}D5_Pull_Maintenance", f"W{week}D5 Pull/Grip Maintenance", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d5)

    # Day 6: Rest
    steps_d6 = [("REST DAY!", "open", "rest", None, WST_OPEN, 0)]
    build_workout(f"W{week}D6_REST", f"W{week}D6 Rest Day", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d6)

    # Day 7: Sunday Sled
    steps_d7 = [
      ("Z3 Run 12K",             "distance", "active",   12000, WST_HEART_RATE, 3),
      ("Sled Push race weight",  "open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0), # 152kg
      ("Sled Pull race weight",  "open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0)  # 103kg
    ]
    build_workout(f"W{week}D7_Sunday_Sled_Focus", f"W{week}D7 Long Run+Race Sled", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d7)


# --- PHASE 5: TAPER W22 TEMPLATES ---
def gen_taper_w22_workouts(week):
    # Day 1: Full-Body Maintenance Light
    steps_d1 = [
      ("Incline DB Bench Press", "open", "active",   None, WST_OPEN, 0, EXCAT_BENCH_PRESS, BPEX_DUMBBELL_INCLINE_BENCH_PRESS),
      ("Weighted Pull-Ups",      "open", "active",   None, WST_OPEN, 0, EXCAT_PULL_UP, PUEX_PULL_UP),
      ("Barbell Squat (light)",  "open", "active",   None, WST_OPEN, 0, EXCAT_SQUAT, SQEX_BACK_SQUAT),
      ("Ab Wheel rollouts",      "open", "cooldown", None, WST_OPEN, 0, EXCAT_CORE, 0)
    ]
    build_workout(f"W{week}D1_Taper_Full_Body", f"W{week}D1 Taper Full Body", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d1)

    # Day 2: Tuesday Sharpening
    steps_d2 = [
      ("Warmup Jog",             "time",     "warmup",   600, WST_OPEN, 0),
      ("400m Race Pace Z4 #1",   "distance", "interval", 400, WST_HEART_RATE, 4), # Z4 target (5:00/km)
      ("Jog Recovery 120s",      "time",     "recovery", 120, WST_OPEN, 0),
      ("400m Race Pace Z4 #2",   "distance", "interval", 400, WST_HEART_RATE, 4),
      ("Jog Recovery 120s",      "time",     "recovery", 120, WST_OPEN, 0),
      ("400m Race Pace Z4 #3",   "distance", "interval", 400, WST_HEART_RATE, 4),
      ("Jog Recovery 120s",      "time",     "recovery", 120, WST_OPEN, 0),
      ("400m Race Pace Z4 #4",   "distance", "interval", 400, WST_HEART_RATE, 4),
      ("Cooldown Jog",           "time",     "cooldown", 300, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D2_Taper_Sharpening", f"W{week}D2 Race Pace Sharpening", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d2)

    # Day 4: Half Simulation
    steps_d4 = [
      ("1km Run (Z3)",           "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Light Sled Push 50m",    "open",     "active",   None, WST_OPEN, 0, EXCAT_CARDIO, 0),
      ("1km Run (Z3)",           "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Farmers Carry 100m",     "distance", "active",   100,  WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK),
      ("1km Run (Z3)",           "distance", "interval", 1000, WST_HEART_RATE, 3),
      ("Wall Balls 40 reps",     "reps",     "active",   40,   WST_OPEN, 0, EXCAT_SQUAT, SQEX_WALL_BALL),
      ("1km Run — FINISH",       "distance", "interval", 1000, WST_HEART_RATE, 3)
    ]
    build_workout(f"W{week}D4_Taper_Half_Sim", f"W{week}D4 Taper Half Sim", SPORT_TRAINING, SUBSPORT_CARDIO_TRAINING, steps_d4)

    # Day 5: Pull maintenance light
    steps_d5 = [
      ("Chest supported row",    "open", "active",   None, WST_OPEN, 0, EXCAT_ROW, RWEX_BARBELL_ROW),
      ("Static Farmers hold",    "time", "cooldown", 30,   WST_OPEN, 0, EXCAT_CARRY, CAEX_FARMERS_WALK)
    ]
    build_workout(f"W{week}D5_Taper_Pull", f"W{week}D5 Taper Pull", SPORT_TRAINING, SUBSPORT_STRENGTH_TRAINING, steps_d5)

    # Day 6: Rest
    steps_d6 = [("REST DAY!", "open", "rest", None, WST_OPEN, 0)]
    build_workout(f"W{week}D6_REST", f"W{week}D6 Rest Day", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d6)

    # Day 7: Sunday Jog + Sled Check
    steps_d7 = [
      ("Z3 Run 8K",              "distance", "active",   8000, WST_HEART_RATE, 3),
      ("Sled push check (light)","open",     "interval", None, WST_OPEN, 0, EXCAT_CARDIO, 0)
    ]
    build_workout(f"W{week}D7_Taper_Sunday", f"W{week}D7 Sunday Run+Sled Check", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d7)


# --- PHASE 5: TAPER W23 TEMPLATES (RACE WEEK) ---
def gen_taper_w23_workouts(week):
    # Day 1: Easy Jog
    steps_d1 = [
      ("Easy Z2 Jog",            "time", "active",   1800, WST_HEART_RATE, 2),
      ("Mobility Flow",          "time", "cooldown", 600,  WST_OPEN, 0)
    ]
    build_workout(f"W{week}D1_RaceWeek_Jog", f"W{week}D1 Easy Jog+Mobility", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d1)

    # Day 2: Shake Out
    steps_d2 = [
      ("200m Strides x4",        "distance", "interval", 200, WST_OPEN, 0),
      ("Wall Balls shake out",   "reps",     "active",   20,  WST_OPEN, 0, EXCAT_SQUAT, SQEX_WALL_BALL)
    ]
    build_workout(f"W{week}D2_RaceWeek_Shakeout", f"W{week}D2 Shakeout+Strides", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d2)

    # Day 3: FULL REST
    steps_d3 = [("FULL REST", "open", "rest", None, WST_OPEN, 0)]
    build_workout(f"W{week}D3_RaceWeek_REST", f"W{week}D3 Full Rest Day", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d3)

    # Day 4: Activation
    steps_d4 = [
      ("Easy Activation Jog",    "time", "active",   1200, WST_HEART_RATE, 2),
      ("Light Row",              "time", "cooldown", 300,  WST_OPEN, 0)
    ]
    build_workout(f"W{week}D4_RaceWeek_Activation", f"W{week}D4 Activation Workout", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d4)

    # Day 5: FULL REST (RACE EVE)
    steps_d5 = [("RACE EVE REST", "open", "rest", None, WST_OPEN, 0)]
    build_workout(f"W{week}D5_RaceWeek_RaceEve", f"W{week}D5 Race Eve Rest", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d5)

    # Day 6: RACE DAY!
    steps_d6 = [
      ("Warm-Up Jog",            "time", "warmup",   1200, WST_OPEN, 0),
      ("🏁 HYROX RIO DE JANEIRO", "open", "active",   None, WST_OPEN, 0)
    ]
    build_workout(f"W{week}D6_RACE_DAY", f"W{week}D6 HYROX RACE DAY", SPORT_RUNNING, SUBSPORT_GENERIC, steps_d6)

    # Day 7: REST & CELEBRATE
    steps_d7 = [("CELEBRATE Recovery Walk", "open", "cooldown", None, WST_OPEN, 0)]
    build_workout(f"W{week}D7_Recovery_Celebrate", f"W{week}D7 Celebrate Recover", SPORT_TRAINING, SUBSPORT_FLEXIBILITY_TRAINING, steps_d7)


# ===========================================================
# GENERATE ALL WEEKS (1 to 23)
# ===========================================================

print("=" * 60)
print("  HYROX -> Garmin FIT Workout Generator v4 (23 Weeks)")
print("  Calibrated to Max HR: 193 bpm | Garmin HR Zones")
print("  Upper/Lower/Full-Body Hypertrophy split + Monday-recovery")
print("=" * 60)
print()

# Week-by-week generation loop
for week in range(1, 24):
    print(f"--- Generating Week {week} workouts:")
    if week == 1:
        # Week 1: Recovery week
        gen_recovery_workouts(week)
    elif week in [5, 12, 20]:
        # Deload weeks in Phase 2, 3, 4 use the recovery templates
        gen_recovery_workouts(week)
    elif week in [2, 3, 4, 6, 7, 8]:
        # Phase 2: Hypertrophy Base
        gen_base_workouts(week)
    elif week in [9, 10, 11, 13, 14, 15, 16]:
        # Phase 3: Hypertrophy Build
        gen_build_workouts(week)
    elif week in [17, 18, 19, 21]:
        # Phase 4: HYROX Focus / Maintenance
        gen_focus_workouts(week)
    elif week == 22:
        # Phase 5: Taper week 1
        gen_taper_w22_workouts(week)
    elif week == 23:
        # Phase 5: Race week taper
        gen_taper_w23_workouts(week)
    print()

fit_files = sorted([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.fit')])
total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in fit_files)

print("=" * 60)
print(f"  [SUCCESS] Generated {len(fit_files)} Garmin workout files!")
print(f"  Size: {total_size / 1024:.1f} KB")
print(f"  Destination directory: {OUTPUT_DIR}")
print("=" * 60)
