// Script to set escorts as featured
const setFeaturedEscorts = async () => {
  console.log("🌟 Setting Escorts as Featured...");

  try {
    // First, get all escorts
    console.log("1. Fetching all escorts...");
    const response = await fetch("http://localhost:5000/api/escort/all");
    const data = await response.json();
    
    console.log(`Found ${data.data.escorts.length} escorts`);
    
    // Set the first 3 escorts as featured
    const escortsToFeature = data.data.escorts.slice(0, 3);
    
    for (const escort of escortsToFeature) {
      console.log(`Setting escort: ${escort.name} as featured...`);
      
      const updateResponse = await fetch(`http://localhost:5000/api/escort/featured/${escort._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFeatured: true
        }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateData.success) {
        console.log(`✅ Set ${escort.name} as featured`);
      } else {
        console.log(`❌ Failed to set ${escort.name} as featured:`, updateData.message);
      }
    }
    
    console.log("🎉 Featured escorts setup completed!");

  } catch (error) {
    console.error("❌ Error setting featured escorts:", error.message);
  }
};

// Run the script
setFeaturedEscorts();
