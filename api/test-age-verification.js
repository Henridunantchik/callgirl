import { verifyAgeFromDocument } from "./utils/ageVerification.js";
import fs from "fs";
import path from "path";

// Test cases for different languages and document types
const testCases = [
  {
    name: "English Passport",
    language: "english",
    documentType: "passport",
    sampleText: `
      PASSPORT
      Surname: SMITH
      Given Names: JOHN MICHAEL
      Date of Birth: 15/03/1985
      Place of Birth: LONDON, UK
      Date of Issue: 20/06/2020
      Date of Expiry: 19/06/2030
      Authority: UK PASSPORT OFFICE
      Passport Number: 123456789
      Nationality: BRITISH
    `,
    expectedAge: 39,
  },
  {
    name: "French Passport",
    language: "french",
    documentType: "passport",
    sampleText: `
      PASSEPORT
      Nom: DUPONT
      Prénoms: MARIE CLAIRE
      Date de naissance: 22/07/1990
      Lieu de naissance: PARIS, FRANCE
      Date de délivrance: 15/03/2022
      Date d'expiration: 14/03/2032
      Autorité: PRÉFECTURE DE PARIS
      Numéro de passeport: 987654321
      Nationalité: FRANÇAISE
    `,
    expectedAge: 34,
  },
  {
    name: "Spanish ID Card",
    language: "spanish",
    documentType: "national_id",
    sampleText: `
      DOCUMENTO NACIONAL DE IDENTIDAD
      Apellidos: GARCÍA LÓPEZ
      Nombre: CARLOS ANTONIO
      Fecha de nacimiento: 08/12/1988
      Lugar de nacimiento: MADRID, ESPAÑA
      Fecha de expedición: 10/05/2021
      Fecha de caducidad: 09/05/2031
      Autoridad: COMISARÍA GENERAL DE DOCUMENTACIÓN
      Número de documento: 12345678A
      Nacionalidad: ESPAÑOLA
    `,
    expectedAge: 36,
  },
  {
    name: "German Driver License",
    language: "german",
    documentType: "drivers_license",
    sampleText: `
      FAHRERLAUBNIS
      Name: MÜLLER
      Vorname: HANS PETER
      Geburtsdatum: 14.09.1982
      Geburtsort: BERLIN, DEUTSCHLAND
      Ausstellungsdatum: 25.11.2020
      Gültig bis: 24.11/2030
      Ausstellende Behörde: LANDESAMT FÜR EINWOHNERWESEN
      Führerscheinnummer: 123456789
      Staatsangehörigkeit: DEUTSCH
    `,
    expectedAge: 42,
  },
  {
    name: "Underage Person",
    language: "english",
    documentType: "passport",
    sampleText: `
      PASSPORT
      Surname: JOHNSON
      Given Names: SARAH ELIZABETH
      Date of Birth: 15/03/2010
      Place of Birth: MANCHESTER, UK
      Date of Issue: 20/06/2023
      Date of Expiry: 19/06/2033
      Authority: UK PASSPORT OFFICE
      Passport Number: 987654321
      Nationality: BRITISH
    `,
    expectedAge: 14,
  },
  {
    name: "Italian Birth Certificate",
    language: "italian",
    documentType: "birth_certificate",
    sampleText: `
      CERTIFICATO DI NASCITA
      Cognome: ROSSI
      Nome: MARCO ANTONIO
      Data di nascita: 03/11/1987
      Luogo di nascita: ROMA, ITALIA
      Data di rilascio: 12/08/2021
      Autorità: COMUNE DI ROMA
      Numero di certificato: 123456789
      Nazionalità: ITALIANA
    `,
    expectedAge: 37,
  },
];

// Mock file object for testing
const createMockFile = (mimetype = "image/jpeg", size = 1024000) => ({
  mimetype,
  size,
  tempFilePath: "/tmp/test-document.jpg",
});

// Test the age verification system
async function testAgeVerification() {
  console.log("🧪 TESTING ENHANCED AGE VERIFICATION SYSTEM\n");

  let passedTests = 0;
  let totalTests = 0;

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📋 Test ${totalTests}: ${testCase.name}`);
    console.log(`   Language: ${testCase.language}`);
    console.log(`   Document Type: ${testCase.documentType}`);
    console.log(`   Expected Age: ${testCase.expectedAge}`);

    try {
      // Create mock file
      const mockFile = createMockFile();

      // Mock the OCR extraction to return our test text
      const originalExtractText =
        require("./utils/ageVerification.js").extractTextFromDocument;

      // Override the extractTextFromDocument function for testing
      const { extractTextFromDocument } = await import(
        "./utils/ageVerification.js"
      );

      // Create a temporary file with the test text
      const tempFilePath = `/tmp/test-${Date.now()}.txt`;
      fs.writeFileSync(tempFilePath, testCase.sampleText);

      // Test the verification
      const result = await verifyAgeFromDocument(
        tempFilePath,
        "test-user-123",
        mockFile
      );

      console.log(`   ✅ Result: ${result.status}`);
      console.log(`   📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   🎯 Detected Age: ${result.age}`);
      console.log(`   📄 Document Type: ${result.documentType}`);
      console.log(`   🌍 Language: ${result.language}`);
      console.log(`   💬 Reason: ${result.reason}`);

      // Validate results
      const ageCorrect = result.age === testCase.expectedAge;
      const languageCorrect = result.language === testCase.language;
      const documentTypeCorrect = result.documentType === testCase.documentType;

      if (ageCorrect && languageCorrect && documentTypeCorrect) {
        console.log(`   ✅ PASSED: All validations correct`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED:`);
        if (!ageCorrect)
          console.log(
            `      - Age mismatch: expected ${testCase.expectedAge}, got ${result.age}`
          );
        if (!languageCorrect)
          console.log(
            `      - Language mismatch: expected ${testCase.language}, got ${result.language}`
          );
        if (!documentTypeCorrect)
          console.log(
            `      - Document type mismatch: expected ${testCase.documentType}, got ${result.documentType}`
          );
      }

      // Clean up
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  console.log(`\n📊 TEST SUMMARY:`);
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(
    `   📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Age verification system is working correctly."
    );
  } else {
    console.log("\n⚠️  Some tests failed. Please review the implementation.");
  }
}

// Run the tests
testAgeVerification().catch(console.error);
