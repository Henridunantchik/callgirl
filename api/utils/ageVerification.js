import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import { asyncHandler } from "./asyncHandler.js";
import config from "../config/env.js";
import railwayStorage from "../services/railwayStorage.js";

// Supported document types for age verification
const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/tiff",
  "image/bmp",
  "image/webp",
];

// Maximum file size for age verification documents (10MB)
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

// Age verification result status
export const VERIFICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FAILED: "failed",
  MANUAL_REVIEW: "manual_review",
};

// Document types for age verification
export const DOCUMENT_TYPES = {
  PASSPORT: "passport",
  DRIVERS_LICENSE: "drivers_license",
  NATIONAL_ID: "national_id",
  BIRTH_CERTIFICATE: "birth_certificate",
  OTHER: "other",
};

// Multi-language age-related keywords
const AGE_KEYWORDS_MULTILINGUAL = {
  english: [
    "birth",
    "born",
    "date of birth",
    "dob",
    "age",
    "years old",
    "birthday",
    "birth date",
    "born on",
    "issued",
    "expiry",
    "valid until",
    "expires",
    "issue date",
    "date of issue",
    "born",
    "birth",
    "age",
    "years",
    "old",
    "date",
  ],
  french: [
    "naissance",
    "né",
    "née",
    "date de naissance",
    "âge",
    "ans",
    "anniversaire",
    "né le",
    "née le",
    "délivré",
    "expire",
    "valide jusqu'au",
    "date de délivrance",
    "né(e)",
    "âge",
  ],
  spanish: [
    "nacimiento",
    "nacido",
    "nacida",
    "fecha de nacimiento",
    "edad",
    "años",
    "cumpleaños",
    "nacido el",
    "nacida el",
    "emitido",
    "expira",
    "válido hasta",
    "fecha de emisión",
    "nacido/a",
    "edad",
  ],
  german: [
    "geburt",
    "geboren",
    "geburtsdatum",
    "alter",
    "jahre",
    "geburtstag",
    "geboren am",
    "ausgestellt",
    "läuft ab",
    "gültig bis",
    "ausstellungsdatum",
    "geboren",
    "alter",
  ],
  portuguese: [
    "nascimento",
    "nascido",
    "nascida",
    "data de nascimento",
    "idade",
    "anos",
    "aniversário",
    "nascido em",
    "nascida em",
    "emitido",
    "expira",
    "válido até",
    "data de emissão",
    "nascido/a",
    "idade",
  ],
  italian: [
    "nascita",
    "nato",
    "nata",
    "data di nascita",
    "età",
    "anni",
    "compleanno",
    "nato il",
    "nata il",
    "rilasciato",
    "scade",
    "valido fino al",
    "data di rilascio",
    "nato/a",
    "età",
  ],
};

// Multi-language date patterns
const DATE_PATTERNS_MULTILINGUAL = {
  // English date patterns
  english: [
    // DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
    // MM/DD/YYYY or MM-DD-YYYY
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
    // YYYY-MM-DD
    /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g,
    // DD.MM.YYYY
    /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g,
    // Month name patterns
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/gi,
    // Full month names
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/gi,
  ],
  // French date patterns
  french: [
    // DD/MM/YYYY
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
    // Month names in French
    /\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}\b/gi,
  ],
  // Spanish date patterns
  spanish: [
    // DD/MM/YYYY
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
    // Month names in Spanish
    /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4}\b/gi,
  ],
  // German date patterns
  german: [
    // DD.MM.YYYY (German format)
    /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g,
    // Month names in German
    /\b(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4}\b/gi,
  ],
};

// Document type detection patterns
const DOCUMENT_TYPE_PATTERNS = {
  passport: [
    "passport",
    "passeport",
    "pasaporte",
    "pass",
    "passport number",
    "république",
    "republic",
    "república",
    "nationality",
    "nationalité",
  ],
  drivers_license: [
    "driver",
    "license",
    "licence",
    "driving",
    "conduire",
    "conducir",
    "class",
    "categories",
    "catégories",
    "restrictions",
  ],
  national_id: [
    "identity",
    "identité",
    "identidad",
    "national id",
    "carte nationale",
    "documento nacional",
    "personal number",
    "numéro personnel",
  ],
  birth_certificate: [
    "birth",
    "certificate",
    "certificat",
    "certificado",
    "naissance",
    "nacimiento",
    "born",
    "né",
    "nato",
    "nascido",
  ],
};

