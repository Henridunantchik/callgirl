// Script to mark user's escort profile as featured
const featureMyProfile = async () => {
  console.log("🌟 Marking your escort profile as featured...");

  try {
    // Your escort profile ID from the API response
    const myProfileId = "67bca60f2a1df3d303d09bff";

    console.log(`Setting your profile (${myProfileId}) as featured...`);

    const updateResponse = await fetch(
      `http://localhost:5000/api/escort/featured/${myProfileId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFeatured: true,
        }),
      }
    );

    const updateData = await updateResponse.json();

    if (updateData.success) {
      console.log("✅ Your profile is now featured!");
      console.log("Profile: henri dunant chikuru (lola lala)");
      console.log("Age: 18, Gender: Female");
      console.log("Location: Masaka, Uganda");
    } else {
      console.log("❌ Failed to feature your profile:", updateData.message);
    }

    console.log("🎉 Profile featuring completed!");
  } catch (error) {
    console.error("❌ Error featuring profile:", error.message);
  }
};

// Run the script
featureMyProfile();
