import mongoose from "mongoose";
import dotenv from "dotenv";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";

dotenv.config();

const exerciseData: Record<string, { description?: string; coachTip: string }> = {
  // === POWER - Barbell Power Pack ===
  "Power Clean Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Lock in your setup, drive hard off the floor and commit to the catch. Move fast and finish strong."
  },
  "Power Snatch Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Stay sharp from the start - explode through the hips and punch under with speed. No hesitation."
  },
  "Push Press Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Brace tight, dip with control and drive hard. Use your whole body to launch the bar overhead."
  },
  "Clean & Jerk Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Nail the clean, reset your breath and attack the jerk. Stay composed - own both phases under pressure."
  },
  "Jump Shrug – Reps in 1 Minute": {
    description: "Format: Max Reps in 1 Minute @ 40kg",
    coachTip: "Stay crisp and reactive. Reset your stance each time and keep max intent behind every jump."
  },
  "High Pull – Reps in 1 Minute": {
    description: "Format: Max Reps in 1 Minute @ 40kg",
    coachTip: "Keep the bar close and time your pull. Snap through your hips and lead with the elbows – stay fast."
  },
  "Hang Clean Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Control the hinge then explode. Focus on speed under the bar and a clean, stable catch."
  },
  "Snatch High Pull Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Stay tight through the pull. Aggressively extend and finish each lift with height and control."
  },
  "Push Press – Reps in 1 Minute": {
    description: "Format: Max Reps in 1 Minute @ 40kg",
    coachTip: "Dip, drive and lock out clean. Build a steady rhythm early and stay composed under fatigue."
  },
  "Power Jerk Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Be explosive - dip with purpose and punch the bar overhead. Recover fast and finish like a pro."
  },

  // === POWER - Kettlebell Power Pack ===
  "Kettlebell Swing Power Test": {
    description: "Format: Max Reps in 1 Minute",
    coachTip: "Drive through your hips, keep your core tight and snap each rep with power. Stay consistent from first to last rep."
  },
  "Kettlebell Clean & Press Challenge": {
    description: "Format: Max Reps in 1 Minute (One Arm)",
    coachTip: "Clean it strong, lock it overhead and repeat with rhythm. Stay tight through the trunk and keep the bell close."
  },
  "Kettlebell Snatch Challenge": {
    description: "Format: Max Reps in 1 Minute",
    coachTip: "Punch through the top and control the drop. Move smoothly with speed and focus on efficient reps."
  },
  "Kettlebell Thruster Challenge": {
    description: "Format: Max Reps in 1 Minute",
    coachTip: "Sink deep in the squat and explode into the press. Keep your elbows high and drive tall with intent."
  },
  "Double Kettlebell Clean Max": {
    description: "Format: Max Weight (1 Rep Max)",
    coachTip: "Brace hard, pull with speed and catch cleanly in the rack. Don't rush, make it count."
  },

  // === POWER - Olympic Lifts ===
  "Snatch": {
    description: "A full-body Olympic lift where the barbell is lifted from the ground to overhead in one continuous motion. Builds speed, coordination and explosive strength.",
    coachTip: "Keep the bar close to the body. Drive through the hips and pull under quickly. Catch with a stable, locked-out overhead position."
  },
  "Power Snatch": {
    description: "A variation of the snatch where the lifter catches the bar in a partial squat. Focuses more on speed and explosive hip extension.",
    coachTip: "Extend aggressively and aim to catch the bar above parallel. Stay tight through the trunk and control the descent."
  },
  "Hang Snatch": {
    description: "An Olympic lift performed from a hanging position above the knees. Emphasises bar path, upper back and second pull mechanics.",
    coachTip: "Set tension from the hang position. Keep your chest up and use the hips to drive the lift explosively."
  },
  "Clean": {
    description: "An Olympic lift where the bar is pulled from the floor to the shoulders in one fluid motion. Trains power, timing and full-body coordination.",
    coachTip: "Pull tall and catch the bar high on your shoulders. Keep your elbows fast and drive from the floor with intent."
  },
  "Power Clean": {
    description: "A clean variation where the bar is caught in a quarter squat. Emphasises speed and hip drive.",
    coachTip: "Keep the bar close and use an aggressive triple extension. Catch with a tall chest and quick elbows."
  },
  "Hang Clean": {
    description: "Performed from the hang position just above or below the knees, focusing on the pull and receiving mechanics.",
    coachTip: "Hinge back and stay tight before initiating the pull. Explode through the hips and receive the bar cleanly."
  },
  "Jerk": {
    description: "A powerful overhead movement used to lift the bar from shoulders to a locked out overhead position via a split stance.",
    coachTip: "Dip vertically and drive aggressively. Split the legs fast and land stable with both feet before recovering."
  },
  "Power Jerk": {
    description: "A variation of the jerk caught with the feet only slightly splitting or not at all. Requires great timing and overhead strength.",
    coachTip: "Focus on a strong vertical dip and drive. Catch with locked elbows and firm legs."
  },
  "Clean and Jerk": {
    description: "A two-part Olympic lift combining the clean and the jerk. Develops explosive power, strength and technical skill.",
    coachTip: "Separate the two phases with control. Reset your breath and tension before the jerk."
  },

  // === POWER - Dumbbell / Kettlebell Power ===
  "Dumbbell Snatch": {
    description: "A unilateral power movement lifting a dumbbell from the ground to overhead in one motion. Useful for athletic power development and balance.",
    coachTip: "Keep the dumbbell close, drive through the hips and punch overhead with speed. Alternate arms or complete all reps on one side."
  },
  "Dumbbell Clean and Press": {
    description: "A full-body strength-power movement using dumbbells to mimic the clean and press with unilateral control.",
    coachTip: "Drive with the legs and rack the dumbbells before pressing. Stay tall and avoid arching during the press."
  },
  "Kettlebell Snatch": {
    description: "A ballistic kettlebell movement taking the bell from swing to overhead in one fluid action. Develops hip speed and grip endurance.",
    coachTip: "Use a tight arc and punch through the top to avoid impact. Drive from the hips - don't muscle it up with the arm."
  },
  "Kettlebell Clean and Press": {
    description: "A power movement combining a kettlebell clean into a strict or push press. Great for unilateral control and rotational resistance.",
    coachTip: "Use a strong hip drive on the clean, then reset before pressing. Keep the bell close to the body and elbow under the wrist."
  },

  // === POWER - Barbell Power Builders ===
  "Barbell Jump Shrug": {
    description: "An explosive Olympic lift derivative focusing on hip extension and triple extension mechanics without a catch. Builds lower-body power and bar path awareness.",
    coachTip: "Extend forcefully through the hips, knees and ankles. Keep your arms relaxed and let the bar float - don't pull early."
  },
  "Push Press": {
    description: "A leg-driven overhead press that bridges strict pressing and full Olympic jerks. Trains upper-body power and coordination.",
    coachTip: "Dip straight down, drive through the legs and press immediately. Time the movement to avoid disconnect between legs and arms."
  },
  "High Pull": {
    description: "A dynamic pulling exercise using either barbell or kettlebell focused on vertical speed and upper body mechanics often used as a precursor to Olympic lifts.",
    coachTip: "Keep the bar close and pull high with elbows leading. Avoid curling - extend fully before initiating the pull."
  },

  // === POWER - Plyometrics & Ballistic Power ===
  "Tuck Jump": {
    description: "A vertical jump where knees are driven toward the chest at the peak of the jump. Enhances reactivity and SSC efficiency.",
    coachTip: "Jump high and tuck fast. Reset each rep to ensure maximum effort and technique."
  },
  "Weighted Jump Squats": {
    description: "A vertical power movement using bodyweight or added load to build explosive strength in the lower body.",
    coachTip: "Dip quickly and drive through the floor. Land softly and reset before the next rep - avoid rushing."
  },
  "Bounding Lunges": {
    description: "Dynamic alternating lunges performed with maximal force and rhythm, training horizontal propulsion and unilateral power.",
    coachTip: "Drive off the back leg and land with control. Keep your chest up and arms active for balance and rhythm."
  },
  "Medicine Ball Slam": {
    description: "A full body ballistic movement involving throwing a med ball forcefully into the ground to develop upper-body explosiveness.",
    coachTip: "Extend tall before the slam. Engage your core and throw the ball with full intent and control."
  },

  // === SPEED - Linear Sprint Tests ===
  "Sprint 20m": {
    description: "Short distance sprint to test initial acceleration and explosive power over the first phase.",
    coachTip: "Drive with powerful knee lift and forward lean. Stay relaxed through arms and shoulders."
  },
  "Sprint 40m": {
    description: "Combines initial acceleration and transition into top speed. Useful for speed profiling.",
    coachTip: "Build into your stride. Don't rush – let your posture rise naturally into top end form."
  },
  "Sprint 60m": {
    description: "Longer sprint testing full acceleration and max velocity. Used in speed-dominant sports.",
    coachTip: "Keep your mechanics tight. Think rhythm and posture at full speed, not just effort."
  },
  "Sled Sprint": {
    description: "Push or pull a sled while sprinting to target horizontal force production and explosive power.",
    coachTip: "Drive through the floor with low, strong steps. Keep hips forward and posture aligned."
  },
  "Curve Sprint": {
    description: "Sprint around a curved line or arc to develop curved running mechanics and lateral lean control.",
    coachTip: "Lean into the curve. Lead with your outside leg and keep your rhythm smooth and consistent."
  },

  // === SPEED - Change of Direction & Agility Drills ===
  "5-10-5 Shuttle": {
    description: "Start at a centre cone. Sprint 5m to one side, touch the line, sprint 10m to the far side, touch, then return 5m to centre. Measures acceleration, deceleration, and lateral quickness.",
    coachTip: "Stay low on turns. Push forcefully off the plant leg and keep steps tight and efficient."
  },
  "T Test Agility Drill": {
    description: "Set up 4 cones in a T shape (10m forward, 5m left/right). Sprint, shuffle side to side, then backpedal. Trains all directional movement and control.",
    coachTip: "Use crisp footwork. Don't cross feet during lateral phases. Keep chest up and stay balanced."
  },
  "L Drill": {
    description: "Sprint and weave tightly through 3 cones placed 5m apart in an L shape. Trains hip rotation, turns, and reacceleration.",
    coachTip: "Drive your turns with control. Stay compact and take sharp angles around each cone."
  },
  "Illinois Agility Test": {
    description: "Sprint through a 10m long agility course weaving around 4 cones (3.3m apart). Measures total body agility.",
    coachTip: "Move with control through the weave. Keep low and explode out of the final cone."
  },
  "Arrowhead Drill": {
    description: "Sprint forward 5m, cut to either cone at 45° then backpedal to start. Repeat to both sides. Builds reactive cuts and directional speed.",
    coachTip: "Snap hips and feet quickly. Stay balanced in the transition between sprint and backpedal."
  },
  "Box Drill": {
    description: "Move around a square (5–10m sides): sprint, shuffle, backpedal, shuffle. Targets clean transitions between all movement types.",
    coachTip: "Keep your chest up and adjust smoothly between forward, lateral, and backward motion."
  },

  // === ENDURANCE - Running / Jogging ===
  "1km Run": {
    description: "A short distance aerobic test that blends speed and stamina often used for pace development.",
    coachTip: "Don't sprint too early. Start at a strong but controlled effort and aim for a consistent pace."
  },
  "2km Run": {
    description: "A light endurance run useful for conditioning, warm up or tempo pacing practice.",
    coachTip: "Use as a tempo run - aim for consistent effort and avoid unnecessary surges in speed."
  },
  "3km Run": {
    description: "A versatile test of both aerobic capacity and mental resilience, bridging short and mid distance efforts.",
    coachTip: "Break into 1km segments. Build pace across the run and finish strong."
  },
  "5km Run": {
    description: "A mid distance run used to test aerobic fitness, pacing ability and mental endurance.",
    coachTip: "Maintain a steady pace, focus on breathing rhythm and conserve energy for the final kilometre."
  },
  "10km Run": {
    description: "A long run that challenges endurance, aerobic capacity and race strategy.",
    coachTip: "Break the run into 2–3 segments mentally. Focus on consistent splits and strong posture."
  },
  "Half Marathon": {
    description: "A classic 21.1km endurance event requiring sustained aerobic output, structured pacing and mental toughness over an extended period.",
    coachTip: "Train progressively. Use a race pace strategy and hydrate before and after. Long runs and recovery are key."
  },
  "Marathon": {
    description: "The ultimate test of endurance across 42.2km, demanding aerobic capacity, muscular stamina, fuelling discipline and mental grit from start to finish.",
    coachTip: "Fuel appropriately and pace conservatively. Expect mental and physical fatigue - stay steady and don't chase early speed."
  },
  "VO₂ Max Run": {
    description: "A maximal effort run used to estimate aerobic capacity based on distance covered. Common formats include a 1.5-mile (2.4km) time trial or a 6-minute max distance run.",
    coachTip: "Warm up thoroughly and run with controlled aggression. Give maximum effort and maintain form. Use consistent conditions for repeat tests."
  },
  "Long Distance Run": {
    description: "A custom distance run for athletes progressing beyond standard benchmarks or preparing for an event.",
    coachTip: "Use GPS tracking and structure hydration and fuelling for runs over 15km. Keep notes post session."
  },
  "Hill Run": {
    description: "A terrain-based endurance run focused on building lower body strength, power output and aerobic capacity.",
    coachTip: "Drive with the knees, shorten your stride and keep a tall posture on uphill sections."
  },
  "Trail Run": {
    description: "An outdoor endurance run over varied terrain, targeting coordination, strength and stamina.",
    coachTip: "Stay light on your feet. Use your arms for balance and adjust pace based on the terrain."
  },

  // === ENDURANCE - Cycling ===
  "5km Ride": {
    description: "A short cycling effort useful for warm up, intervals or recovery sessions.",
    coachTip: "Maintain a consistent pedal rhythm and shift gears smoothly to stay efficient."
  },
  "10km Ride": {
    description: "A moderate endurance effort that builds aerobic capacity and leg stamina.",
    coachTip: "Aim for consistent effort across terrain. Maintain relaxed shoulders and steady breathing."
  },
  "20km Ride": {
    description: "A longer ride ideal for developing aerobic base and cardiovascular conditioning.",
    coachTip: "Ride with rhythm. Don't go out too fast - settle into a sustainable pace early."
  },
  "40km Ride": {
    description: "A traditional endurance benchmark used in cycling and triathlon training.",
    coachTip: "Use this distance to test pacing strategy. Fuel before the ride and hydrate during if needed."
  },
  "50km Ride": {
    description: "A longer aerobic ride that builds muscular endurance and pacing discipline.",
    coachTip: "Break the distance into 10km segments mentally. Monitor cadence and terrain shifts."
  },
  "100km Ride": {
    description: "A true test of endurance, nutrition strategy and mental resilience over a prolonged distance.",
    coachTip: "Plan for hydration, fuelling and pacing. Use a flat route for pacing consistency or include climbs for challenge."
  },
  "Long Distance Ride": {
    description: "A custom long ride used for personal goals, events or progressive overload training.",
    coachTip: "Note terrain, elevation and fuelling plan. Track metrics to guide weekly endurance planning."
  },

  // === ENDURANCE - Rowing ===
  "500m Row": {
    description: "A high intensity, short row test of anaerobic power and stroke control.",
    coachTip: "Lead with your legs, brace your core and keep the handle path consistent."
  },
  "1000m Row": {
    description: "A sub-4-minute test for power endurance and stroke rhythm.",
    coachTip: "Maintain even 250m splits. Don't yank the handle - stay efficient and composed."
  },
  "2000m Row": {
    description: "The gold standard rowing test for pacing, endurance and mental control.",
    coachTip: "Break it into 500m checkpoints. Keep shoulders relaxed and maintain breathing rhythm."
  },
  "5km Row": {
    description: "A longer aerobic effort that tests cardiovascular endurance and rowing efficiency.",
    coachTip: "Use a sustainable split pace. Focus on consistent drive and recovery timing."
  },
  "10km Row": {
    description: "An extended endurance challenge ideal for building aerobic base and muscular stamina.",
    coachTip: "Set a moderate pace, don't grip too tight and reset mentally at each 2.5km mark."
  },
  "Half Marathon Row": {
    description: "A demanding long-distance row covering 21.1km requiring aerobic capacity, pacing strategy and mental resilience.",
    coachTip: "Fuel beforehand, hydrate during long sessions and log splits every 2-3km for pacing feedback."
  },
  "Max Metres in 20 Minutes": {
    description: "A time-based test of aerobic power and consistency under fatigue.",
    coachTip: "Aim for a pace just below your 2km effort. Avoid sprinting early - surge in the final 5 minutes."
  },
  "Long Row": {
    description: "A custom rowing effort beyond standard distances, used for event prep or endurance benchmarks.",
    coachTip: "Log surface or erg setting. Hydrate and mentally break into blocks for focus."
  },

  // === ENDURANCE - Swimming ===
  "100m Swim": {
    description: "A short distance aerobic sprint focused on pacing and stroke efficiency.",
    coachTip: "Stay long and relaxed. Use a strong push off and streamline from the wall."
  },
  "200m Swim": {
    description: "A mid-range swim used to train aerobic base and breathing control.",
    coachTip: "Keep a steady stroke rate. Breathe consistently and keep kicks light and fast."
  },
  "500m Swim": {
    description: "A longer continuous effort testing endurance and stroke technique.",
    coachTip: "Focus on rhythm and body alignment. Pace the effort and stay relaxed under fatigue."
  },
  "1000m Swim": {
    description: "A stamina-focused swim requiring sustained aerobic output and efficient breathing.",
    coachTip: "Breathe early and often. Split your pace and check your technique at halfway."
  },
  "1500m Swim": {
    description: "A benchmark endurance swim used in Olympic triathlons and elite aerobic development.",
    coachTip: "Swim long and smooth. Keep kick tempo steady and rotate through the hips."
  },
  "1600m Swim": {
    description: "A 1-mile swim distance often used in training and endurance benchmarks.",
    coachTip: "Count your strokes per length. Conserve energy and monitor breath control."
  },
  "1900m Swim": {
    description: "A long-distance swim typically used in Half Ironman events requiring strong aerobic endurance and pacing.",
    coachTip: "Train in open water if preparing for competition. Keep your head low and stroke relaxed."
  },
  "3800m Swim": {
    description: "The full-distance swim of an Ironman triathlon. Requires excellent technique, mental focus and fuelling strategy.",
    coachTip: "Practice long swim sessions in training. Use bilateral breathing and sight efficiently."
  },
  "Long Swim": {
    description: "A custom swim distance beyond standard benchmarks, used for event preparation or high volume aerobic work.",
    coachTip: "Log conditions (pool vs open water). Prioritise smooth strokes and mental pacing."
  },

  // === ENDURANCE - Assault Bike ===
  "2km Assault Bike": {
    description: "A short distance conditioning test to challenge anaerobic capacity and leg power.",
    coachTip: "Start with a burst then settle into a high but sustainable pace. Use arms and legs together."
  },
  "5km Assault Bike": {
    description: "A moderate effort aerobic ride for building conditioning and pacing strategy.",
    coachTip: "Don't sprint early. Find a cadence that feels tough but manageable."
  },
  "10km Assault Bike": {
    description: "A longer endurance effort focused on aerobic base, mental toughness and breathing control.",
    coachTip: "Keep shoulders down and grip light. Work in waves of effort and recovery."
  },
  "20 Calories for Time": {
    description: "A power endurance sprint aiming for maximum output over a short effort.",
    coachTip: "Go all out but control your breathing. Use arms and legs in sync."
  },
  "Max Calories in 10 Minutes": {
    description: "A sustained effort to test pacing and aerobic output across 10 minutes.",
    coachTip: "Start slightly under target pace then increase every 2-3 minutes."
  },
  "Max Distance in 20 Minutes": {
    description: "A longer time-based test measuring endurance, pacing and consistency under fatigue.",
    coachTip: "Treat it like a long race. Settle into pace then increase effort every 5 minutes."
  },

  // === ENDURANCE - SkiErg ===
  "250m Ski": {
    description: "A fast, high-power effort focusing on coordination, upper body drive and anaerobic output.",
    coachTip: "Snap down aggressively with your lats. Use short, powerful strokes."
  },
  "500m Ski": {
    description: "A short but challenging distance requiring full body rhythm and aerobic capacity.",
    coachTip: "Keep hips back and core engaged. Breathe efficiently and stroke smoothly."
  },
  "1000m Ski": {
    description: "A benchmark ski distance for pacing and technique under fatigue.",
    coachTip: "Don't rush the strokes. Control the pull and maintain tempo."
  },
  "2000m Ski": {
    description: "A medium distance effort to test endurance and technical efficiency.",
    coachTip: "Break into 500m checkpoints. Stay tall and breathe rhythmically."
  },
  "5km Ski": {
    description: "A longer aerobic effort to develop sustained output, grip strength and upper body endurance.",
    coachTip: "Use a strong but relaxed stroke. Reset grip tension every 1km."
  },
  "Max Metres in 10 Minutes": {
    description: "A time-based test of aerobic output, technique and mental pacing.",
    coachTip: "Target a steady cadence. Save a push for the last 90 seconds."
  },
  "Long Ski": {
    description: "A custom endurance effort for athletes progressing toward high volume goals or event simulations.",
    coachTip: "Log damper setting and stroke rate. Focus on posture and pull path early."
  },

  // === STRENGTH - Legs ===
  "Back Squat": {
    description: "A compound barbell lift where the bar rests on the upper back. It develops strength in the glutes, quads and hamstrings with a strong posterior chain emphasis.",
    coachTip: "Keep the bar tight to your traps, brace your core and drive up through your heels. Hit full depth with control."
  },
  "Goblet Squat": {
    description: "A beginner friendly squat holding a kettlebell or dumbbell at chest level. Great for reinforcing squat mechanics and mobility.",
    coachTip: "Keep the weight close to your chest, elbows inside the knees at the bottom and maintain an upright torso."
  },
  "Lunge Variations": {
    description: "Lunges are unilateral exercises that improve strength, balance and functional coordination. Includes: Walking Lunge, Reverse Lunge, Lateral Lunge, Forward Lunge, Static Lunge / Split Squat, Loaded Lunge.",
    coachTip: "Take a long enough step to maintain 90° angles at the knees except in lateral lunges. Keep your torso upright, hips level and feet flat."
  },
  "Step Up": {
    description: "A unilateral leg movement performed by stepping onto a raised platform. Builds quad, glute and hip strength with balance control.",
    coachTip: "Drive through the heel of the working leg and avoid bouncing off the rear leg. Keep your core tight and control the descent."
  },
  "Leg Press": {
    description: "A machine-based compound lift targeting the quads, glutes and hamstrings in a supported, fixed path of motion.",
    coachTip: "Keep your feet flat, push through your heels and avoid locking your knees. Adjust foot position for quad or glute emphasis."
  },
  "Leg Curl": {
    description: "An isolation machine exercise for the hamstrings, performed by curling the legs toward the glutes under resistance.",
    coachTip: "Control the curl and return - don't swing. Keep hips and back flat against the pad."
  },
  "Leg Extension": {
    description: "An isolation machine movement targeting the quadriceps via leg extension from a seated position.",
    coachTip: "Use a controlled tempo, avoid locking out the knees forcefully and squeeze the quads at the top of each rep."
  },

  // === STRENGTH - Posterior Chain ===
  "Deadlift": {
    description: "A foundational barbell lift that targets the glutes, hamstrings, lower back and grip. Performed by lifting the barbell from the floor with a hip hinge movement.",
    coachTip: "Set your back flat, hinge at the hips and drive through your heels. Keep the bar close and avoid jerking it off the floor."
  },
  "Romanian Deadlift": {
    description: "A stiff-legged barbell or dumbbell hinge focused on hamstring and glute isolation through a controlled range of motion.",
    coachTip: "Keep a soft bend in your knees, push your hips back and maintain a flat back. Only lower as far as hamstring tension allows."
  },
  "Trap Bar Deadlift": {
    description: "A hex bar deadlift variation with a more upright torso position, reducing lower back stress and improving ease of setup.",
    coachTip: "Stand tall inside the bar, grip the neutral handles and drive through the floor. Keep your knees tracking in line with your toes."
  },
  "Nordic Curl": {
    description: "A bodyweight hamstring exercise performed by slowly lowering the torso forward from a kneeling position while resisting the fall.",
    coachTip: "Control the descent for as long as possible. Keep your hips forward and avoid bending at the waist - use a partner or anchor for support."
  },
  "Back Extension": {
    description: "A safe and effective movement that targets the spinal erectors, glutes and hamstrings using a back extension bench or dedicated machine.",
    coachTip: "Keep your spine neutral, control the movement and avoid hyperextending at the top. Focus on squeezing the glutes at the top."
  },
  "Glute Kickback": {
    description: "An isolation movement that targets the glutes by extending one leg backward against resistance, either using a cable or dedicated kickback machine.",
    coachTip: "Keep your core tight and avoid swinging your torso. Focus on driving the heel back and squeezing the glute at full extension."
  },

  // === STRENGTH - Upper Body Pull ===
  "Barbell Row": {
    description: "A compound back exercise where the barbell is pulled toward the torso from a hinged position, targeting the lats, rhomboids and rear delts.",
    coachTip: "Keep your back flat, pull the bar to your lower ribs and squeeze your shoulder blades together at the top."
  },
  "Kettlebell Row": {
    description: "A unilateral pulling exercise using kettlebells, often performed in a split stance or bent-over position.",
    coachTip: "Pull with control, keeping your elbow close to your body. Avoid twisting your torso."
  },
  "Pull Up / Chin Up": {
    description: "A bodyweight vertical pulling exercise targeting the lats, biceps and upper back. Grip style determines emphasis.",
    coachTip: "Start from a full hang, pull your chin over the bar and lower under control. Use a full range of motion every rep."
  },
  "Inverted Row": {
    description: "A horizontal bodyweight pull using a bar or rings. Great for beginners or as a volume builder.",
    coachTip: "Keep your body in a straight line and pull your chest to the bar. Control the descent and avoid sagging at the hips."
  },
  "Lat Pulldown": {
    description: "A cable machine exercise mimicking the pull-up movement, ideal for building lat and upper back strength with adjustable resistance.",
    coachTip: "Sit upright, pull the bar to your collarbone and avoid using momentum. Focus on controlled reps and squeezing at the bottom."
  },
  "Seated Row": {
    description: "A controlled horizontal pulling exercise performed with a neutral spine, targeting the lats, mid-back and biceps.",
    coachTip: "Sit tall, pull the handles to your lower ribs and pause briefly. Don't let your shoulders round or lean back excessively."
  },
  "Assisted Pull Up": {
    description: "A regression of the bodyweight pull-up using either an assisted pull-up machine or resistance bands to help users train full range.",
    coachTip: "Engage your lats and avoid jumping or using momentum. Gradually reduce assistance over time to build strength."
  },

  // === STRENGTH - Upper Body Push ===
  "Bench Press": {
    description: "A compound barbell lift that targets the chest, shoulders and triceps. Performed lying flat on a bench while pressing the barbell upward.",
    coachTip: "Keep your feet planted, shoulder blades retracted and lower the bar with control. Drive through your heels and press straight up."
  },
  "Incline Bench Press": {
    description: "A barbell or dumbbell press performed on an inclined bench, emphasising the upper chest and shoulders.",
    coachTip: "Keep your wrists stacked and elbows under the bar. Don't flare your elbows too wide - aim for a controlled, diagonal press path."
  },
  "Dumbbell Bench Press": {
    description: "A dumbbell variation of the bench press that improves stability, range of motion and unilateral strength.",
    coachTip: "Lower the dumbbells with control until elbows are just below parallel. Keep your forearms vertical and press evenly through both arms."
  },
  "Overhead Press": {
    description: "A standing barbell press overhead, building shoulder strength and upper body pressing power.",
    coachTip: "Brace your core, press the bar straight up and lock out overhead with your biceps by your ears. Avoid leaning back."
  },
  "Kettlebell Overhead Press": {
    description: "A single arm press performed with a kettlebell, challenging shoulder stability and core engagement.",
    coachTip: "Keep your wrist neutral and press the kettlebell in a straight line. Engage your glutes and abs for a strong base."
  },
  "Dips": {
    description: "A bodyweight pressing movement that targets the chest, shoulders and triceps. Performed on parallel bars.",
    coachTip: "Lean slightly forward to engage the chest more. Lower until your elbows are at 90°, then press back up with control."
  },
  "Push Up Variations": {
    description: "Bodyweight pressing movements that develop upper body and core strength. Includes: Standard Push-Up, Incline Push-Up, Decline Push-Up, Diamond Push-Up, Tempo Push-Up, Weighted Push-Up.",
    coachTip: "Keep your body in a straight line from head to heels. Lower under control, elbows at 45° and push back up without flaring."
  },

  // === STRENGTH - Core & Midline Stability ===
  "Plank Variations": {
    description: "A static isometric hold that develops deep core endurance, postural control and full-body tension. Includes: Forearm Plank, High Plank, Plank with Shoulder Tap, Side Plank, Plank with Reach, Weighted Plank, Plank to Push-Up.",
    coachTip: "Keep a straight line from head to heels. Brace your core, avoid sagging or piking and squeeze your glutes."
  },
  "Sit Ups": {
    description: "A classic core exercise involving full trunk flexion from lying to seated position, targeting the abdominals.",
    coachTip: "Control both the rise and descent. Avoid pulling on your neck and keep feet grounded."
  },
  "Russian Twists": {
    description: "A rotational ab exercise performed seated, often with a weight, to develop obliques and rotational strength.",
    coachTip: "Twist through the torso, not just the arms. Keep your chest lifted and feet elevated for added challenge."
  },
  "V Ups": {
    description: "A dynamic core movement where hands and feet meet at the top of a simultaneous leg and torso lift.",
    coachTip: "Engage the entire core. Keep legs straight and lift with precision - don't swing for momentum."
  },
  "Hanging Leg Raise": {
    description: "A bodyweight core exercise performed while hanging from a bar, targeting the lower abdominals and hip flexors.",
    coachTip: "Keep your legs straight and avoid swinging. Lift with control and engage your core throughout the movement."
  },
  "Ab Rollout": {
    description: "A dynamic anti-extension core exercise using a wheel or barbell, targeting the entire midsection.",
    coachTip: "Maintain a tight hollow position. Avoid arching your back - only roll out as far as you can stay controlled."
  },
  "Dead Bug": {
    description: "A supine core stability exercise involving alternating limb movement while keeping the spine neutral.",
    coachTip: "Press your lower back into the floor and move slowly. Control each rep with precision."
  },
  "Turkish Get Up": {
    description: "A full-body movement that develops shoulder stability, core strength and body awareness through a series of controlled transitions.",
    coachTip: "Focus on each phase of the movement. Keep your eyes on the weight and move with purpose."
  },

  // === STRENGTH - Rotational & Anti-Rotation Strength ===
  "Pallof Press": {
    description: "A standing anti-rotation exercise using a resistance band or cable that strengthens the core and improves trunk stability.",
    coachTip: "Keep your hips and shoulders square. Don't let the band pull you - resist with controlled tension throughout the press."
  },
  "Band Resisted Rotation": {
    description: "A controlled rotational exercise using a resistance band anchored at chest height. The athlete holds the band with both hands, steps away to create tension and performs deliberate trunk rotations.",
    coachTip: "Use a slow and controlled movement. Avoid leaning or compensating - rotate through the trunk."
  },
  "Tall-Kneeling Cable Rotation": {
    description: "A rotational core exercise performed in a tall-kneeling position using a cable machine or resistance band. Ideal for improving controlled trunk rotation and postural alignment.",
    coachTip: "Stay tall with your hips stacked over your knees. Rotate through your torso only - avoid swaying or leaning."
  },
  "Cable Woodchopper": {
    description: "A controlled rotational movement using a cable machine to train the obliques and build rotational power.",
    coachTip: "Rotate through the torso, not the arms. Keep the movement smooth and controlled from high to low or low to high."
  },

  // === STRENGTH - Grip Strength & Forearm Endurance ===
  "10m Farmers Carry": {
    description: "A loaded carry using heavy dumbbells or kettlebells to build full-body tension, grip strength and forearm endurance.",
    coachTip: "Walk tall with braced core and strong posture. Avoid swinging the weights - control the tempo and grip tightly throughout."
  },
  "10m Suitcase Carry": {
    description: "A unilateral loaded carry that challenges grip, core stability and anti-lateral flexion strength.",
    coachTip: "Keep your torso upright and avoid leaning toward the weight. Brace your core and grip the handle firmly."
  },
  "Wrist Curl": {
    description: "An isolated forearm strength movement performed with controlled wrist flexion to build grip and wrist durability.",
    coachTip: "Use a light-to-moderate weight. Keep forearms supported and focus on full range of motion with control."
  },
  "Reverse Wrist Curl": {
    description: "Targets the extensors of the forearm by curling the wrist upwards while holding a barbell or dumbbell.",
    coachTip: "Control each rep. Don't let the weight bounce - maintain steady tension and avoid excessive load."
  },

  // === STRENGTH - Mobility, Recovery & Stability Work ===
  "Ankle Mobility Drill": {
    description: "A focused ankle dorsiflexion mobility drill that improves joint range for squatting, running and change of direction sports.",
    coachTip: "Keep the heel fully grounded and guide your knee directly over the middle toe. Use slow, controlled reps."
  },
  "Hamstring Stretch": {
    description: "A posterior chain flexibility exercise that targets the hamstrings and calves. Done lying on your back with a resistance band or standing with one leg elevated.",
    coachTip: "Avoid rounding your spine - lead the stretch with a long torso and pull gently from the hips."
  },
  "Couch Stretch": {
    description: "A deep quad and hip flexor stretch where one leg is elevated behind against a wall or bench. It opens up tight anterior hip structures.",
    coachTip: "Keep your glutes squeezed and rib cage stacked over your hips. Avoid flaring the lower back."
  },
  "90/90 Hip Switch": {
    description: "A dynamic internal/external hip rotation drill that improves joint function, range and control.",
    coachTip: "Sit tall and avoid leaning back excessively. Focus on clean transitions and actively engage the hips."
  },
  "Thread the Needle": {
    description: "A ground-based thoracic spine mobility drill that enhances upper back rotation and shoulder blade movement.",
    coachTip: "Keep hips square and exhale as you rotate. Try to slide the arm long across the floor."
  },
  "Cat Cow Stretch": {
    description: "A spinal control and breathwork exercise from yoga that moves between flexion and extension. Enhances spinal awareness.",
    coachTip: "Breathe deeply with each movement. Focus on initiating the motion from the tailbone."
  },
  "Wall Shoulder Slides": {
    description: "An upper body mobility drill that targets scapular control and shoulder flexion by sliding the arms up a wall.",
    coachTip: "Engage your core and keep your spine neutral. Press the hands and elbows into the wall as you slide up."
  },
  "Banded Dislocations": {
    description: "A controlled shoulder mobility drill using a light resistance band to open the shoulders through a full overhead arc.",
    coachTip: "Hold the band wide enough to maintain straight arms throughout. Move slowly and avoid any jerky motion."
  }
};

const seedExerciseDescriptions = async () => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("MONGO_DB_CONNECTION_STRING is not defined in environment variables.");
    }
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");

    let updated = 0;
    let notFound = 0;

    for (const [name, data] of Object.entries(exerciseData)) {
      const result = await ChallengeCategoryExercise.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { 
          $set: { 
            description: data.description || "",
            coachTip: data.coachTip 
          } 
        },
        { new: true }
      );

      if (result) {
        console.log(`✅ Updated: ${name}`);
        updated++;
      } else {
        console.log(`❌ Not found: ${name}`);
        notFound++;
      }
    }

    console.log(`\n========== Summary ==========`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
    console.log(`Total: ${Object.keys(exerciseData).length}`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding exercise descriptions:", error);
    process.exit(1);
  }
};

seedExerciseDescriptions();
