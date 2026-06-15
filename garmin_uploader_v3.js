/*
=================================================
  HYROX → GARMIN CONNECT WORKOUT UPLOADER v3
  CORRECT FORMAT — Exercises + Sets working!
  
  HOW TO USE:
  1. Go to https://connect.garmin.com/modern/workouts
  2. Press F12 → Console tab
  3. Type: allow pasting   (then Enter)
  4. Paste ALL this code and press Enter
  5. Wait for all uploads to complete
  6. Sync your watch!
=================================================
*/
(async function(){
const BASE="/gc-api/workout-service";
// Sport types
const RUN={sportTypeId:1,sportTypeKey:"running"};
const STR={sportTypeId:5,sportTypeKey:"strength_training"};
// No target
const NT={workoutTargetTypeId:1,workoutTargetTypeKey:"no.target"};
// Step types
const _WU={stepTypeId:1,stepTypeKey:"warmup"};
const _CD={stepTypeId:2,stepTypeKey:"cooldown"};
const _IV={stepTypeId:3,stepTypeKey:"interval"};
const _RS={stepTypeId:5,stepTypeKey:"rest"};
const _RP={stepTypeId:6,stepTypeKey:"repeat"};
// End conditions
const LAP={conditionTypeId:1,conditionTypeKey:"lap.button",displayable:true};
const TM={conditionTypeId:2,conditionTypeKey:"time",displayable:true};
const DT={conditionTypeId:3,conditionTypeKey:"distance",displayable:true};
const IT={conditionTypeId:7,conditionTypeKey:"iterations",displayable:false};
const RP={conditionTypeId:10,conditionTypeKey:"reps",displayable:true};

// ===== STEP BUILDERS =====
let _o=0;
function Z(){_o=0}
function E(st,ec,v,c,n){const s={type:"ExecutableStepDTO",stepOrder:++_o,stepType:st,endCondition:ec,targetType:NT};if(v!=null)s.endConditionValue=v;if(c)s.category=c;if(n)s.exerciseName=n;return s}
// Warmup
function wu(sec,c,n){return E(_WU,sec?TM:LAP,sec,c,n)}
// Interval by time/dist/reps/lap
function iT(sec,c,n){return E(_IV,TM,sec,c,n)}
function iD(m,c,n){return E(_IV,DT,m,c,n)}
function iR(reps,c,n){return E(_IV,RP,reps,c,n)}
function iL(c,n){return E(_IV,LAP,null,c,n)}
// Rest
function rs(sec){return E(_RS,sec?TM:LAP,sec)}
// Cooldown
function cd(sec,c,n){return E(_CD,sec?TM:LAP,sec,c,n)}
// RepeatGroup for REPS-based sets (e.g., 4x12 Romanian Deadlift)
function sR(num,reps,c,n){return{type:"RepeatGroupDTO",stepOrder:++_o,stepType:_RP,endCondition:IT,numberOfIterations:num,smartRepeat:false,workoutSteps:[
{type:"ExecutableStepDTO",stepOrder:++_o,childStepId:1,stepType:_IV,endCondition:RP,endConditionValue:reps,category:c,exerciseName:n,targetType:NT},
{type:"ExecutableStepDTO",stepOrder:++_o,childStepId:1,stepType:_RS,endCondition:LAP,targetType:NT}]}}
// RepeatGroup for TIME-based sets (e.g., 3x20s planks)
function sT(num,sec,c,n){return{type:"RepeatGroupDTO",stepOrder:++_o,stepType:_RP,endCondition:IT,numberOfIterations:num,smartRepeat:false,workoutSteps:[
{type:"ExecutableStepDTO",stepOrder:++_o,childStepId:1,stepType:_IV,endCondition:TM,endConditionValue:sec,category:c,exerciseName:n,targetType:NT},
{type:"ExecutableStepDTO",stepOrder:++_o,childStepId:1,stepType:_RS,endCondition:LAP,targetType:NT}]}}
// RepeatGroup for DISTANCE sets (e.g., 4x100m carries)
function sD(num,m,c,n){return{type:"RepeatGroupDTO",stepOrder:++_o,stepType:_RP,endCondition:IT,numberOfIterations:num,smartRepeat:false,workoutSteps:[
{type:"ExecutableStepDTO",stepOrder:++_o,childStepId:1,stepType:_IV,endCondition:DT,endConditionValue:m,category:c,exerciseName:n,targetType:NT},
{type:"ExecutableStepDTO",stepOrder:++_o,childStepId:1,stepType:_RS,endCondition:LAP,targetType:NT}]}}
// Workout object
function W(name,sport,steps){return{workoutName:name,sportType:sport,workoutSegments:[{segmentOrder:1,sportType:sport,workoutSteps:steps}]}}

// ===== PHASE 1 WORKOUTS =====

function p1Mon(wk){Z();return W(`HYROX W${wk}D1 Lower Strength`,STR,[
wu(300,"INDOOR_BIKE","INDOOR_BIKE"),
sR(2,15,"HIP_STABILITY","SIDE_LYING_CLAM"),
sR(2,15,"HIP_RAISE","GLUTE_BRIDGE"),
sR(2,10,"SQUAT","BODYWEIGHT_SQUAT"),
sR(4,12,"SQUAT","GOBLET_SQUAT"),
sR(4,12,"DEADLIFT","ROMANIAN_DEADLIFT"),
sR(3,20,"LUNGE","WALKING_LUNGE"),
sR(3,15,"SQUAT","LEG_PRESS"),
sR(3,15,"CALF_RAISE","STANDING_CALF_RAISE"),
sR(3,15,"HIP_STABILITY","SIDE_LYING_CLAM"),
sT(3,20,"PLANK","SIDE_PLANK"),
sR(3,10,"CORE","DEAD_BUG"),
sR(3,12,"CORE","PALLOF_PRESS"),
sR(3,12,"HIP_RAISE","SINGLE_LEG_HIP_RAISE")])}

function p1Tue(wk){Z();return W(`HYROX W${wk}D2 Run+Intervals`,RUN,[
wu(600),
iT(1800),
sD(4,100),
cd(300)])}

function p1Wed(wk){Z();return W(`HYROX W${wk}D3 Recovery`,STR,[
wu(1200,"INDOOR_BIKE","INDOOR_BIKE"),
iT(900),
iT(600),
cd(600)])}

function p1Thu(wk){Z();const st=[wu(120,"ROW","ROW")];
for(let i=1;i<=4;i++){
st.push(iD(500,"ROW","ROW"));
st.push(iD(100,"CARRY","FARMERS_WALK"));
st.push(iD(50,"LUNGE","WALKING_LUNGE"));
st.push(iR(20,"SQUAT","WALL_BALL"));
st.push(iD(400));}
st.push(cd(300));return W(`HYROX W${wk}D4 Hybrid Stations`,STR,st)}

function p1Fri(wk){Z();return W(`HYROX W${wk}D5 Upper+Plyo`,STR,[
sR(3,10,"PLYO","POGO_HOP"),
sR(3,6,"SQUAT","BOX_JUMP"),
sR(3,5,"PLYO","JUMP_SQUAT"),
sR(3,8,"PLYO","MEDICINE_BALL_SLAM"),
sR(4,10,"BENCH_PRESS","BARBELL_BENCH_PRESS"),
sR(3,12,"SHOULDER_PRESS","DUMBBELL_SHOULDER_PRESS"),
sR(4,12,"ROW","BARBELL_ROW"),
sR(3,15,"PULL_UP","LAT_PULLDOWN"),
sR(3,8,"PULL_UP","PULL_UP"),
sR(3,15,"ROW","FACE_PULL"),
sR(3,10,"LEG_RAISE","HANGING_LEG_RAISE"),
sR(3,15,"CRUNCH","CABLE_CRUNCH"),
sT(3,30,"CARRY","FARMERS_WALK")])}

function p1Sat(wk){Z();return W(`HYROX W${wk}D6 REST`,STR,[
wu(300,"INDOOR_BIKE","INDOOR_BIKE"),
iT(1200),
cd(null)])}

function p1Sun(wk){Z();return W(`HYROX W${wk}D7 Long Run`,RUN,[
wu(300),
iD(wk<=3?8000:(wk>=8?8000:10000)),
sR(3,30,"SQUAT","WALL_BALL"),
iD(30,"PLYO","BURPEE"),
cd(300)])}

// ===== PHASE 2 WORKOUTS =====

function p2Mon(wk){Z();return W(`HYROX W${wk}D1 Lower Power`,STR,[
sR(4,5,"PLYO","BOX_JUMP"),
sR(3,6,"PLYO","JUMP_SQUAT"),
sR(3,6,"PLYO","LATERAL_BOUND"),
sR(3,4,"PLYO","DEPTH_JUMP"),
sR(4,10,"SQUAT","BARBELL_BACK_SQUAT"),
sR(3,12,"DEADLIFT","SINGLE_LEG_DEADLIFT"),
sR(4,20,"LUNGE","WALKING_LUNGE"),
sR(3,15,"LEG_CURL","LEG_EXTENSION"),
sR(3,5,"LEG_CURL","NORDIC_HAMSTRING_CURL"),
sR(3,8,"SQUAT","SINGLE_LEG_SQUAT"),
sR(3,15,"HIP_STABILITY","SIDE_LYING_CLAM"),
sR(2,3,"TOTAL_BODY","TURKISH_GET_UP")])}

function p2Tue(wk){Z();return W(`HYROX W${wk}D2 Run Threshold`,RUN,[
wu(600),
sD(5,800),
iT(300),
sD(4,200),
cd(600)])}

function p2Thu(wk){Z();return W(`HYROX W${wk}D4 Compromised Run`,STR,[
wu(300),
iD(1000),iD(500,"ROW","ROW"),
iD(1000),iD(200,"CARRY","FARMERS_WALK"),
iD(1000),iD(50,"LUNGE","WALKING_LUNGE"),
iD(1000),iR(50,"SQUAT","WALL_BALL"),
iD(1000),
cd(300)])}

function p2Fri(wk){Z();return W(`HYROX W${wk}D5 Upper Endurance`,STR,[
sR(4,10,"PLYO","MEDICINE_BALL_SLAM"),
sR(3,6,"PLYO","BURPEE"),
sR(3,12,"BENCH_PRESS","BARBELL_BENCH_PRESS"),
sR(4,15,"ROW","SEATED_CABLE_ROW"),
sR(3,15,"SHOULDER_PRESS","DUMBBELL_SHOULDER_PRESS"),
sR(3,15,"PULL_UP","LAT_PULLDOWN"),
sR(4,20,"PULL_UP","STRAIGHT_ARM_PULLDOWN"),
sR(3,20,"PULL_UP","PULL_UP"),
sT(3,30,"CARRY","FARMERS_WALK"),
sT(3,30,"PULL_UP","PULL_UP"),
sR(3,10,"CORE","AB_WHEEL"),
sR(3,12,"CORE","PALLOF_PRESS")])}

function p2Sun(wk){Z();return W(`HYROX W${wk}D7 Long Run+Stack`,RUN,[
wu(300),
iD(wk<=5?10000:12000),
sR(4,25,"SQUAT","WALL_BALL"),
iD(wk>=7?80:40,"PLYO","BURPEE"),
iD(200,"CARRY","FARMERS_WALK"),
cd(300)])}

// ===== PHASE 3 WORKOUTS =====

function p3Mon(wk){Z();return W(`HYROX W${wk}D1 Light Lower`,STR,[
wu(300,"INDOOR_BIKE","INDOOR_BIKE"),
sR(3,8,"SQUAT","BARBELL_BACK_SQUAT"),
sR(3,10,"DEADLIFT","SINGLE_LEG_DEADLIFT"),
sR(2,20,"LUNGE","WALKING_LUNGE"),
sR(3,10,"CORE","DEAD_BUG"),
sR(3,12,"CORE","PALLOF_PRESS"),
sT(3,30,"PLANK","PLANK"),
sR(2,15,"HIP_STABILITY","SIDE_LYING_CLAM")])}

function p3Tue(wk){Z();return W(`HYROX W${wk}D2 Race Pace`,RUN,[
wu(600),
sD(6,400),
cd(600)])}

function p3Thu(wk){Z();return W(`HYROX W${wk}D4 Half Race Sim`,STR,[
wu(300),
iD(1000),iD(1000,"ROW","ROW"),
iD(1000),iD(200,"CARRY","FARMERS_WALK"),
iD(1000),iR(100,"SQUAT","WALL_BALL"),
iD(1000),
cd(300)])}

function p3Sun(wk){Z();return W(`HYROX W${wk}D7 Easy Run`,RUN,[
wu(300),
iD(8000),
iR(50,"SQUAT","WALL_BALL"),
cd(300)])}

// ===== TAPER (Week 10) =====

function tapMon(){Z();return W("HYROX W10D1 Easy Jog+Mobility",RUN,[wu(300),iT(1800),iT(600),cd(null)])}
function tapTue(){Z();return W("HYROX W10D2 Strides",RUN,[wu(300),sD(4,200),iR(20,"SQUAT","WALL_BALL"),cd(null)])}
function tapThu(){Z();return W("HYROX W10D4 Light Activation",RUN,[wu(300),iT(1200),iT(300,"ROW","ROW"),cd(null)])}

// ===== WEEK SCHEDULE =====
const SCHEDULE=[
  {wk:1,days:[p1Mon,p1Tue,p1Wed,p1Thu,p1Fri,p1Sat,p1Sun]},
  {wk:2,days:[p1Mon,p1Tue,p1Wed,p1Thu,p1Fri,p1Sat,p1Sun]},
  {wk:3,days:[p1Mon,p1Tue,p1Wed,p1Thu,p1Fri,p1Sat,p1Sun]},
  {wk:4,days:[p2Mon,p2Tue,p1Wed,p2Thu,p2Fri,p1Sat,p2Sun]},
  {wk:5,days:[p2Mon,p2Tue,p1Wed,p2Thu,p2Fri,p1Sat,p2Sun]},
  {wk:6,days:[p1Mon,p1Tue,p1Wed,p1Thu,p1Fri,p1Sat,p1Sun]},
  {wk:7,days:[p2Mon,p2Tue,p1Wed,p2Thu,p2Fri,p1Sat,p2Sun]},
  {wk:8,days:[p3Mon,p3Tue,p1Wed,p3Thu,p2Fri,p1Sat,p3Sun]},
  {wk:9,days:[p3Mon,p3Tue,p1Wed,p3Thu,p1Fri,p1Sat,p3Sun]},
];

// ===== UPLOAD =====
const csrf="809a1762-0606-4652-b9d2-fcf625d6f313";
console.log(`%c[*] CSRF: ${csrf}`,"color:#4ecdc4");

async function upload(data){
  const r=await fetch(BASE+"/workout",{
    method:"POST",credentials:"include",
    headers:{"Content-Type":"application/json","NK":"NT","Connect-Csrf-Token":csrf},
    body:JSON.stringify(data)});
  if(!r.ok)throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0,200)}`);
  return r.json();
}

let ok=0,fail=0;
console.log("%c🏋️ HYROX UPLOADER v3 — CORRECT FORMAT","font-size:20px;color:#ff6b6b");

// Upload weeks 1-9
for(const{wk,days}of SCHEDULE){
  console.log(`%c━━━ Week ${wk} ━━━`,"color:#ffa62b;font-size:14px");
  for(const gen of days){
    const wo=gen(wk);
    try{
      const res=await upload(wo);
      console.log(`  ✅ ${wo.workoutName} (${res.workoutId})`);
      ok++;await new Promise(r=>setTimeout(r,600));
    }catch(e){
      console.log(`  ❌ ${wo.workoutName}: ${e.message}`);
      fail++;
    }
  }
}

// Upload taper week 10
console.log("%c━━━ Week 10 (Taper) ━━━","color:#ffa62b;font-size:14px");
for(const gen of [tapMon,tapTue,()=>{Z();return W("HYROX W10D3 REST",STR,[wu(300),cd(null)])},tapThu,()=>{Z();return W("HYROX W10D5 REST Race Eve",STR,[wu(300),cd(null)])},()=>{Z();return W("HYROX W10D6 RACE DAY 🔥",STR,[wu(600),iT(5400),cd(300)])},w=>p1Sun(10)]){
  const wo=typeof gen==="function"?gen(10):gen;
  try{
    const res=await upload(wo);
    console.log(`  ✅ ${wo.workoutName} (${res.workoutId})`);
    ok++;await new Promise(r=>setTimeout(r,600));
  }catch(e){
    console.log(`  ❌ ${wo.workoutName}: ${e.message}`);
    fail++;
  }
}

console.log(`%c\n${"═".repeat(50)}\nDONE! ✅ ${ok} uploaded | ❌ ${fail} failed\n\nDelete old broken workouts & sync your watch! 🎯\n${"═".repeat(50)}`,"font-size:14px;color:#4ecdc4");
})();
