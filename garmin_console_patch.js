/*
=================================================
  HYROX UPLOADER - PATCH (9 failed cardio workouts)
  Changed cardio_training → strength_training
  
  1. Go to https://connect.garmin.com/modern/workouts
  2. F12 → Console → type: allow pasting → Enter
  3. Paste this and press Enter
=================================================
*/

(async function() {
    const BASE = "/gc-api/workout-service";
    
    const S_STR={sportTypeId:5,sportTypeKey:"strength_training"};
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
    
    // Only the 3 that failed (Wed, Thu, Sat) — now as strength_training
    function gWed(wk){return w(`W${wk}D3 Recovery`,S_STR,[wu(1,1200,"Easy Bike/Walk 20min"),a(2,{sec:900,desc:"Mobility Flow 15min"}),a(3,{sec:600,desc:"Foam Rolling 10min"}),cd(4,600,"IT Band Work 10min")]);}
    
    function gThu(wk){const st=[wu(1,null,"Row 500m Easy"),wu(2,null,"Dynamic Stretches")];let n=3;for(let i=1;i<=4;i++){st.push(a(n++,{dist:500,desc:`R${i}: Row 500m`}));st.push(a(n++,{dist:100,desc:`R${i}: Farmers Carry 100m`,cat:"carry",name:"Farmers Walk"}));st.push(a(n++,{dist:50,desc:`R${i}: Walking Lunges 50m`,cat:"lunge",name:"Walking Lunge"}));st.push(a(n++,{reps:20,desc:`R${i}: Wall Balls x20`,cat:"squat",name:"Wall Ball"}));st.push(a(n++,{dist:400,desc:`R${i}: RUN 400m!`}));}st.push(cd(n,300,"Cool Down"));return w(`W${wk}D4 Hybrid Stations`,S_STR,st);}
    
    function gSat(wk){return w(`W${wk}D6 REST DAY`,S_STR,[wu(1,300,"REST DAY - Light Walk"),a(2,{sec:1800,desc:"Walk/Stretch (optional)"}),cd(3,null,"Done!")]);}
    
    // CSRF
    let csrf = "809a1762-0606-4652-b9d2-fcf625d6f313";
    const m = document.cookie.match(/CSRF-TOKEN=([^;]+)/);
    if (m) csrf = m[1];
    
    async function upload(data) {
        const resp = await fetch(`${BASE}/workout`, {
            method: "POST",
            headers: {"Content-Type":"application/json","NK":"NT","Connect-Csrf-Token":csrf},
            credentials: "include",
            body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).substring(0,200)}`);
        return resp.json();
    }
    
    const gens=[["Wed",gWed],["Thu",gThu],["Sat",gSat]];
    let ok=0,fail=0;
    
    console.log("%c🔧 HYROX PATCH - Uploading 9 remaining workouts", "font-size:16px;color:#ffa62b");
    
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
    
    console.log(`%c\n${"=".repeat(50)}\nPATCH DONE! ✅ ${ok} uploaded | ❌ ${fail} failed\n${"=".repeat(50)}`,"font-size:14px;color:#4ecdc4");
})();