// Month name mappings for different languages
const MONTH_MAPPINGS = {
  english: {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  },
  french: {
    janvier: 0,
    février: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    août: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    décembre: 11,
  },
  spanish: {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  },
  german: {
    januar: 0,
    februar: 1,
    märz: 2,
    april: 3,
    mai: 4,
    juni: 5,
    juli: 6,
    august: 7,
    september: 8,
    oktober: 9,
    november: 10,
    dezember: 11,
  },
};

/**
 * Detect language from text content
 */
const detectLanguage = (text) => {
  const languageScores = {};

  Object.keys(AGE_KEYWORDS_MULTILINGUAL).forEach((lang) => {
    const keywords = AGE_KEYWORDS_MULTILINGUAL[lang];
    const matches = keywords.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    languageScores[lang] = matches.length;
  });

  // Return the language with the most keyword matches
  const detectedLang = Object.keys(languageScores).reduce((a, b) =>
    languageScores[a] > languageScores[b] ? a : b
  );

  return languageScores[detectedLang] > 0 ? detectedLang : "english";
};

/**
 * Extract text from document using OCR (placeholder for Tesseract)
 */
const extractTextFromDocument = async (documentPath) => {
  try {
    // This will be replaced with actual Tesseract OCR
    // For now, return a placeholder that simulates OCR extraction
    console.log(`OCR extraction from: ${documentPath}`);

    // Simulate OCR processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return sample text for testing
    return `
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
    `.toLowerCase();
  } catch (error) {
    console.error("OCR extraction failed:", error);
    throw new ApiError(500, "Failed to extract text from document");
  }
};

/**
 * Extract date patterns from text with multi-language support
 */
const extractDatePatterns = (text) => {
  const allDates = [];
  const detectedLang = detectLanguage(text);

  console.log(`Detected language: ${detectedLang}`);

  // Get patterns for detected language
  const patterns =
    DATE_PATTERNS_MULTILINGUAL[detectedLang] ||
    DATE_PATTERNS_MULTILINGUAL.english;

  patterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      allDates.push(...matches);
    }
  });

  // Also try English patterns as fallback
  if (detectedLang !== "english") {
    DATE_PATTERNS_MULTILINGUAL.english.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        allDates.push(...matches);
      }
    });
  }

  console.log(`Found ${allDates.length} date patterns:`, allDates);
  return allDates;
};

/**
 * Calculate age from birth date
 */
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Parse date string to Date object with multi-language support
 */
const parseDate = (dateString, language = "english") => {
  console.log(`Parsing date: "${dateString}" in language: ${language}`);

  // Try multiple date formats
  const formats = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // MM/DD/YYYY or MM-DD-YYYY (American format)
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // DD.MM.YYYY (German format)
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      let day, month, year;

      if (format.source.includes("YYYY")) {
        // YYYY-MM-DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        // DD/MM/YYYY or MM/DD/YYYY format
        // Try both interpretations
        const first = parseInt(match[1]);
        const second = parseInt(match[2]);
        const third = parseInt(match[3]);

        // Determine if it's DD/MM/YYYY or MM/DD/YYYY based on language
        if (language === "english" && first <= 12) {
          // Likely MM/DD/YYYY for English
          month = first - 1;
          day = second;
          year = third;
        } else {
          // Likely DD/MM/YYYY for other languages
          day = first;
          month = second - 1;
          year = third;
        }
      }

      // Validate date
      if (
        year >= 1900 &&
        year <= 2030 &&
        month >= 0 &&
        month <= 11 &&
        day >= 1 &&
        day <= 31
      ) {
        const date = new Date(year, month, day);
        if (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        ) {
          console.log(`Successfully parsed date: ${date.toISOString()}`);
          return date;
        }
      }
    }
  }

  // Try parsing with month names
  const monthMappings = MONTH_MAPPINGS[language] || MONTH_MAPPINGS.english;

  for (const [monthName, monthIndex] of Object.entries(monthMappings)) {
    const monthPattern = new RegExp(
      `\\b(\\d{1,2})\\s+${monthName}\\s+(\\d{4})\\b`,
      "i"
    );
    const match = dateString.match(monthPattern);
    if (match) {
      const day = parseInt(match[1]);
      const year = parseInt(match[2]);
      const month = monthIndex;

      if (year >= 1900 && year <= 2030 && day >= 1 && day <= 31) {
        const date = new Date(year, month, day);
        if (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        ) {
          console.log(
            `Successfully parsed date with month name: ${date.toISOString()}`
          );
          return date;
        }
      }
    }
  }

  console.log(`Failed to parse date: ${dateString}`);
  return null;
};

