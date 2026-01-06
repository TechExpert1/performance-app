import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/Sports.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

dotenv.config();

// BJJ Gi - Categories 1-3: Takedowns, Guards & Positions, Sweeps

const bjjGiData = {
  "Takedowns": {
    type: "gi" as const,
    skills: [
      {
        name: "Osoto Gari (Major Outer Reap / Outer Leg Trip)",
        description: "A standing throw where you pull your opponent forward with collar and sleeve grips, then sweep their leg from underneath to drive them backward onto the mat.",
        coachTip: "The leg doesn't create the throw; balance does. Move their weight fully onto the leg you plan to reap, then sweep. If you kick before they're off balance, you'll meet air instead of leverage."
      },
      {
        name: "Ouchi Gari (Major Inner Reap / Inside Leg Trip)",
        description: "You step close, pull your opponent forward, and hook the inside of their leg to make them fall backward. It feels like tripping someone who's already losing balance.",
        coachTip: "Think diagonal, not straight back. Shift their weight to the far corner before you reap. The throw works when their spine tilts over the reaping line."
      },
      {
        name: "Ippon Seoi Nage (One Arm Shoulder Throw)",
        description: "You grab the sleeve, turn your back under their arm, and drop your hips so they roll over your shoulder. It's a powerful throw that turns their forward pressure into flight.",
        coachTip: "Your hips must be lower than theirs before you lift. When your legs drive and your torso stays tight to their arm, the throw feels effortless."
      },
      {
        name: "Collar Drag",
        description: "A quick pulling motion using the collar to make your opponent stumble forward, often leading to a back take or scramble.",
        coachTip: "Don't pull straight back. Pull across their line of balance. As they step, drop your weight and move to their blind side before they recover posture."
      },
      {
        name: "Lapel Pull to Trip (Lapel Foot Sweep)",
        description: "You grab the lapel, pull your opponent forward to break posture, and hook or block their foot to make them fall.",
        coachTip: "Timing beats strength. Wait until their weight loads on the lead leg, then turn your hips and reap. Their momentum will finish the job."
      },
      {
        name: "Tomoe Nage (Circle Throw / Front Sacrifice Throw)",
        description: "From standing grips, you drop backward under your opponent, place a foot on their hip, and use it to flip them over you.",
        coachTip: "The secret is placement. Slide under their centre of gravity before extending your leg. If you fall too early, they'll simply land on top of you."
      },
      {
        name: "Grip Break to Takedown Entry (Grip Break + Shot Entry)",
        description: "You strip their sleeve or lapel grip, then immediately shoot in for your preferred takedown while they're off balance.",
        coachTip: "Transitions win exchanges. Break the grip with intent and move instantly. Hesitation gives them the grip back."
      },
      {
        name: "Kouchi Gari (Small Inner Reap)",
        description: "A short inside foot trip used when your opponent steps toward you. You lightly hook the ankle and push their upper body backward.",
        coachTip: "This throw is about timing the step. Reap as their heel touches down. Their weight shift does the work for you."
      },
      {
        name: "Uchi Mata (Inner Thigh Throw)",
        description: "A hip throw variation where you step in deep, rotate your body, and lift their inner thigh with your leg to send them over.",
        coachTip: "Your torso must stay upright. As your hips turn under theirs, drive your leg up through their thigh, not back against it."
      },
      {
        name: "Tai Otoshi (Body Drop Throw)",
        description: "A forward throw where you turn and block their leg with your own while pulling their upper body over it.",
        coachTip: "Create rotation, not collision. Pull their sleeve across your body as you pivot. When their shoulders rotate, their base collapses over the block."
      }
    ]
  },
  "Guards & Positions": {
    type: "gi" as const,
    skills: [
      {
        name: "Closed Guard",
        description: "You wrap your legs around your opponent's waist from the bottom position to control their posture and limit their movement. From here you can attack with chokes, arm locks, or sweeps to reverse position.",
        coachTip: "Closed guard is a game of posture control. Keep their head lower than yours and stop their hands from posting on your chest. When their posture breaks, your attacks begin to work effortlessly."
      },
      {
        name: "Spider Guard",
        description: "You place your feet on your opponent's biceps while holding their sleeves to manage distance and balance. This position lets you use your legs like levers to move them off their base.",
        coachTip: "Maintain tension through your legs at all times. Your feet and hips should move together to create angles — it's this rhythm that opens space for sweeps and submissions."
      },
      {
        name: "Lasso Guard",
        description: "You loop one of your legs around your opponent's arm and grip their sleeve to trap and control their movement. The lasso keeps them off balance and slows their passing.",
        coachTip: "Use your lasso leg to disrupt balance, not just to hold position. Extend the leg to stretch their posture, then pull to force reactions that open attacks."
      },
      {
        name: "De La Riva Guard",
        description: "You hook your leg around your opponent's lead leg while they are standing, holding their sleeve or ankle to control their posture and base. This guard creates angles for sweeps and back takes.",
        coachTip: "Angle your hips outward and keep your hook active. The guard only works when you're off-centre — stay square and they'll easily step past your control."
      },
      {
        name: "Reverse De La Riva Guard",
        description: "You use the inside of your shin to hook your opponent's leg and stop them from driving forward. It's a defensive and attacking guard that helps retain control against pressure.",
        coachTip: "When they turn their knee in, engage your inside hook and pivot your hips away. The more you manage the angle, the less they can collapse your guard."
      },
      {
        name: "Collar Sleeve Guard",
        description: "You hold one collar and the opposite sleeve while framing with your legs to control distance. It's one of the most balanced guards for attacking triangles, omoplatas, and sweeps.",
        coachTip: "Always stay angled to one side. Use your grips to pull them into you and rotate your hips off the centre line. Power comes from angles, not from pulling straight back."
      },
      {
        name: "Worm Guard",
        description: "You feed your opponent's lapel around their leg to anchor yourself to them. The lapel acts as a tether, letting you trap their base and slow their movement while you set up sweeps.",
        coachTip: "Secure lapel tension before you attack. A tight lapel connection gives you control over their hips and makes their reactions predictable."
      },
      {
        name: "Lapel Guard Variations",
        description: "Different ways of using your opponent's lapel to tie up their legs, hips, or posture from the bottom position. It's a creative system for setting traps and forcing sweeps.",
        coachTip: "Treat the lapel as an extension of your grips. Maintain steady pressure and adjust to their movement instead of fighting against it. Smooth control always beats strength."
      },
      {
        name: "Single Leg X Guard",
        description: "You trap one of your opponent's legs between your own with their foot resting on your hip. This guard gives strong control for sweeps and leg entanglements.",
        coachTip: "Clamp your knees around their thigh and keep your hips slightly turned. The tighter your knee control, the more off-balance they become."
      },
      {
        name: "X Guard",
        description: "You sit underneath your opponent and control one of their legs using your hooks to lift and tilt their balance. It's one of the strongest sweeping guards against standing opponents.",
        coachTip: "Keep your bottom hook under their ankle and your top leg active for lifting. Use smooth, steady pressure rather than explosive movements."
      },
      {
        name: "K Guard",
        description: "You bring your knee between your opponent's legs and chest to create space and enter attacks or leg entanglements. It works as a bridge between De La Riva and X Guard.",
        coachTip: "Protect your head with your elbow and stay angled to the side. The K Guard's strength comes from inside control and precise hip movement."
      },
      {
        name: "False Reap",
        description: "You position your legs around your opponent's leg so their knee is directed inward while your hips stay just outside a full reaping position. This creates rotational pressure that disrupts their balance and opens sweeps, back takes, or leg lock entries without fully committing underneath them.",
        coachTip: "The false reap is about threat, not depth. Control the knee line and keep your hips mobile. When your opponent reacts to the rotation, the opening appears naturally."
      }
    ]
  },
  "Sweeps": {
    type: "gi" as const,
    skills: [
      {
        name: "Scissor Sweep",
        description: "From closed guard, you open your legs and use a scissoring motion to topple your opponent sideways. One leg cuts across their body while the other pushes against their knee, helping you roll them over into mount.",
        coachTip: "Angle your hips to the side before you sweep. Your top leg should push and your bottom leg should chop — it's the combination of both that breaks their base."
      },
      {
        name: "Flower Sweep",
        description: "You swing one leg wide from closed guard while underhooking your opponent's opposite leg. The motion tilts their body so you can roll them onto their back and land on top.",
        coachTip: "Think of your leg like a pendulum. The wider and smoother you swing, the more power you generate to lift their hips and finish the sweep."
      },
      {
        name: "Shaolin Sweep",
        description: "A sit-up style sweep from lasso guard where you rise forward and use your grips to tip your opponent's base. The lasso and forward motion combine to roll them onto their back.",
        coachTip: "Trap their arm with your lasso before sitting up. When you connect your body to theirs, even small movements create big off-balances."
      },
      {
        name: "Collar Drag to Sweep",
        description: "You pull your opponent forward by the collar to make them post awkwardly, then use that reaction to knock them over and come up on top.",
        coachTip: "Use the collar drag to force them to catch their balance. When they post, follow through immediately — hesitation lets them recover posture."
      },
      {
        name: "Tripod Sweep (With Sleeve Control)",
        description: "From open guard, you place one foot on their hip and the other behind their ankle. Pulling their sleeve while pushing with your legs trips them backward so you can stand into top position.",
        coachTip: "Push and pull at the same time. Your legs extend while your hands draw them forward; it's that opposing force that makes them fall cleanly."
      },
      {
        name: "Tomoe Nage Sweep",
        description: "You fall backward from guard, place your foot in their hip, and use it to roll your opponent over your head. It's the same motion as the sacrifice throw but initiated from the bottom.",
        coachTip: "Don't throw them straight up; guide them diagonally over your shoulder. That angle prevents them from posting and gives you better control during the roll."
      }
    ]
  }
};

const seedBjjGiPart1 = async () => {
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
    console.error("Error seeding BJJ Gi skills (Part 1):", error);
    process.exit(1);
  }
};

seedBjjGiPart1();
