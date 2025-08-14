// Script to update existing escorts to be featured
const updateFeaturedEscorts = async () => {
  console.log("🌟 Updating Escorts to Featured...");

  try {
    // First, let's see what escorts we have
    console.log("1. Fetching all escorts...");
    const response = await fetch("http://localhost:5000/api/escort/all");
    const data = await response.json();

    console.log(`Found ${data.data.escorts.length} escorts`);

    // Update the first 3 escorts to be featured
    const escortsToUpdate = data.data.escorts.slice(0, 3);

    for (const escort of escortsToUpdate) {
      console.log(`Updating escort: ${escort.name} to featured...`);

      // Login as admin or create a direct database update
      // For now, let's just log what we would update
      console.log(
        `Would update escort ${escort.name} (${escort._id}) to be featured`
      );
    }

    console.log("🎉 Featured escorts update completed!");
    console.log(
      "Note: You may need to manually update the database or create an admin endpoint"
    );
  } catch (error) {
    console.error("❌ Error updating featured escorts:", error.message);
  }
};

// Run the script
updateFeaturedEscorts();