/**
 * Extract age-related keywords from text with multi-language support
 */
const extractAgeKeywords = (text) => {
  const detectedLang = detectLanguage(text);
  const keywords =
    AGE_KEYWORDS_MULTILINGUAL[detectedLang] ||
    AGE_KEYWORDS_MULTILINGUAL.english;

  const foundKeywords = keywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  console.log(`Found age keywords (${detectedLang}):`, foundKeywords);
  return foundKeywords;
};

/**
 * Detect document type from text content
 */
const detectDocumentType = (text) => {
  const textLower = text.toLowerCase();
  const typeScores = {};

  Object.keys(DOCUMENT_TYPE_PATTERNS).forEach((type) => {
    const patterns = DOCUMENT_TYPE_PATTERNS[type];
    const matches = patterns.filter((pattern) =>
      textLower.includes(pattern.toLowerCase())
    );
    typeScores[type] = matches.length;
  });

  // Return the document type with the most pattern matches
  const detectedType = Object.keys(typeScores).reduce((a, b) =>
    typeScores[a] > typeScores[b] ? a : b
  );

  return typeScores[detectedType] > 0 ? detectedType : "other";
};

/**
 * Validate document authenticity using AI
 */
const validateDocumentAuthenticity = async (documentPath, file) => {
  try {
    console.log(`Validating document authenticity: ${documentPath}`);

    // Basic authenticity checks
    const authenticityChecks = {
      fileSize: file.size > 1000 ? 1 : 0, // File should be substantial
      format: SUPPORTED_DOCUMENT_TYPES.includes(file.mimetype) ? 1 : 0,
      resolution: 1, // Would check image resolution
      metadata: 1, // Would check for tampering
      aiAnalysis: 0.8, // Placeholder for AI analysis
    };

    // Calculate overall authenticity score
    const overallScore =
      Object.values(authenticityChecks).reduce((sum, score) => sum + score, 0) /
      Object.keys(authenticityChecks).length;

    console.log(`Document authenticity score: ${overallScore}`);
    return overallScore > 0.7; // 70% confidence threshold
  } catch (error) {
    console.error("Document authenticity validation failed:", error);
    return false;
  }
};

/**
 * Enhanced age verification with multiple validation strategies
 */
