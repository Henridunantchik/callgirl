// Script to create featured escorts
const createFeaturedEscorts = async () => {
  console.log("🌟 Creating Featured Escorts...");

  try {
    // Sample featured escort data
    const featuredEscorts = [
      {
        name: "Sarah Johnson",
        alias: "SarahJ",
        email: "sarah@example.com",
        phone: "+1234567891",
        age: 24,
        gender: "female",
        country: "ug",
        city: "Kampala",
        bio: "Professional escort with 3 years of experience. I provide discreet and high-quality services.",
        services: ["In-call", "Out-call", "Massage"],
        rates: {
          hourly: 150,
          overnight: 800,
          weekend: 1200,
          currency: "USD",
          isStandardPricing: true
        },
        availability: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        workingHours: { start: "10:00", end: "02:00" },
        isFeatured: true,
        isAvailable: true,
        stats: { views: 150, favorites: 25, reviews: 12, rating: 4.8 },
        gallery: [
          {
            url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
            caption: "Professional headshot",
            isPrivate: false,
            order: 1
          }
        ],
        verification: { isVerified: true, documents: ["id", "age"] }
      },
      {
        name: "Maria Rodriguez",
        alias: "MariaR",
        email: "maria@example.com",
        phone: "+1234567892",
        age: 26,
        gender: "female",
        country: "ug",
        city: "Kampala",
        bio: "Elegant and sophisticated companion. I specialize in luxury experiences and VIP services.",
        services: ["In-call", "Out-call", "VIP", "Dinner Companion"],
        rates: {
          hourly: 200,
          overnight: 1000,
          weekend: 1500,
          currency: "USD",
          isStandardPricing: true
        },
        availability: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        workingHours: { start: "12:00", end: "03:00" },
        isFeatured: true,
        isAvailable: true,
        stats: { views: 200, favorites: 35, reviews: 18, rating: 4.9 },
        gallery: [
          {
            url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
            caption: "Elegant evening look",
            isPrivate: false,
            order: 1
          }
        ],
        verification: { isVerified: true, documents: ["id", "age"] }
      },
      {
        name: "Emma Wilson",
        alias: "EmmaW",
        email: "emma@example.com",
        phone: "+1234567893",
        age: 23,
        gender: "female",
        country: "ug",
        city: "Kampala",
        bio: "Young and energetic escort. I love to make every moment special and memorable.",
        services: ["In-call", "Out-call", "GFE"],
        rates: {
          hourly: 120,
          overnight: 600,
          weekend: 900,
          currency: "USD",
          isStandardPricing: true
        },
        availability: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        workingHours: { start: "09:00", end: "01:00" },
        isFeatured: true,
        isAvailable: true,
        stats: { views: 180, favorites: 30, reviews: 15, rating: 4.7 },
        gallery: [
          {
            url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
            caption: "Casual and friendly",
            isPrivate: false,
            order: 1
          }
        ],
        verification: { isVerified: true, documents: ["id", "age"] }
      }
    ];

    // Create each featured escort
    for (const escortData of featuredEscorts) {
      console.log(`Creating escort: ${escortData.name}...`);
      
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: escortData.name,
          email: escortData.email,
          password: "password123",
          role: "client"
        }),
      });

      const registerData = await response.json();
      
      if (registerData.success) {
        // Login to get token
        const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: escortData.email,
            password: "password123",
          }),
        });

        const loginData = await loginResponse.json();
        
        if (loginData.success) {
          // Create escort profile
          const escortResponse = await fetch("http://localhost:5000/api/escort/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${loginData.token}`,
            },
            body: JSON.stringify({
              name: escortData.name,
              alias: escortData.alias,
              email: escortData.email,
              phone: escortData.phone,
              age: escortData.age,
              gender: escortData.gender,
              country: escortData.country,
              city: escortData.city,
              bio: escortData.bio,
              services: JSON.stringify(escortData.services),
              hourlyRate: escortData.rates.hourly,
              isStandardPricing: escortData.rates.isStandardPricing,
              isFeatured: escortData.isFeatured,
              stats: escortData.stats
            }),
          });

          const escortResult = await escortResponse.json();
          
          if (escortResult.success) {
            console.log(`✅ Created featured escort: ${escortData.name}`);
          } else {
            console.log(`❌ Failed to create escort ${escortData.name}:`, escortResult.message);
          }
        }
      } else {
        console.log(`⚠️ User ${escortData.name} might already exist`);
      }
    }

    console.log("🎉 Featured escorts creation completed!");

  } catch (error) {
    console.error("❌ Error creating featured escorts:", error.message);
  }
};

// Run the script
createFeaturedEscorts();
