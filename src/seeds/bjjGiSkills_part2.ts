import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/Sports.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

dotenv.config();

// BJJ Gi - Categories 4-5: Passing, Submissions (Chokes)

const bjjGiData = {
  "Passing": {
    type: "gi" as const,
    skills: [
      {
        name: "Toreando Pass (Sleeve Grips)",
        description: "You control your opponent's sleeves, push their legs to one side, and move around their guard to reach side control. The movement is fast and circular, helping you pass without getting caught in their hooks.",
        coachTip: "Focus on controlling their hips, not just their legs. Stay light on your feet and move in arcs so you can adjust instantly if they frame or recover."
      },
      {
        name: "Knee Cut Pass (Collar and Pant Grip)",
        description: "You drive one knee between your opponent's legs and slice it across their thigh while keeping strong grips on the collar and pant. This creates shoulder pressure and pins their hips to the mat.",
        coachTip: "Pin their upper body before moving your knee. Effective passing comes from pressure and structure, not speed. Make your chest heavy, then cut through with control."
      },
      {
        name: "Double Underhook Stack Pass",
        description: "You scoop both of your opponent's legs under your arms, stack them forward onto their shoulders, and walk around their guard. The goal is to fold them and remove all movement.",
        coachTip: "Keep your elbows tight and posture low as you drive forward. Don't rush the pass — let pressure and gravity do the work."
      },
      {
        name: "Over Under Pass (Lapel Grip)",
        description: "You slide one arm over and one arm under your opponent's legs, trapping their hips while you drive forward to pass. This pass uses patience and heavy contact to control space.",
        coachTip: "Keep your head on the side of the underhook and your hips low. Apply steady forward pressure until they open the space for your slide."
      },
      {
        name: "Leg Weave Pass",
        description: "You thread your arm between your opponent's legs, grip their pants, and tilt their hips to one side before moving to side control. The weave flattens their guard and limits recovery.",
        coachTip: "Control both pant grips and turn your chest toward their hips. When their knees face the ceiling, you're fighting their strength. When they're sideways, the pass is yours."
      },
      {
        name: "Long Step Pass",
        description: "From an open-guard position, you disengage their hooks, step your back leg wide, and rotate your hips to clear their legs and move into side control.",
        coachTip: "Keep your chest facing their legs until your step passes their knee line. Turn your body only after you've cleared the barrier; structure first, rotation second."
      },
      {
        name: "Half Guard Smash Pass",
        description: "You flatten your opponent from half guard, establish a deep underhook, and use shoulder pressure to slide your trapped leg free while driving into side control.",
        coachTip: "The pass begins with pressure, not leg movement. Use your shoulder to turn their face away before you work your leg out. When their hips are turned, your escape becomes effortless."
      },
      {
        name: "Body Lock Pass",
        description: "You clasp your hands tightly around your opponent's hips, tripod forward, and walk side to side to free your legs and pass into control.",
        coachTip: "Keep your elbows locked to your ribs and your head driving forward. Think of climbing their hips slowly rather than diving through gaps. Stability beats speed."
      },
      {
        name: "Headquarters Pass (Universal Guard Opening Position)",
        description: "You step one leg between your opponent's guard and sit into a balanced base while controlling grips. From here, you can switch into knee cuts, long steps, or leg drags.",
        coachTip: "Treat headquarters as a staging area. Maintain upright posture and control the inside space. Passing begins with balance, not aggression."
      },
      {
        name: "Leg Drag Pass",
        description: "You pull one of your opponent's legs across their body, pin it to the mat, and slide around to take side control or expose their back.",
        coachTip: "The hip line is your target. Clamp your thigh over their knee and shift your weight forward before turning the corner. Passing is won through control, not distance."
      }
    ]
  },
  "Submissions (Chokes)": {
    type: "gi" as const,
    skills: [
      {
        name: "Cross Collar Choke",
        description: "From guard or mount, you slide both hands deep into your opponent's collars and cross your wrists so the blades of your forearms press against the sides of the neck. The pressure closes the arteries and forces a rapid submission.",
        coachTip: "Depth creates the choke, not muscle. Sink your grips behind the neck and draw your elbows toward your ribs. Precision and posture replace strength."
      },
      {
        name: "Bow and Arrow Choke",
        description: "From back control, you grip the far collar and extend your leg across the torso while rotating your body to apply pressure. The turning motion tightens the collar and stretches the spine to complete the choke.",
        coachTip: "Keep your grip firm and extend gradually through the hips. Smooth rotation replaces strength and ensures a clean finish."
      },
      {
        name: "Loop Choke",
        description: "You secure a deep collar grip and feed your opponent's head beneath your forearm, turning or rolling to trap the neck in the bend of your arm. The motion compresses both sides of the neck evenly.",
        coachTip: "Drop your shoulder forward before rotating. The choke tightens naturally as structure replaces speed and pressure builds through connection."
      },
      {
        name: "Ezekiel Choke",
        description: "From mount or inside guard, you slide one arm inside the collar and grip the sleeve of your opposite hand. You bring the free forearm across the neck to complete the choke.",
        coachTip: "Hide your choking arm until the sleeve grip is secure. Extend your forearm gradually across the throat and keep your weight steady for full control."
      },
      {
        name: "Baseball Bat Choke",
        description: "You grip both collars like holding a bat, then rotate your body to twist your opponent's neck between your forearms. It can be applied from top or bottom positions with strong collar tension.",
        coachTip: "Set your grips before moving. The choke activates through rotation as the hips drive the turn and the arms follow naturally."
      },
      {
        name: "Paper Cutter Choke",
        description: "From side control, you grip deep into one collar and slide your opposite forearm across the neck using a downward slicing motion. The top arm pins posture while the bottom arm cuts across the artery line.",
        coachTip: "Keep your top arm heavy and move your bottom arm smoothly. When your elbow slides down like a blade, the choke closes effortlessly."
      },
      {
        name: "Lapel Wrap Choke",
        description: "You use the opponent's lapel to trap their neck by looping it around and feeding it under the chin before tightening with your grips. The lapel acts as both rope and lever, locking posture in place.",
        coachTip: "Secure lapel tension before tightening. The choke works best when the lapel breaks posture first and compresses the neck as you drive your hips forward."
      },
      {
        name: "Clock Choke",
        description: "From the turtle position, you grip the far collar and walk your body around your opponent's head in a circular path, tightening the lapel against the neck with each step.",
        coachTip: "Keep your chest heavy on their upper back and move with patience. Each step replaces speed with structure and multiplies pressure through alignment."
      },
      {
        name: "Triangle Choke",
        description: "From guard, you trap one arm inside your legs and the other outside, crossing your legs into a triangle around the neck and shoulder. Squeezing your knees together and pulling the head down completes the choke.",
        coachTip: "Angle your hips so the trapped shoulder faces the centre of your triangle. When the leg line runs straight across the neck, the choke becomes effortless."
      },
      {
        name: "Rear Naked Choke",
        description: "From back control, you wrap one arm around the neck and lock your hands behind the head to compress both sides of the neck. The finish comes from chest pressure and alignment, not from arm strength.",
        coachTip: "Keep your elbows close and your chest connected to their back. Tighten by closing the space with your torso instead of pulling with your arms."
      },
      {
        name: "Guillotine Choke",
        description: "You wrap your arm under your opponent's neck from the front and clasp your hands while lifting the elbow to close the space beneath the chin.",
        coachTip: "Set your grip high before leaning back. Lift their chin and maintain posture control so the choke tightens through structure rather than movement."
      },
      {
        name: "Arm-In Guillotine",
        description: "This variation traps one of your opponent's arms inside the choke, creating additional shoulder pressure and limiting escape options.",
        coachTip: "Turn your hips toward the trapped arm and arch with steady pressure. The shoulder acts as a wedge, sealing the choke through connection."
      },
      {
        name: "Short Choke",
        description: "From back control, you wrap your arm around the neck and grip your own bicep, placing the opposite hand on their shoulder to close the seal.",
        coachTip: "Keep your elbows low and your chin close to their head. The submission relies on tight body contact and calm, consistent pressure."
      },
      {
        name: "Arm Triangle Choke",
        description: "You trap the opponent's head and one arm between your shoulder and the mat, pressing forward until the arteries close. The technique relies on chest pressure and alignment.",
        coachTip: "Walk your hips toward the trapped arm side and lower your head beside theirs. Connection and posture create the seal without strain."
      },
      {
        name: "D'Arce Choke",
        description: "From top position, you thread your arm under your opponent's arm and across the neck, locking your hands before sprawling forward to apply pressure.",
        coachTip: "Focus on elbow positioning and stay patient. Roll slightly toward the trapped arm to finish with smooth, steady compression."
      },
      {
        name: "Anaconda Choke",
        description: "You thread your arm beneath the neck and through the far armpit, locking a gable grip and rolling toward the trapped arm to tighten the choke.",
        coachTip: "Set your grip deep before rolling and let your body rotation create the pressure. Consistent alignment finishes the choke without excess force."
      },
      {
        name: "North-South Choke",
        description: "From north-south position, you wrap your arm around the neck and drop your shoulder to compress the throat against your ribcage.",
        coachTip: "Stay relaxed and centred through your weight. The more your structure settles, the tighter the choke becomes."
      }
    ]
  }
};

