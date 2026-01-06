import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/Sports.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

dotenv.config();

// BJJ No-Gi - Categories 4-5: Guard Passing, Submissions (Chokes)

const bjjNoGiData = {
  "Guard Passing": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Toreando Pass",
        description: "You control your opponent's legs with wrist or ankle grips, push them to one side, and circle around to reach side control. The motion is fast and circular, allowing you to pass without engaging their hooks.",
        coachTip: "The key to this pass is angle and mobility, not force. You're redirecting their legs instead of fighting them. Keep your posture upright and use a circular movement to pass. The goal is not to overpower their guard but to manoeuvre around it."
      },
      {
        name: "Knee Cut Pass",
        description: "You drive one knee between your opponent's legs and slice it across their thigh while maintaining upper-body control through underhooks or crossface pressure.",
        coachTip: "This pass is about pressure and alignment, not speed. Your shoulder should pin their upper body while your knee slices through. Control the top half of their body to open space for the pass. Once their upper body is immobilized, their lower body follows."
      },
      {
        name: "Over Under Pass",
        description: "You slide one arm over and the other arm under your opponent's legs, controlling their hips as you pressure forward to clear the guard.",
        coachTip: "Posture control is paramount. Keep your head low and your elbows tight to their body. Pressure forward through your hips, keeping your head aligned with their chest to prevent any recovery. The key is to avoid getting trapped in their guard by applying constant pressure with your upper body while freeing your legs."
      },
      {
        name: "Double Underhook Stack Pass",
        description: "You scoop both legs under your arms, stack your opponent onto their shoulders, and walk around their guard to pass into side control.",
        coachTip: "This pass works by controlling the opponent's hips and breaking their structure. Stack them high on their shoulders, then slowly walk around their legs. Don't rush the pass; use gravity to bring them into the correct position, then move around them once they're flattened."
      },
      {
        name: "Body Lock Pass",
        description: "You secure your hands around your opponent's hips, drive forward, and climb your chest up their torso to clear their legs.",
        coachTip: "The key here is connection. Keep your chest tight to their body and drive through their torso. When their hips can't move, the legs lose their effectiveness in the guard. Move slowly, focusing on body alignment and tight control to bring them into a position where you can pass effortlessly."
      },
      {
        name: "Long Step Pass",
        description: "From open guard, you disengage their hooks, step your back leg wide, and rotate your hips to clear their legs and settle into side control.",
        coachTip: "Hip rotation is the key to this pass. Keep your posture tall and step your back leg wide enough to clear their hooks. Pressure through their legs with your chest before turning your body. Once you've cleared their guard, hip rotation finishes the pass with minimal effort."
      },
      {
        name: "Leg Drag Pass",
        description: "You drag one of your opponent's legs across their body, pin it to the mat, and shift your weight forward to secure side control or back exposure.",
        coachTip: "Alignment and pressure are crucial. Drag their leg across their body, then shift your weight forward, applying constant pressure through your chest. When their hips are controlled, they can't recover guard. Pin their knee to the mat, then move into the pass without rushing."
      },
      {
        name: "Headquarters Pass",
        description: "You step one leg between your opponent's guard and sit into a balanced base while controlling their grips. From here, you can launch into knee cuts, leg drags, or pressure passes.",
        coachTip: "Think of headquarters as a transition point; keep your posture upright and your chest over their hips. From here, you can either clear their legs by cutting or drive through them with pressure. It's important to control their grips before committing to any pass."
      },
      {
        name: "Half Guard Smash Pass",
        description: "You flatten your opponent from half guard, establish an underhook, and use shoulder pressure to free your trapped leg while advancing into side control.",
        coachTip: "The pass begins with pressure. Use your shoulder to turn their face away from you and flatten them out. Once their spine is out of alignment, your leg comes free with minimal effort. Use your underhook to guide the motion while driving through their chest."
      },
      {
        name: "Knee Staple Pass",
        description: "From top position, you drive your knee across their thigh and staple it to the mat, controlling their hips before transitioning into side control.",
        coachTip: "Knee control is essential. By pinning their leg, you eliminate their ability to recover guard. The pressure comes from aligning your hips with their trapped leg, while you focus on stability before moving into the pass."
      },
      {
        name: "Back Step Pass",
        description: "You step your lead leg across and back over your opponent's guard, clearing their hooks while maintaining chest control. It's especially useful against half guard and knee shield players.",
        coachTip: "The back step relies on rotation and weight distribution. Keep control of their upper body while stepping back. When you step across their hips, stay low to avoid re-guarding. The key is keeping constant pressure through your body as you clear the hooks."
      },
      {
        name: "Tripod Float Pass",
        description: "From standing, you posture tall and create pressure, pushing one leg down while maintaining hip control. You step back with one leg and use gravity to break their guard and transition forward.",
        coachTip: "Posture and balance are the foundations of this pass. Push their legs down with your hips and move side-to-side to create space. Stay low while maintaining control of their hips and knees, then step back to disengage their guard."
      }
    ]
  },
  "Submissions (Chokes)": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Rear Naked Choke",
        description: "From back control, you wrap one arm around your opponent's neck and lock your hands together behind their head, closing both sides of the neck.",
        coachTip: "The rear naked choke succeeds when you control the space around their neck. Align your body to their spine, keeping your chest tight to their back. Elbow position is critical; too wide, they can escape; too tight, you lose leverage. Keep your focus on torque generated from your chest and torso, not just arm strength."
      },
      {
        name: "Guillotine Choke",
        description: "You wrap your arm under your opponent's neck from the front and clasp your hands while lifting your elbow to apply pressure.",
        coachTip: "The guillotine works by controlling the neckline, not just pulling. Keep your wrist firm and position your forearm tightly under their chin. When you lift, focus on posture control; lifting their head forces their spine into submission. Don't rush; focus on controlling their posture before applying pressure."
      },
      {
        name: "Triangle Choke",
        description: "From guard, you trap one of your opponent's arms inside your legs and the other outside, crossing your legs to form a triangle around their neck and shoulder.",
        coachTip: "The triangle is about alignment, not just squeezing. Rotate your hips so their trapped shoulder faces the centre of your triangle. This closes the line of their neck and shoulder. Focus on angles: when their body aligns with the choke, it closes with minimal force. Squeeze with your legs, not just your knees."
      },
      {
        name: "Arm-In Guillotine",
        description: "A variation that traps one of your opponent's arms inside the choke, adding shoulder pressure and limiting escapes.",
        coachTip: "The arm-in guillotine uses shoulder pressure to limit their escape options. Align your elbow with their neck and keep your forearm tight. Move your body around them rather than pulling with your arms. The pressure comes from compressing their neck and shoulder through proper torso alignment."
      },
      {
        name: "Short Choke",
        description: "From back control, you wrap your arm around the neck and grab your own bicep while placing the hand on their shoulder, squeezing tightly.",
        coachTip: "This choke works through elbow tightness and chest pressure. Keep your elbow low and focus on compressing the space around their neck. Keep your chest connected to their back and apply consistent pressure as you squeeze. Patience in the squeeze leads to a slow but sure finish."
      },
      {
        name: "D'Arce Choke",
        description: "From top position, you thread your arm under your opponents near arm and across their neck, locking your hands and sprawling to tighten the choke.",
        coachTip: "The D'Arce choke works through body rotation, not just arm strength. Lower your chest to their back to create pressure. Focus on torso alignment: when your shoulder drives across their neck, the choke will finish effortlessly. Rotate toward the trapped arm to close the space and finish with maximum leverage."
      },
      {
        name: "Anaconda Choke",
        description: "You feed your arm under the neck and through the far armpit, lock your hands, and roll toward the trapped arm to apply pressure.",
        coachTip: "The anaconda choke uses compression; you're not pulling, you're closing space. Use your body to rotate around their head. Align your shoulders with their neck and keep your torso close. As you roll, focus on tightening the triangle you've created with your arms and body, sealing off their airway with minimal movement."
      },
      {
        name: "Arm Triangle Choke",
        description: "You trap your opponent's head and one arm between your shoulder and the mat, pressing forward until the choke closes.",
        coachTip: "Focus on hip alignment. Your body should be aligned to their trapped side, applying shoulder pressure. The more you press chest to chest, the less movement they have. Control their head and arm with steady pressure, walking your hips forward slowly until the choke finishes with ease."
      },
      {
        name: "Guillotine High-Elbow",
        description: "You lift your choking arm high while keeping your chest over their head, increasing pressure on the neck.",
        coachTip: "Arm position is crucial. When you lift your elbow high, you align your body to increase compression on their neck. Keep your wrist tight and use the pressure from your body, not just your arms. High-elbow guillotines finish faster when you use your hips and torso to drive the choke home."
      },
      {
        name: "North-South Choke",
        description: "From north-south position, you circle your arm around your opponent's neck and drop your shoulder to compress their throat against your ribs.",
        coachTip: "Pressure is key, keep your chest heavy and use your torso, not your arms, to apply force. Control their body by keeping your weight centred over their chest. As you drop your shoulder, use your whole body to squeeze, the tighter the chest connection, the better the choke."
      },
      {
        name: "Peruvian Necktie",
        description: "From front headlock, you thread one leg over their back and the other across their shoulder, pulling upward to finish the choke.",
        coachTip: "The key is leg position and body compression. Keep your chest tight against their back, and don't rush the leg setup. As you pull with your arms, extend your legs to create the lever that applies the choke. The tighter you pull, the less room they have to escape."
      }
    ]
  }
};

const seedBjjNoGiPart2 = async () => {
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
    console.error("Error seeding BJJ No-Gi skills (Part 2):", error);
    process.exit(1);
  }
};

seedBjjNoGiPart2();
