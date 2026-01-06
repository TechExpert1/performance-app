import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/Sports.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

dotenv.config();

// BJJ Gi - Categories 6-7: Submissions (Joint Locks), Pinning

const bjjGiData = {
  "Submissions (Joint Locks)": {
    type: "gi" as const,
    skills: [
      {
        name: "Armbar",
        description: "You isolate your opponent's arm between your legs and hips, aligning your body under the elbow to hyperextend the joint. The power of the finish comes from structure, not force.",
        coachTip: "Keep your knees tight and the thumb pointed upward. When your hips sit directly under the elbow line, a small, controlled lift creates clean pressure and control."
      },
      {
        name: "Kimura",
        description: "A figure-four grip secures the opponent's shoulder and bends the arm behind the back. The technique works through posture control and body rotation rather than speed.",
        coachTip: "Raise their elbow above shoulder height before rotating. Move your torso in sync with the grip so the shoulder absorbs the torque instead of the wrist."
      },
      {
        name: "Americana",
        description: "You trap the wrist and drive the elbow down toward the mat, creating outward rotation of the shoulder. The movement mirrors the Kimura in the opposite direction.",
        coachTip: "Keep the wrist pinned and your elbow close to your ribs. Rotate through your body to tighten the lock, using steady pressure instead of strength."
      },
      {
        name: "Omoplata",
        description: "You swing your leg over the opponent's trapped arm and rotate your hips to attack the shoulder joint. The submission relies on posture control and hip rotation.",
        coachTip: "Sit up as soon as the leg crosses the arm and angle your body for leverage. The hips apply the torque while the hands maintain posture control."
      },
      {
        name: "Wrist Lock",
        description: "You bend or twist the wrist to compress the small joints of the hand and forearm. Subtle control of timing and direction makes it highly effective.",
        coachTip: "Apply it during transitions when your opponent is focused elsewhere. Move slowly through the weakest range of motion to create pressure without effort."
      },
      {
        name: "Straight Ankle Lock",
        description: "You drive your forearm into the Achilles tendon while extending the hips to attack the ankle. Correct forearm position and hip direction make the lock efficient.",
        coachTip: "Keep the forearm low across the tendon and turn your hips outward as you extend. Maintain posture and balance to produce pressure through alignment, not speed."
      },
      {
        name: "Knee Bar",
        description: "You align your body with the opponent's leg and extend your hips to hyperextend the knee. The lock works through control of the hips and the straightening of the joint line.",
        coachTip: "Stabilise their hips before extending. When your spine, hips, and their leg form one line, even a small lift creates decisive pressure."
      },
      {
        name: "Toe Hold",
        description: "You secure the opponent's foot and rotate it to create torque through the ankle into the knee. Proper positioning allows control through smooth rotation.",
        coachTip: "Keep the toes close to your chest and rotate your wrist gently to increase tension. Small, precise movements are far more effective than large, fast ones."
      },
      {
        name: "Bicep Slicer",
        description: "You trap the opponent's arm between your shin and forearm, compressing the bicep muscle against the bone to create intense pressure on the upper arm and elbow.",
        coachTip: "Keep the arm tight and squeeze by flexing your hips. The goal is steady compression that builds progressively until the lock is complete."
      },
      {
        name: "Calf Slicer",
        description: "You insert your shin or forearm behind the opponent's bent leg and drive forward to compress the calf and knee joint. The technique combines leverage with positional control.",
        coachTip: "Anchor their ankle against your hip and apply slow, consistent pressure through your shin. Once their hips are controlled, the compression becomes inescapable."
      }
    ]
  },
  "Pinning": {
    type: "gi" as const,
    skills: [
      {
        name: "Side Control",
        description: "You control your opponent chest to chest with one arm under their head and the other under their far arm. Your weight stays centred across their torso, limiting movement and setting up transitions or submissions.",
        coachTip: "Keep your hips low and your shoulder driving into their jawline. Focus on controlling the near hip before advancing. Pressure and patience make this position dominant."
      },
      {
        name: "Kesa Gatame",
        description: "You sit beside your opponent's torso with their arm trapped under your armpit and your legs spread for balance. The hold secures the upper body through leverage and weight distribution.",
        coachTip: "Keep your elbow tight to their ribs and angle your hips slightly toward them. Small posture adjustments create an immovable base."
      },
      {
        name: "North-South Pin",
        description: "You face your opponent's legs while keeping your chest across their torso and your arms controlling their shoulders or hips. This position prevents backward movement and limits escapes.",
        coachTip: "Stay low and heavy through your ribs. Shift your hips subtly to follow their movement and maintain constant control."
      },
      {
        name: "Mount",
        description: "You sit on top of your opponent's torso with your knees tight against their sides and your hips balanced above their centre line. From here you can maintain pressure, attack submissions, or strike in self-defence contexts.",
        coachTip: "Slide your knees high under their armpits to limit bridging power. Stay upright and adjust with small movements to maintain stability."
      },
      {
        name: "Technical Mount",
        description: "You shift your weight to one side of mount with one knee up and one foot posted for balance as your opponent turns to escape. This allows tighter control during transitions or back takes.",
        coachTip: "Keep your upper body connected to their chest and your far foot close to their back. Control the head and shoulders before attacking."
      },
      {
        name: "Head and Arm Pin",
        description: "You trap your opponent's head and one arm together using chest and hip pressure to keep them flat. It's a strong control position that opens clear paths to submissions.",
        coachTip: "Block their far hip with your knee and turn their face away using your shoulder. Maintain even pressure to keep them pinned in place."
      },
      {
        name: "Twister Side Control",
        description: "From side control, you trap your opponent's near leg with your own and control their hips to restrict movement. This position sets up entries to the back or advanced transitions.",
        coachTip: "Keep your thigh tight to their leg and apply steady chest pressure. Secure control first, then look to advance or attack."
      },
      {
        name: "Mount Leg Ride",
        description: "From mount, you trap one of your opponent's legs under your own to reduce their mobility and increase base control. It's an ideal setup for arm attacks or back transitions.",
        coachTip: "Drive your shin into their hip and maintain upright posture. Control their lower body before isolating the upper body for attacks."
      },
      {
        name: "Back Control Chest Pin",
        description: "You stay tight behind your opponent using chest-to-back connection and a seatbelt grip, even if your hooks are not yet in place. This position controls rotation and posture.",
        coachTip: "Keep your chest glued to their back and follow their movement closely. As soon as they turn, insert your hooks and establish full control."
      },
      {
        name: "Crucifix Pin",
        description: "You trap both of your opponent's arms, one with your legs and the other with your grips, leaving them unable to defend. It offers strong control and direct access to submissions.",
        coachTip: "Secure both arms before adjusting position. Once isolation is complete, apply steady pressure through the chest to maintain dominance and open submission pathways."
      }
    ]
  }
};

const seedBjjGiPart3 = async () => {
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
    console.error("Error seeding BJJ Gi skills (Part 3):", error);
    process.exit(1);
  }
};

seedBjjGiPart3();