const seedBjjGiPart2 = async () => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("MONGO_DB_CONNECTION_STRING is not defined in environment variables.");
    }
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");

    // Find BJJ sport
    const bjjSport = await Sport.findOne({ name: { $regex: /bjj/i } });
    if (!bjjSport) {
      console.error("❌ BJJ sport not found. Please create the BJJ sport first.");
      await mongoose.disconnect();
      return;
    }
    console.log(`✅ Found BJJ sport: ${bjjSport.name} (${bjjSport._id})`);

    let categoriesCreated = 0;
    let skillsCreated = 0;

    for (const [categoryName, categoryData] of Object.entries(bjjGiData)) {
      // Check if category already exists
      let category = await SportCategory.findOne({
        name: categoryName,
        sport: bjjSport._id,
        type: categoryData.type
      });

      if (!category) {
        category = await SportCategory.create({
          name: categoryName,
          sport: bjjSport._id,
          type: categoryData.type
        });
        console.log(`✅ Created category: ${categoryName} (${categoryData.type})`);
        categoriesCreated++;
      } else {
        console.log(`⚠️ Category already exists: ${categoryName} (${categoryData.type})`);
      }

      // Create skills for this category
      for (const skill of categoryData.skills) {
        const existingSkill = await SportCategorySkill.findOne({
          name: skill.name,
          category: category._id
        });

        if (!existingSkill) {
          await SportCategorySkill.create({
            name: skill.name,
            description: skill.description,
            coachTip: skill.coachTip,
            category: category._id
          });
          console.log(`  ✅ Created skill: ${skill.name}`);
          skillsCreated++;
        } else {
          console.log(`  ⚠️ Skill already exists: ${skill.name}`);
        }
      }
    }

    console.log(`\n========== Summary ==========`);
    console.log(`Categories created: ${categoriesCreated}`);
    console.log(`Skills created: ${skillsCreated}`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding BJJ Gi skills (Part 2):", error);
    process.exit(1);
  }
};

seedBjjGiPart2();
