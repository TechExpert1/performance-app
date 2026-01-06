import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/Sports.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

dotenv.config();

// BJJ No-Gi - Categories 1-3: Takedowns, Guards & Positions, Sweeps

const bjjNoGiData = {
  "Takedowns": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Double Leg Takedown",
        description: "You lower your level, drive forward, and wrap both of your opponent's legs, bringing them down to the mat. This takedown works by lifting or driving through their hips.",
        coachTip: "The success of the double leg depends on penetration, not just force. By keeping your spine straight and using your legs, you create a strong line of attack that bypasses their defence, ensuring clean execution without resistance."
      },
      {
        name: "Single Leg Takedown",
        description: "You drop your level, grab one of your opponent's legs, and pull it toward your body to unbalance them. From there, you either lift or step to the side to bring them to the ground.",
        coachTip: "Focus on controlling the opponent's hip line. Once you secure the leg, your alignment with their body dictates success. Move smoothly from the entry to the finish, maintaining constant pressure rather than relying on speed or force."
      },
      {
        name: "Snap Down to Front Headlock",
        description: "You pull your opponent's head down using a collar tie or underhook, breaking their posture and getting control of the front headlock. This leads to submissions or setting up back control.",
        coachTip: "The snap is less about strength and more about breaking their posture with minimal effort. Align your body with their head and move in a way that shifts their centre of gravity downward, allowing you to take control of their upper body."
      },
      {
        name: "Arm Drag to Back Take",
        description: "You pull your opponent's arm across your body and step outside to take their back. This is a powerful move to transition to rear control quickly.",
        coachTip: "Create angles by pulling their arm across and stepping to the outside. Once you control the angle of their upper body, the back becomes open to take with minimal effort. The key is controlling the line of movement, not just their arm."
      },
      {
        name: "Body Lock Takedown",
        description: "You close distance, lock your hands around your opponent's body, and drive with your hips to bring them down. The focus is on controlling the body and driving them to the mat.",
        coachTip: "Hip control is paramount; maintain close connection to their torso and use your hips to drive through them. Your connection to their body, not just strength, will dictate the success of this takedown."
      },
      {
        name: "Inside Trip (Uchi Mata Variation)",
        description: "You step in close and lift your opponent's inner thigh with your leg, rotating your body to off-balance them and bring them to the mat.",
        coachTip: "The throw comes from hip rotation and alignment, not from pulling or lifting with force. By staying connected to their body and rotating your hips, you generate the power necessary to complete the takedown."
      },
      {
        name: "Outside Trip (Osoto Gari Variation)",
        description: "You break your opponent's balance backward and sweep their leg from under them with your own leg, often using a body lock or overhook for control.",
        coachTip: "Timing is key; as they move off-balance, you use body positioning to place your leg in the right spot. The sweep becomes almost effortless when you control their posture and force them into a weakened position."
      },
      {
        name: "Duck Under to Back Control",
        description: "You drop your level and slip under your opponent's arm when they reach or post, circling behind them to secure back control.",
        coachTip: "Focus on timing the entry; as they extend their arm, you slip underneath and control their upper body with minimal effort. Hips close to their torso and a smooth pivot create the space for you to take their back."
      },
      {
        name: "Knee Tap Takedown",
        description: "From a collar tie or underhook, you drive forward and tap behind your opponent's knee to off-balance them. This creates an easy path to finish the takedown.",
        coachTip: "Control the line of their hips before applying the knee tap. You don't need brute force, just a slight shift in their center of gravity will make them fall to the mat."
      },
      {
        name: "Snap Down to Spin Behind",
        description: "After pulling your opponent's head down, you spin around their shoulder to take their back or secure a dominant top position.",
        coachTip: "The snap down creates a forced movement, and the spin is simply the continuation of the broken posture. Keep your chest tight to their neck, then pivot quickly to establish control."
      },
      {
        name: "Front Headlock to Ankle Pick",
        description: "From the front headlock, you release one arm to grab the ankle and push the opponent's head down to complete the takedown.",
        coachTip: "The front headlock controls their upper body, but the ankle pick requires hip connection to finish. Use pressure through their head and lower body to make the takedown inevitable."
      },
      {
        name: "Tripod Sweep to Takedown",
        description: "You pull your opponent forward and place your foot behind their ankle, using the momentum to bring them to the mat.",
        coachTip: "The key to the tripod sweep is creating momentum through your opponent's movement. By using their forward pressure, you can trip them and transition to top control seamlessly."
      },
      {
        name: "Collar Tie Snap to Double Leg Combination",
        description: "You fake a snap-down to make your opponent raise their head, then drop your level for a double leg shot.",
        coachTip: "The snap down forces them into a vulnerable position, while the double leg entry is a seamless continuation. Keep your spine straight and focus on controlling their centre line as you finish."
      },
      {
        name: "Inside Trip from Body Lock (Ko Uchi Gari Variation)",
        description: "From a tight body lock, you hook your opponent's leg on the inside and rotate your body to take them down.",
        coachTip: "The body lock is your anchor. As you rotate your hips, your leg takes control of their base. The connection between your upper body and their lower body will make the trip effortless."
      }
    ]
  },
  "Guards & Positions": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Closed Guard",
        description: "You wrap your legs around your opponent's waist from the bottom, controlling their posture and limiting their movement. From this position, you can set up attacks, sweeps, and submissions.",
        coachTip: "The key to closed guard is posture control. By keeping their head lower than yours and preventing their hands from posting, you dictate their movement. When their posture breaks, your attacks become effortless."
      },
      {
        name: "Butterfly Guard",
        description: "You use your hooks on the inside of your opponent's legs to control their posture. This guard allows for sweeping and creating angles to set up submissions.",
        coachTip: "The key to butterfly guard is active hooks. By keeping your feet in, you can easily lift your opponent's hips and sweep. Keep your torso upright and your knees wide to prevent them from establishing control."
      },
      {
        name: "Single Leg X Guard",
        description: "You trap one of your opponent's legs between your own, with their foot resting on your hip. This guard allows you to sweep, entangle their leg, and transition into leg locks.",
        coachTip: "Your knees must remain tight around their leg to control their centre of balance. Once you establish the position, focus on controlling their hips and creating angles, not just holding onto the leg."
      },
      {
        name: "X Guard",
        description: "You sit underneath your opponent and control one of their legs with hooks, using your position to lift and tilt their balance for sweeps or submissions.",
        coachTip: "The bottom hook under their ankle provides control. Lift and angle your opponent's hips, which forces them into an unbalanced position. Use your hooks to elevate and shift their weight before sweeping or transitioning."
      },
      {
        name: "K Guard",
        description: "You bring your knee between your opponent's legs and chest, creating space to enter attacks or leg entanglements.",
        coachTip: "Your head and elbow control are essential in this guard. Protect your head and use your hips to move them off their base. The strength of this guard comes from inside control and precise movements, allowing for a variety of sweeps and submissions."
      },
      {
        name: "False Reap",
        description: "You position your legs around your opponent's leg so their knee is directed inward while your hips stay just outside a full reaping position. This creates rotational pressure that disrupts their balance and opens sweeps, back takes, or leg lock entries without fully committing underneath them.",
        coachTip: "The false reap is about threat, not depth. Control the knee line and keep your hips mobile. When your opponent reacts to the rotation, the opening appears naturally."
      },
      {
        name: "Deep Half Guard",
        description: "From a half guard position, you move underneath your opponent's hips to gain control of their body. This guard is excellent for sweeping and leg lock attacks.",
        coachTip: "Keep your underhook tight and use your shoulder pressure to flatten them. When you control their hips, your ability to sweep or transition to leg locks becomes seamless."
      },
      {
        name: "Shin-Shin Guard",
        description: "You place your shin against your opponent's shin to maintain control and prevent them from passing. This guard allows for dynamic sweeps and entries into leg locks.",
        coachTip: "Keep your shin tight to their shin and use your top leg to hook around their leg for control. Maintain pressure through your hips and stay low to prevent them from advancing."
      },
      {
        name: "Inverted Guard",
        description: "You invert under your opponent, creating angles and positioning to attack submissions or sweeps. This guard is useful for dynamic scrambles and defending against passes.",
        coachTip: "Keep your hips elevated and always move in a way that places your opponent's weight on the wrong side of their base. Inverting is about using angles to attack and defend in transition."
      },
      {
        name: "Reverse De La Riva Guard",
        description: "You hook your opponent's leg with your shin on the inside, preventing them from driving forward. This guard allows you to sweep or create space for submissions.",
        coachTip: "Focus on creating angles. Your inside hook and hip movement limit their ability to drive forward. The more you manage the angle of their hips, the easier it becomes to sweep or attack."
      },
      {
        name: "Wrist Control Guard",
        description: "You control both of your opponent's wrists, framing with your legs to manage distance and create attacking opportunities.",
        coachTip: "Control their posture and hands. With wrist control, you limit their ability to post or base out. Angles become your weapon; by pulling their hands toward you and using your legs to frame, you create openings for sweeps and submissions."
      }
    ]
  },
  "Sweeps": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Scissor Sweep",
        description: "From closed guard, you use a scissoring motion with your legs to sweep your opponent. One leg cuts across their body while the other pushes against their knee, rolling them into mount.",
        coachTip: "The sweep works through hip angle and timing. When their base is off, use controlled pressure with your legs to guide their body into the sweep, keeping your hips active and fluid for a clean finish."
      },
      {
        name: "Flower Sweep",
        description: "From closed guard, you swing one leg wide while underhooking your opponents opposite leg. This motion tilts their body, allowing you to roll them onto their back and come up on top.",
        coachTip: "The sweep relies on creating an angle that destabilizes them. Swing your leg with fluidity, not force. The underhook provides elevation, allowing you to transition smoothly into top control."
      },
      {
        name: "Butterfly Sweep",
        description: "From butterfly guard, you use your hooks to elevate your opponent's hips, sweeping them to the side while maintaining control.",
        coachTip: "The sweep works through lifting and controlling their centre of balance. Stay upright with your chest while using your hooks to off-balance them. A small lift with the hooks will destabilize them, allowing for a clean sweep into top control."
      },
      {
        name: "Hip Bump Sweep",
        description: "From closed guard, you sit up and bump your hips into your opponent's torso to off-balance them, sweeping them to the side.",
        coachTip: "The bump is a redirection of their balance, not a push. Sit up quickly and drive your hips forward to off-balance them. Once they're off, follow through with your hands to complete the sweep smoothly."
      },
      {
        name: "X-Guard Sweep",
        description: "From X-guard, you control one of your opponent's legs and use your hooks to elevate their hips and sweep them to the side.",
        coachTip: "Focus on controlling their hips, not just their leg. Your bottom hook locks their leg in place while your top leg creates leverage to off-balance and sweep them. Use your hips to apply consistent pressure."
      },
      {
        name: "Single Leg X Sweep",
        description: "From single leg X guard, you control one of your opponent's legs and use your bottom hook to off-balance them, sweeping them into top control.",
        coachTip: "The key principle is constant pressure on their hips, not their leg. Use your bottom hook to control their balance and create an angle, guiding them smoothly into top control."
      },
      {
        name: "Tomoe Nage Sweep",
        description: "You drop back from guard, placing your foot on their hip and using it to roll your opponent over your head, finishing in top control.",
        coachTip: "This is a sacrifice throw that works by guiding your opponent's momentum over your shoulder. It's not about lifting but about using leverage from your foot on their hip to direct them smoothly into top control."
      },
      {
        name: "Knee Shield Sweep",
        description: "You use your knee shield to create distance, then sweep your opponent by shifting your weight and lifting their far leg.",
        coachTip: "The knee shield controls their posture and creates space. Once you create space and pressure, shift your weight and use your hips to lift their far leg into a smooth sweep."
      },
      {
        name: "Drag and Spin Sweep",
        description: "You use an overhook or wrist control to drag your opponent's posture forward, causing them to post awkwardly, then spin behind them to take the back or sweep into top control.",
        coachTip: "Drag your opponent's posture off balance and immediately spin behind them to secure back control or a dominant top position. The sweep is fluid, relying on their reaction and your ability to move with their momentum."
      },
      {
        name: "Knee Pull Sweep",
        description: "From closed guard, you pull on your opponent's knee or thigh while shifting your hips to sweep them into top control.",
        coachTip: "Hip mobility is the key here. When you pull their knee in, shift your hips to create an angle and sweep them smoothly into top position."
      },
      {
        name: "Elevator Sweep (Butterfly Guard Variation)",
        description: "From butterfly guard, you lift your opponent's hips while shifting your body to off-balance them, sweeping them into top position.",
        coachTip: "The sweep works through hip elevation. Use your hooks to lift their hips and create leverage, allowing you to smoothly sweep them into top control."
      }
    ]
  }
};

const seedBjjNoGiPart1 = async () => {
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

    for (const [categoryName, categoryData] of Object.entries(bjjNoGiData)) {
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
    console.error("Error seeding BJJ No-Gi skills (Part 1):", error);
    process.exit(1);
  }
};

seedBjjNoGiPart1();