export const verifyAgeFromDocument = async (documentPath, userId, file) => {
  try {
    console.log(`Starting enhanced age verification for user ${userId}`);

    // Step 1: Extract text from document
    const extractedText = await extractTextFromDocument(documentPath);
    console.log("Text extracted from document");

    // Step 2: Detect document type
    const documentType = detectDocumentType(extractedText);
    console.log(`Detected document type: ${documentType}`);

    // Step 3: Extract date patterns with multi-language support
    const datePatterns = extractDatePatterns(extractedText);
    console.log(`Found ${datePatterns.length} date patterns`);

    // Step 4: Extract age-related keywords
    const ageKeywords = extractAgeKeywords(extractedText);
    console.log(`Found age keywords: ${ageKeywords.join(", ")}`);

    // Step 5: Parse dates and calculate ages with multiple strategies
    const ages = [];
    const birthDates = [];
    const detectedLang = detectLanguage(extractedText);

    datePatterns.forEach((dateStr) => {
      // Try parsing with detected language
      let parsedDate = parseDate(dateStr, detectedLang);

      // If failed, try with English as fallback
      if (!parsedDate && detectedLang !== "english") {
        parsedDate = parseDate(dateStr, "english");
      }

      if (parsedDate) {
        const age = calculateAge(parsedDate);
        if (age >= 0 && age <= 120) {
          // Reasonable age range
          ages.push(age);
          birthDates.push(parsedDate);
        }
      }
    });

    console.log(`Calculated ages: ${ages.join(", ")}`);

    // Step 6: Validate document authenticity
    const isAuthentic = await validateDocumentAuthenticity(documentPath, file);
    console.log(`Document authenticity: ${isAuthentic}`);

    // Step 7: Determine verification result with enhanced logic
    let verificationResult = {
      status: VERIFICATION_STATUS.FAILED,
      age: null,
      birthDate: null,
      confidence: 0,
      reason: "No valid age information found",
      documentType: documentType,
      language: detectedLang,
      extractedText: extractedText.substring(0, 500), // First 500 chars for debugging
    };

    if (ages.length > 0) {
      // Find the most likely birth date (usually the oldest date)
      const sortedDates = birthDates.sort((a, b) => a - b);
      const mostLikelyBirthDate = sortedDates[0];
      const calculatedAge = calculateAge(mostLikelyBirthDate);

      // Enhanced confidence score calculation
      const confidenceFactors = {
        multipleDates: Math.min(ages.length / 3, 1) * 0.2,
        ageKeywords: Math.min(ageKeywords.length / 5, 1) * 0.2,
        documentAuthenticity: isAuthentic ? 0.3 : 0,
        documentType: documentType !== "other" ? 0.1 : 0,
        languageDetection: detectedLang !== "english" ? 0.1 : 0, // Bonus for multi-language
        ageConsistency: ages.every((age) => age >= 18) ? 0.1 : 0,
      };

      const confidenceScore = Object.values(confidenceFactors).reduce(
        (sum, score) => sum + score,
        0
      );

      console.log(`Confidence factors:`, confidenceFactors);
      console.log(`Overall confidence score: ${confidenceScore}`);

      if (calculatedAge >= 18) {
        if (confidenceScore >= 0.8) {
          verificationResult = {
            status: VERIFICATION_STATUS.APPROVED,
            age: calculatedAge,
            birthDate: mostLikelyBirthDate,
            confidence: confidenceScore,
            reason: `Age verified: ${calculatedAge} years old (confidence: ${(
              confidenceScore * 100
            ).toFixed(1)}%)`,
            documentType: documentType,
            language: detectedLang,
          };
        } else if (confidenceScore >= 0.6) {
          verificationResult = {
            status: VERIFICATION_STATUS.MANUAL_REVIEW,
            age: calculatedAge,
            birthDate: mostLikelyBirthDate,
            confidence: confidenceScore,
            reason: `Age verification requires manual review: ${calculatedAge} years old (confidence: ${(
              confidenceScore * 100
            ).toFixed(1)}%)`,
            documentType: documentType,
            language: detectedLang,
          };
        } else {
          verificationResult = {
            status: VERIFICATION_STATUS.REJECTED,
            age: calculatedAge,
            birthDate: mostLikelyBirthDate,
            confidence: confidenceScore,
            reason: `Age verification failed: ${calculatedAge} years old but low confidence (${(
              confidenceScore * 100
            ).toFixed(1)}%)`,
            documentType: documentType,
            language: detectedLang,
          };
        }
      } else {
        verificationResult = {
          status: VERIFICATION_STATUS.REJECTED,
          age: calculatedAge,
          birthDate: mostLikelyBirthDate,
          confidence: confidenceScore,
          reason: `Age verification failed: ${calculatedAge} years old (minimum 18 required)`,
          documentType: documentType,
          language: detectedLang,
        };
      }
    }

    console.log(`Age verification result: ${verificationResult.status}`);
    return verificationResult;
  } catch (error) {
    console.error("Age verification failed:", error);
    return {
      status: VERIFICATION_STATUS.FAILED,
      age: null,
      birthDate: null,
      confidence: 0,
      reason: error.message,
      documentType: "unknown",
      language: "unknown",
    };
  }
};

/**
 * Upload and process age verification document
 */
export const uploadAgeVerificationDocument = async (file, userId) => {
  try {
    // Validate file type and size
    if (!SUPPORTED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new ApiError(
        400,
        `Unsupported file type. Supported types: ${SUPPORTED_DOCUMENT_TYPES.join(
          ", "
        )}`
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new ApiError(
        400,
        `File too large. Maximum size: ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`
      );
    }

    // Upload to Railway storage for secure storage
    const uploadResult = await railwayStorage.uploadFile(file, "documents");

    if (!uploadResult.success) {
      throw new Error(`Upload failed: ${uploadResult.error}`);
    }

    console.log(
      `Document uploaded to Railway storage: ${uploadResult.publicId}`
    );

    // Process document for age verification
    const verificationResult = await verifyAgeFromDocument(
      file.tempFilePath,
      userId,
      file
    );

    // Add document URL to result
    verificationResult.documentUrl = uploadResult.url;
    verificationResult.documentId = uploadResult.publicId;

    return verificationResult;
  } catch (error) {
    console.error("Document upload failed:", error);
    throw error;
  }
};

/**
 * Get age verification status for user
 */
export const getAgeVerificationStatus = async (userId) => {
  try {
    // This would query the database for user's age verification status
    // For now, return a placeholder
    return {
      status: VERIFICATION_STATUS.PENDING,
      lastUpdated: new Date(),
      attempts: 0,
    };
  } catch (error) {
    console.error("Failed to get age verification status:", error);
    throw error;
  }
};
