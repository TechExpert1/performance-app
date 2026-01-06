import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "../models/Sports.js";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

dotenv.config();

// BJJ No-Gi - Categories 6-7: Submissions (Joint Locks), Pinning

const bjjNoGiData = {
  "Submissions (Joint Locks)": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Armbar",
        description: "You isolate your opponent's arm between your legs and hips and lift your hips to hyperextend the elbow joint. This is one of the most fundamental submissions in Jiu-Jitsu and can be applied from guard, mount, or back control.",
        coachTip: "To make the armbar work, control the wrist and keep your knees tight. When you lift your hips, focus on aligning their elbow. Your hips drive the pressure, not your arms. The straighter you keep their arm, the easier the submission will be."
      },
      {
        name: "Kimura",
        description: "You bend your opponent's arm behind their back using a figure-four grip that targets the shoulder joint. It can be applied from guard, top control, or side control.",
        coachTip: "The Kimura works by twisting the shoulder. Keep their elbow above their shoulder and focus on using your body rotation, not just your arms. Rotate your body toward their head, and the submission becomes more effective. Use small movements to apply steady pressure."
      },
      {
        name: "Americana",
        description: "A shoulder lock similar to the Kimura but applied in the opposite direction, where you trap the wrist and push the elbow down toward the mat.",
        coachTip: "The key is pushing the elbow toward the mat while controlling the wrist. Don't try to force it; use your chest pressure and small motions to gently tighten the lock. Think of the lock as a steady squeeze rather than pulling hard."
      },
      {
        name: "Omoplata",
        description: "You swing one leg over your opponent's arm and rotate your hips to lock their shoulder. It is often used from closed guard or open guard when they post an arm.",
        coachTip: "Control their posture and use your hips to create pressure on their shoulder. Sit up and angle your body to finish the lock. The rotational pressure from your hips is what makes this work. Keep your arm tight and use your legs for control, not just your arms."
      },
      {
        name: "Wrist Lock",
        description: "You bend or twist your opponent's wrist to create a submission by compressing the small joints of the hand and forearm.",
        coachTip: "Wrist locks work by applying sharp pressure to the wrist. When they make a grip or move their hand, capture it and twist it gently. The key is to stay subtle and apply pressure when their wrist is out of position. Focus on controlled movements to finish."
      },
      {
        name: "Straight Ankle Lock",
        description: "A leg lock that attacks the Achilles tendon and ankle by pressing your forearm into the tendon while extending your hips.",
        coachTip: "Keep your forearm tight against their Achilles. Align your body with their leg and rotate your hips outward. The pressure should be steady and gradual. It's about controlling their leg and slowly increasing pressure, not rushing the lock."
      },
      {
        name: "Knee Bar",
        description: "You straighten your opponent's leg and use your hips to hyperextend the knee joint. The control comes from aligning your body with their leg and pinning their hips.",
        coachTip: "Secure the line of their hips before extending. When your entire body is aligned with their knee, you only need a slight extension to finish the lock. The key to success is maintaining control over their hips, not just the knee."
      },
      {
        name: "Toe Hold",
        description: "You trap your opponent's foot and twist it to apply torque to the ankle and knee. It is a versatile submission that works from top, bottom, or transitional positions.",
        coachTip: "Keep their foot close to your chest and apply gentle rotation with your wrist. Small, controlled movements are far more effective than fast ones. The key is to use slow pressure on the ankle, not speed, to prevent escapes and finish the lock."
      },
      {
        name: "Inside Heel Hook",
        description: "You isolate your opponent's leg and twist the heel inward to apply rotational pressure to the knee. It is one of the most powerful leg submissions in grappling.",
        coachTip: "Always control the knee line before twisting. The heel acts as a lever to rotate the knee, so keep your hips aligned with their leg. Precision is the key here; use gradual, consistent pressure, not explosive movement, to safely finish the lock."
      },
      {
        name: "Outside Heel Hook",
        description: "A similar submission to the inside heel hook, but the twist is applied in the opposite direction, attacking the knee from an outward angle.",
        coachTip: "Maintain full control of the knee line before applying the twist. Small adjustments in angle will make the lock more effective. Keep your hips connected to their leg and apply slow, steady pressure to safely finish the lock."
      },
      {
        name: "Bicep Slicer",
        description: "You trap your opponent's arm between your shin and forearm, compressing the bicep muscle against the bone, creating sharp pressure on the elbow and upper arm.",
        coachTip: "Keep your shin tight against their arm and flex your hips to apply pressure. This submission is about compression, not speed. Control the pressure and feel it build gradually as you close the space."
      },
      {
        name: "Calf Slicer",
        description: "You press your shin or forearm into the back of your opponent's bent leg, forcing a strong compression through the calf muscle and knee joint.",
        coachTip: "Trap their ankle securely against your hip and drive your shin slowly into the bend of their leg. Focus on controlling their hips to stop them from rolling away before applying pressure. The pressure should be gradual and consistent."
      }
    ]
  },
  "Pinning": {
    type: "no-gi" as const,
    skills: [
      {
        name: "Side Control",
        description: "You control your opponent chest to chest with one arm under their head and the other under their far arm. Your weight stays centred across their torso to stop movement and set up transitions.",
        coachTip: "Pressure is key inside control. Keep your hips low and your shoulder driving into their jawline. Control their near hip to prevent them from turning. When they can't move their hips, their ability to recover guard is eliminated."
      },
      {
        name: "Kesa Gatame",
        description: "You sit beside your opponent's torso with their arm trapped under your armpit and your legs spread for base. This pin focuses on controlling their upper body through leverage and weight distribution.",
        coachTip: "Keep your elbow tight to their ribs and your hips turned toward them. Small adjustments in angle will make the hold feel immovable. The more you drive your chest into their upper body, the more control you have."
      },
      {
        name: "North-South Pin",
        description: "You face your opponent's legs while keeping your chest over their torso and your arms controlling their shoulders or hips. This position prevents bridging or escaping backward.",
        coachTip: "Stay low and heavy through your ribs. Move side to side with small hip shifts to follow their movement without losing balance. Your chest should stay heavy on their upper body while maintaining control of their head and arms."
      },
      {
        name: "Mount",
        description: "You sit on top of your opponent's torso with your knees pinched into their sides and your hips balanced above their centreline. From here, you can control, strike, or attack submissions.",
        coachTip: "Slide your knees high under their armpits to limit their ability to bridge. Keep your toes active and use small adjustments to maintain balance as they move. The more pressure you apply with your hips, the harder it becomes for them to escape."
      },
      {
        name: "Technical Mount",
        description: "You shift your weight to one side of mount with one knee up and one foot posted to follow your opponent as they turn to escape.",
        coachTip: "Keep your upper body tight and your far foot close to their back. This version of mount allows you to maintain control during transitions and keep pressure even as they try to escape."
      },
      {
        name: "Head and Arm Pin",
        description: "You trap your opponent's head and one arm together using chest and hip pressure to keep them flat on the mat. It is a controlling position that opens pathways to submissions.",
        coachTip: "Use your knee to block their far hip and your shoulder to turn their face away. Keep your weight spread evenly so they cannot create space. Focus on maintaining pressure through their head and arm to stop escapes."
      },
      {
        name: "Twister Side Control",
        description: "You control your opponent from side control while trapping their near leg with your own leg. It sets up entries to the back or submissions such as the truck position.",
        coachTip: "Focus on controlling their hips before pursuing attacks. Keep your thigh tight to their leg, applying steady downward pressure with your chest. The tighter you keep your body to theirs, the less chance they have to move."
      },
      {
        name: "Mount Leg Ride",
        description: "You control from mount while trapping one of your opponent's legs under your own. This limits their movement and strengthens your base.",
        coachTip: "Drive your shin into their hip and keep your posture upright. Trapping their leg limits their ability to escape, allowing you to control the upper body with ease."
      },
      {
        name: "Back Control Chest Pin",
        description: "You control your opponent from behind using tight chest contact and a seatbelt grip, even if your hooks are not yet in place.",
        coachTip: "Keep your chest glued to their back and follow their movement closely. Once you feel them turn, insert your hooks and establish full control. Stay tight to their torso to prevent them from escaping."
      },
      {
        name: "Crucifix Pin",
        description: "You trap both of your opponent's arms, one with your legs and the other with your grips, leaving them unable to defend. It is a strong control position that leads directly to chokes or arm locks.",
        coachTip: "Secure their arms before adjusting your position. When both limbs are isolated, use slow, deliberate pressure to maintain control and open submission options. Constant pressure ensures they can't escape."
      }
    ]
  }
};

const seedBjjNoGiPart3 = async () => {
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
    console.error("Error seeding BJJ No-Gi skills (Part 3):", error);
    process.exit(1);
  }
};

seedBjjNoGiPart3();
