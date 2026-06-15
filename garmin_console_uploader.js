/*
=================================================
  HYROX → GARMIN CONNECT WORKOUT UPLOADER v2
  
  HOW TO USE:
  1. Go to https://connect.garmin.com/modern/workouts
  2. Press F12 → Console tab
  3. Type: allow pasting   (then Enter)
  4. Paste ALL this code and press Enter
=================================================
*/

(async function() {
    const BASE = "/gc-api/workout-service";
    
    const S_RUN={sportTypeId:1,sportTypeKey:"running"};
    const S_STR={sportTypeId:5,sportTypeKey:"strength_training"};
    const S_CAR={sportTypeId:10,sportTypeKey:"cardio_training"};
    const T_WU={stepTypeId:1,stepTypeKey:"warmup"};
    const T_CD={stepTypeId:2,stepTypeKey:"cooldown"};
    const T_INT={stepTypeId:3,stepTypeKey:"interval"};
    const T_REST={stepTypeId:4,stepTypeKey:"rest"};
    const E_LAP={conditionTypeId:1,conditionTypeKey:"lap.button"};
    const E_TIME={conditionTypeId:2,conditionTypeKey:"time"};
    const E_DIST={conditionTypeId:3,conditionTypeKey:"distance"};
    const E_REPS={conditionTypeId:10,conditionTypeKey:"reps"};
    const NT={workoutTargetTypeId:1,workoutTargetTypeKey:"no.target"};
    
    function s(o,t,e,v,c,n,d){const r={type:"ExecutableStepDTO",stepOrder:o,stepType:t,endCondition:e,targetType:NT};if(v!=null)r.endConditionValue=v;if(c)r.exerciseCategory={exerciseCategoryKey:c};if(n)r.exerciseName=n;if(d)r.description=d;return r;}
    function wu(o,sec,d,c,n){return s(o,T_WU,sec?E_TIME:E_LAP,sec,c,n,d);}
    function a(o,p={}){if(p.reps)return s(o,T_INT,E_REPS,p.reps,p.cat,p.name,p.desc);if(p.sec)return s(o,T_INT,E_TIME,p.sec,p.cat,p.name,p.desc);if(p.dist)return s(o,T_INT,E_DIST,p.dist,p.cat,p.name,p.desc);return s(o,T_INT,E_LAP,null,p.cat,p.name,p.desc);}
    function r(o,sec,d){return s(o,T_REST,sec?E_TIME:E_LAP,sec,null,null,d);}
    function cd(o,sec,d,c,n){return s(o,T_CD,sec?E_TIME:E_LAP,sec,c,n,d);}
    function w(name,sport,steps){return{workoutName:name,sportType:sport,workoutSegments:[{segmentOrder:1,sportType:sport,workoutSteps:steps}]};}
    
    // ===================== ALL 21 WORKOUTS =====================
    function gMon(wk){return w(`W${wk}D1 Lower Strength`,S_STR,[wu(1,300,"Easy Bike 5min"),wu(2,null,"Lateral Band Walks"),wu(3,null,"Glute Bridges 2x15","hip_raise","Weighted Glute Bridge"),wu(4,null,"BW Squats 2x10","squat","Air Squat"),a(5,{desc:"Goblet Squat 4x12",cat:"squat",name:"Goblet Squat"}),a(6,{desc:"RDL (DB) 4x12",cat:"deadlift",name:"Dumbbell Deadlift"}),a(7,{desc:"Walking Lunges 3x20",cat:"lunge",name:"Walking Lunge"}),a(8,{desc:"Leg Press 3x15",cat:"squat",name:"Leg Press"}),a(9,{desc:"Calf Raises 3x15",cat:"calf_raise",name:"Standing Calf Raise"}),a(10,{desc:"Clamshells 3x15",cat:"hip_stability"}),a(11,{desc:"Copenhagen Side Plank",cat:"plank",name:"Side Plank"}),a(12,{desc:"Dead Bug 3x10",cat:"core",name:"Dead Bug"}),a(13,{desc:"Pallof Press 3x12",cat:"core"}),cd(14,null,"SL Glute Bridge 3x12","hip_raise")]);}
    
    function gTue(wk){return w(`W${wk}D2 Run+Intervals`,S_RUN,[wu(1,600,"Easy Jog Warmup"),wu(2,null,"Dynamic Stretches"),a(3,{sec:1800,desc:"Z2 Steady Run 30min"}),a(4,{dist:100,desc:"100m Stride #1"}),r(5,null,"Walk Back"),a(6,{dist:100,desc:"100m Stride #2"}),r(7,null,"Walk Back"),a(8,{dist:100,desc:"100m Stride #3"}),r(9,null,"Walk Back"),a(10,{dist:100,desc:"100m Stride #4"}),cd(11,300,"Cool Down Jog")]);}
    
    function gWed(wk){return w(`W${wk}D3 Recovery`,S_CAR,[wu(1,1200,"Easy Bike/Walk 20min"),a(2,{sec:900,desc:"Mobility Flow 15min"}),a(3,{sec:600,desc:"Foam Rolling 10min"}),cd(4,600,"IT Band Work 10min")]);}
    
    function gThu(wk){const st=[wu(1,null,"Row 500m Easy"),wu(2,null,"Dynamic Stretches")];let n=3;for(let i=1;i<=4;i++){st.push(a(n++,{dist:500,desc:`R${i}: Row 500m`}));st.push(a(n++,{dist:100,desc:`R${i}: Farmers Carry 100m`,cat:"carry",name:"Farmers Walk"}));st.push(a(n++,{dist:50,desc:`R${i}: Walking Lunges 50m`,cat:"lunge",name:"Walking Lunge"}));st.push(a(n++,{reps:20,desc:`R${i}: Wall Balls x20`,cat:"squat",name:"Wall Ball"}));st.push(a(n++,{dist:400,desc:`R${i}: RUN 400m!`}));}st.push(cd(n,300,"Cool Down"));return w(`W${wk}D4 Hybrid Stations`,S_CAR,st);}
    
    function gFri(wk){return w(`W${wk}D5 Upper+Plyo`,S_STR,[wu(1,null,"Pogo Hops 3x10","plyo"),wu(2,null,"Box Step-Up+Jump 3x6","squat","Box Step Squat"),wu(3,null,"Squat Jumps 3x5","plyo","Squat Jump"),wu(4,null,"Med Ball Slams 3x8","plyo","Medicine Ball Slam"),a(5,{desc:"Bench Press 4x10",cat:"bench_press",name:"Barbell Bench Press"}),a(6,{desc:"DB OH Press 3x12",cat:"shoulder_press",name:"Overhead Dumbbell Press"}),a(7,{desc:"Barbell Row 4x12",cat:"row",name:"Barbell Row"}),a(8,{desc:"Cable Pulldown 3x15",cat:"pull_up"}),a(9,{desc:"Pull-Ups 3x8-10",cat:"pull_up",name:"Pull Up"}),a(10,{desc:"Face Pulls 3x15",cat:"row",name:"Face Pull"}),a(11,{desc:"Hanging Leg Raise 3x10",cat:"leg_raise",name:"Hanging Leg Raise"}),a(12,{desc:"Cable Crunches 3x15",cat:"crunch"}),cd(13,30,"Farmers Hold 3x30s","carry","Farmers Walk")]);}
    
    function gSat(wk){return w(`W${wk}D6 REST DAY`,S_CAR,[wu(1,300,"REST DAY - Light Walk"),a(2,{sec:1800,desc:"Walk/Stretch (optional)"}),cd(3,null,"Done!")]);}
    
    function gSun(wk){return w(`W${wk}D7 Long Run+Stations`,S_RUN,[a(1,{dist:8000,desc:"Zone 2 Run 8-10K"}),a(2,{reps:30,desc:"Wall Balls 30 reps",cat:"squat",name:"Wall Ball"}),r(3,60,"Rest 60s"),a(4,{reps:30,desc:"Wall Balls Set 2",cat:"squat",name:"Wall Ball"}),r(5,60,"Rest 60s"),a(6,{reps:30,desc:"Wall Balls Set 3",cat:"squat",name:"Wall Ball"}),a(7,{dist:30,desc:"Burpee Broad Jump 30m"}),cd(8,300,"Cool Down")]);}
    
    // ===================== UPLOAD =====================
    // Extract CSRF token from cookie or page
    function getCsrf() {
        // Try meta tag first
        const meta = document.querySelector('meta[name="_csrf"]');
        if (meta) return meta.content;
        // Try from Garmin's global config
        if (window.__GARMIN_CONFIG__ && window.__GARMIN_CONFIG__.csrfToken) return window.__GARMIN_CONFIG__.csrfToken;
        // Fetch it from the page
        return null;
    }
    
    // Get CSRF token by making a GET first
    let csrf = getCsrf();
    if (!csrf) {
        console.log("%c[*] Fetching CSRF token...", "color:#ffa62b");
        const r = await fetch("/gc-api/workout-service/workouts?start=0&limit=1", {credentials:"include"});
        // Try to get it from response headers
        csrf = r.headers.get("x-csrf-token") || r.headers.get("connect-csrf-token");
    }
    if (!csrf) {
        // Extract from cookies
        const m = document.cookie.match(/CSRF-TOKEN=([^;]+)/);
        if (m) csrf = m[1];
    }
    if (!csrf) {
        // Last resort: hardcode the one we saw
        csrf = "809a1762-0606-4652-b9d2-fcf625d6f313";
        console.log("%c[!] Using observed CSRF token", "color:#ffa62b");
    }
    console.log(`%c[*] CSRF Token: ${csrf}`, "color:#4ecdc4");
    
    async function upload(data) {
        const resp = await fetch(`${BASE}/workout`, {
            method: "POST",
            headers: {"Content-Type":"application/json","NK":"NT","Connect-Csrf-Token":csrf},
            credentials: "include",
            body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
        return resp.json();
    }
    
    const gens=[["Mon",gMon],["Tue",gTue],["Wed",gWed],["Thu",gThu],["Fri",gFri],["Sat",gSat],["Sun",gSun]];
    let ok=0,fail=0;
    
    console.log("%c🏋️ HYROX UPLOADER v2 (gc-api)", "font-size:20px;color:#ff6b6b");
    
    for(let wk=1;wk<=3;wk++){
        console.log(`%c--- Week ${wk} ---`,"color:#ffa62b;font-size:14px");
        for(const [day,gen] of gens){
            const wo=gen(wk);
            try{
                const res=await upload(wo);
                console.log(`  ✅ ${wo.workoutName} (id: ${res.workoutId})`);
                ok++;
                await new Promise(r=>setTimeout(r,500));
            }catch(e){
                console.log(`  ❌ ${wo.workoutName}: ${e.message}`);
                fail++;
            }
        }
    }
    
    console.log(`%c\n${"=".repeat(50)}\nDONE! ✅ ${ok} uploaded | ❌ ${fail} failed\n\nSync your watch via Garmin Connect app! 🎯\n${"=".repeat(50)}`,"font-size:14px;color:#4ecdc4");
})();
