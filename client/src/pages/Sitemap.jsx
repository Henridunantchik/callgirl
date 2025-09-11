import React from "react";
import { Helmet } from "react-helmet-async";

const Sitemap = () => {
  // Get all countries and cities
  const countries = [
    {
      code: "ug",
      name: "Uganda",
      cities: [
        "Kampala",
        "Entebbe",
        "Jinja",
        "Kira",
        "Mbarara",
        "Gulu",
        "Lira",
        "Masaka",
        "Mbale",
        "Mukono",
        "Njeru",
        "Kasese",
        "Kitgum",
        "Arua",
        "Iganga",
        "Fort Portal",
        "Mityana",
        "Hoima",
        "Lugazi",
        "Masindi",
        "Pallisa",
        "Nebbi",
        "Adjumani",
        "Kotido",
        "Lira",
        "Apac",
        "Soroti",
        "Kumi",
        "Busia",
        "Bugiri",
        "Mayuge",
        "Namayingo",
        "Buyende",
        "Kaliro",
        "Luuka",
        "Namutumba",
        "Butebo",
        "Kibuku",
        "Pallisa",
        "Budaka",
        "Butebo",
        "Kibuku",
        "Pallisa",
        "Budaka",
        "Butebo",
        "Kibuku",
        "Pallisa",
        "Budaka",
      ],
    },
    {
      code: "ke",
      name: "Kenya",
      cities: [
        "Nairobi",
        "Mombasa",
        "Kisumu",
        "Nakuru",
        "Eldoret",
        "Thika",
        "Malindi",
        "Kitale",
        "Garissa",
        "Kakamega",
        "Kisii",
        "Meru",
        "Nyeri",
        "Machakos",
        "Embu",
        "Nanyuki",
        "Kericho",
        "Bungoma",
        "Busia",
        "Homa Bay",
        "Migori",
        "Siaya",
        "Vihiga",
        "Bomet",
        "Laikipia",
        "Nandi",
        "Trans Nzoia",
        "Uasin Gishu",
        "West Pokot",
        "Samburu",
        "Turkana",
        "Marsabit",
        "Isiolo",
        "Mandera",
        "Wajir",
        "Tana River",
        "Lamu",
        "Taita Taveta",
        "Kwale",
        "Kilifi",
        "Tana River",
        "Lamu",
        "Taita Taveta",
        "Kwale",
        "Kilifi",
      ],
    },
    {
      code: "tz",
      name: "Tanzania",
      cities: [
        "Dar es Salaam",
        "Dodoma",
        "Mwanza",
        "Arusha",
        "Mbeya",
        "Morogoro",
        "Tanga",
        "Kahama",
        "Tabora",
        "Zanzibar",
        "Songea",
        "Musoma",
        "Iringa",
        "Katavi",
        "Kigoma",
        "Lindi",
        "Manyara",
        "Mara",
        "Njombe",
        "Pemba North",
        "Pemba South",
        "Pwani",
        "Rukwa",
        "Ruvuma",
        "Shinyanga",
        "Simiyu",
        "Singida",
        "Tabora",
        "Tanga",
        "Zanzibar North",
        "Zanzibar South and Central",
        "Zanzibar West",
      ],
    },
    {
      code: "rw",
      name: "Rwanda",
      cities: [
        "Kigali",
        "Butare",
        "Gitarama",
        "Ruhengeri",
        "Gisenyi",
        "Byumba",
        "Cyangugu",
        "Kibuye",
        "Rwamagana",
        "Kibungo",
        "Umutara",
        "Gikongoro",
        "Gitarama",
        "Kibungo",
        "Kigali",
        "Ruhengeri",
        "Umutara",
      ],
    },
    {
      code: "bi",
      name: "Burundi",
      cities: [
        "Bujumbura",
        "Gitega",
        "Ngozi",
        "Rumonge",
        "Cibitoke",
        "Kayanza",
        "Karuzi",
        "Kirundo",
        "Muyinga",
        "Ruyigi",
        "Cankuzo",
        "Rutana",
        "Makamba",
        "Bururi",
        "Muramvya",
        "Mwaro",
        "Bubanza",
      ],
    },
  ];

  const categories = [
    "in-call",
    "out-call",
    "massage",
    "gfe",
    "pse",
    "travel",
    "overnight",
    "duo",
    "dinner-date",
    "weekend",
    "party",
    "companionship",
    "bdsm",
    "role-play",
    "fetish",
    "couples",
  ];

  const generateSitemap = () => {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add main country pages
    countries.forEach((country) => {
      sitemap += `  <url>
    <loc>https://epicescorts.live/${country.code}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
    });

    // Add escort list pages
    countries.forEach((country) => {
      sitemap += `  <url>
    <loc>https://epicescorts.live/${country.code}/escorts</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    // Add city pages
    countries.forEach((country) => {
      country.cities.forEach((city) => {
        sitemap += `  <url>
    <loc>https://epicescorts.live/${
      country.code
    }/location/${city.toLowerCase()}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
      });
    });

    // Add category pages
    countries.forEach((country) => {
      categories.forEach((category) => {
        sitemap += `  <url>
    <loc>https://epicescorts.live/${country.code}/category/${category}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
    });

    // Add city + category combination pages
    countries.forEach((country) => {
      country.cities.slice(0, 10).forEach((city) => {
        // Limit to top 10 cities to avoid too many URLs
        categories.slice(0, 8).forEach((category) => {
          // Limit to top 8 categories
          sitemap += `  <url>
    <loc>https://epicescorts.live/${
      country.code
    }/location/${city.toLowerCase()}/category/${category}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
        });
      });
    });

    sitemap += `</urlset>`;
    return sitemap;
  };

  const sitemapContent = generateSitemap();

  return (
    <>
      <Helmet>
        <title>Sitemap - Epic Escorts</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Sitemap</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">XML Sitemap</h2>
            <p className="text-gray-600 mb-4">
              This sitemap contains all the pages on our website for search
              engines to crawl.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {sitemapContent}
              </pre>
            </div>
            <div className="mt-6">
              <a
                href="/sitemap.xml"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download XML Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sitemap;
