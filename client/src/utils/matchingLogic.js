/**
 * TDC MATCHMAKING ENGINE — UTILS
 * Comprehensive matching logic combining gender-specific rules and traditional matrimonial criteria (Religion, Caste, Gotra, Manglik)
 */

/**
 * Parses height string (e.g. "5'11\"" or "5'4\"") into total inches.
 * @param {string} heightStr 
 * @returns {number} Height in inches
 */
export const parseHeightInInches = (heightStr) => {
  if (!heightStr) return 0;
  const match = heightStr.match(/(\d+)\s*'\s*(\d+)?/);
  if (!match) return 0;
  const feet = parseInt(match[1], 10);
  const inches = match[2] ? parseInt(match[2], 10) : 0;
  return feet * 12 + inches;
};

/**
 * Parses income string (e.g. "32 LPA") into numeric value.
 * @param {string} incomeStr 
 * @returns {number} Income in LPA (Lakhs Per Annum)
 */
export const parseIncomeLPA = (incomeStr) => {
  if (!incomeStr) return 0;
  const match = incomeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

/**
 * Calculates a matching compatibility score between a customer and a candidate.
 * Returns a score out of 100 and a detailed breakdown of compatibilities.
 * 
 * @param {object} customer The active customer (profile being matched)
 * @param {object} candidate The potential match candidate
 * @returns {object} { score, breakdown }
 */
export const calculateCompatibility = (customer, candidate) => {
  // 1. Gender check: Matrimonial matches must be opposite gender
  if (customer.gender === candidate.gender) {
    return {
      score: 0,
      breakdown: {
        gender: { score: 0, max: 100, label: "Gender mismatch", desc: "Same-gender candidates are filtered out" }
      }
    };
  }

  // 2. Score computation based on customer gender
  if (customer.gender === 'Male') {
    return calculateMaleCustomerMatching(customer, candidate);
  } else {
    return calculateFemaleCustomerMatching(customer, candidate);
  }
};

/**
 * MATCHING LOGIC FOR MALE CUSTOMERS (SEEKING FEMALE CANDIDATES)
 * Combines gender-specific rules (younger, earns less, shorter, views on kids) with
 * traditional matrimonial criteria (religion, caste, gotra avoidance, manglik status).
 */
const calculateMaleCustomerMatching = (customer, candidate) => {
  const breakdown = {};
  
  // ==========================================
  // PART I: GENDER-SPECIFIC CRITERIA (60 PTS)
  // ==========================================

  // A. Age compatibility (Candidate must be younger)
  const isYounger = candidate.age < customer.age;
  const ageScore = isYounger ? 15 : 0;
  breakdown.age = {
    score: ageScore,
    max: 15,
    label: "Age Match",
    desc: isYounger 
      ? `Candidate is younger (${candidate.age} vs ${customer.age} yrs)` 
      : `Candidate is older or same age (${candidate.age} vs ${customer.age} yrs)`
  };

  // B. Income compatibility (Candidate must earn less)
  const customerInc = parseIncomeLPA(customer.income);
  const candidateInc = parseIncomeLPA(candidate.income);
  const earnsLess = candidateInc < customerInc;
  const incomeScore = earnsLess ? 15 : 0;
  breakdown.income = {
    score: incomeScore,
    max: 15,
    label: "Income Alignment",
    desc: earnsLess 
      ? `Candidate earns less (${candidateInc} LPA vs ${customerInc} LPA)` 
      : `Candidate earns more or equal (${candidateInc} LPA vs ${customerInc} LPA)`
  };

  // C. Height compatibility (Candidate must be shorter)
  const customerH = parseHeightInInches(customer.height);
  const candidateH = parseHeightInInches(candidate.height);
  const isShorter = candidateH < customerH;
  const heightScore = isShorter ? 15 : 0;
  breakdown.height = {
    score: heightScore,
    max: 15,
    label: "Height Alignment",
    desc: isShorter 
      ? `Candidate is shorter (${candidate.height} vs ${customer.height})` 
      : `Candidate is taller or equal (${candidate.height} vs ${customer.height})`
  };

  // D. Views on kids (Must match)
  const matchesKids = candidate.wantKids === customer.wantKids;
  const kidsScore = matchesKids ? 15 : 0;
  breakdown.children = {
    score: kidsScore,
    max: 15,
    label: "Family Planning",
    desc: matchesKids 
      ? `Matching views on children (${customer.wantKids})` 
      : `Mismatched views on children (${customer.wantKids} vs ${candidate.wantKids})`
  };

  // ==========================================
  // PART II: MATRIMONIAL & ASTRO CRITERIA (40 PTS)
  // ==========================================

  // E. Religion Compatibility (10 Points)
  const religionMatch = customer.religion === candidate.religion;
  const religionScore = religionMatch ? 10 : 0;
  breakdown.religion = {
    score: religionScore,
    max: 10,
    label: "Religion Match",
    desc: religionMatch
      ? `Same religion (${customer.religion})`
      : `Mismatched religion (${customer.religion} vs ${candidate.religion})`
  };

  // F. Caste Compatibility (10 Points)
  const casteMatch = customer.caste === candidate.caste;
  const casteScore = casteMatch ? 10 : 0;
  breakdown.caste = {
    score: casteScore,
    max: 10,
    label: "Caste Alignment",
    desc: casteMatch
      ? `Same caste (${customer.caste})`
      : `Different caste (${customer.caste} vs ${candidate.caste})`
  };

  // G. Manglik Astrological Status Match (10 Points)
  // Traditional rule: Manglik matches Manglik/Anshik; Non-Manglik matches Non-Manglik
  let manglikScore = 0;
  let manglikDesc = "";
  const custManglik = customer.manglik === 'Yes' || customer.manglik === 'Anshik';
  const candManglik = candidate.manglik === 'Yes' || candidate.manglik === 'Anshik';

  if (custManglik === candManglik) {
    manglikScore = 10;
    manglikDesc = `Astrologically compatible (${customer.manglik} vs ${candidate.manglik})`;
  } else {
    manglikScore = 3;
    manglikDesc = `Astrological discrepancy (${customer.manglik} vs ${candidate.manglik})`;
  }
  breakdown.manglik = {
    score: manglikScore,
    max: 10,
    label: "Manglik Match",
    desc: manglikDesc
  };

  // H. Gotra Avoidance (5 Points)
  // Traditional Hindu weddings forbid marriages within the same Gotra
  let gotraScore = 5;
  let gotraDesc = "Compatible gotras";
  let gotraPenalty = 0;

  if (customer.religion === 'Hindu' && customer.gotra && candidate.gotra && customer.gotra !== 'N/A' && candidate.gotra !== 'N/A') {
    if (customer.gotra.toLowerCase() === candidate.gotra.toLowerCase()) {
      gotraScore = 0;
      gotraPenalty = 15; // Gotra conflict warning deducts points from the overall score
      gotraDesc = `⚠️ Same Gotra Conflict (${customer.gotra})`;
    } else {
      gotraDesc = `Safe gotras (${customer.gotra} vs ${candidate.gotra})`;
    }
  } else {
    gotraDesc = "Gotra check not applicable";
  }
  breakdown.gotra = {
    score: gotraScore,
    max: 5,
    label: "Gotra Avoidance",
    desc: gotraDesc
  };

  // I. Language Compatibility (5 Points)
  let languageScore = 0;
  let languageDesc = "";
  const hasSameMotherTongue = customer.motherTongue && candidate.motherTongue && 
    customer.motherTongue.toLowerCase() === candidate.motherTongue.toLowerCase();

  const mutualLanguages = (customer.languagesKnown || []).filter(lang => 
    (candidate.languagesKnown || []).some(cl => cl.toLowerCase() === lang.toLowerCase())
  );

  if (hasSameMotherTongue) {
    languageScore = 5;
    languageDesc = `Same mother tongue (${customer.motherTongue})`;
  } else if (mutualLanguages.length > 0) {
    languageScore = 3;
    languageDesc = `Shared languages: ${mutualLanguages.join(', ')}`;
  } else {
    languageScore = 0;
    languageDesc = "No shared languages known";
  }

  breakdown.language = {
    score: languageScore,
    max: 5,
    label: "Language Match",
    desc: languageDesc
  };

  // Sum raw values
  let totalScore = ageScore + incomeScore + heightScore + kidsScore + religionScore + casteScore + manglikScore + gotraScore + languageScore;
  
  // Apply Gotra avoidance penalty if exists
  totalScore = Math.max(0, totalScore - gotraPenalty);

  return {
    score: totalScore,
    breakdown
  };
};

/**
 * MATCHING LOGIC FOR FEMALE CUSTOMERS (SEEKING MALE CANDIDATES)
 * Rules: professional stability, lifestyle values, relocation, demographics, religion, caste, gotra, and manglik.
 */
const calculateFemaleCustomerMatching = (customer, candidate) => {
  const breakdown = {};
  
  // A. Profession & Career Alignment (25 Points)
  const customerInc = parseIncomeLPA(customer.income);
  const candidateInc = parseIncomeLPA(candidate.income);
  
  let professionScore = 0;
  let professionDesc = "";

  if (candidateInc >= customerInc) {
    professionScore += 15;
  }
  
  const techKeywords = ['tech', 'software', 'engineer', 'developer', 'iit', 'bits'];
  const bizKeywords = ['mba', 'finance', 'consult', 'business', 'exports', 'partner', 'analyst'];
  
  const customerFields = (customer.degree + " " + customer.designation).toLowerCase();
  const candidateFields = (candidate.degree + " " + candidate.designation).toLowerCase();

  const isCustTech = techKeywords.some(kw => customerFields.includes(kw));
  const isCustBiz = bizKeywords.some(kw => customerFields.includes(kw));
  
  const isCandTech = techKeywords.some(kw => candidateFields.includes(kw));
  const isCandBiz = bizKeywords.some(kw => candidateFields.includes(kw));

  const careerMatch = (isCustTech && isCandTech) || (isCustBiz && isCandBiz);

  if (careerMatch) {
    professionScore += 10;
    professionDesc = `Aligned careers and strong financial stability (${candidateInc} LPA vs ${customerInc} LPA)`;
  } else if (candidateInc >= customerInc) {
    professionDesc = `Strong financial stability (${candidateInc} LPA vs ${customerInc} LPA)`;
  } else {
    professionScore += 5;
    professionDesc = `Different career fields and lower candidate income (${candidateInc} LPA vs ${customerInc} LPA)`;
  }

  breakdown.profession = {
    score: professionScore,
    max: 25,
    label: "Career & Profession",
    desc: professionDesc
  };

  // B. Lifestyle & Values Compatibility (25 Points)
  // Combines Diet, Habits, Religion, Caste, and Language matches
  let valuesScore = 0;
  const valuesDescArr = [];

  // 1. Diet (8 pts)
  if (customer.diet === candidate.diet) {
    valuesScore += 8;
    valuesDescArr.push(`Diet Match (${customer.diet})`);
  } else if (customer.diet === 'Vegetarian' && candidate.diet === 'Jain') {
    valuesScore += 6;
    valuesDescArr.push("Veg/Jain Compatible");
  } else if (customer.diet === 'Non-Vegetarian' && candidate.diet === 'Vegetarian') {
    valuesScore += 4;
    valuesDescArr.push("Veg Candidate fits");
  } else {
    valuesDescArr.push("Mismatched Diet");
  }

  // 2. Habits (4 pts)
  if (customer.smoking === candidate.smoking && customer.drinking === candidate.drinking) {
    valuesScore += 4;
    valuesDescArr.push("Habits Aligned");
  } else if (candidate.smoking === 'Never' && candidate.drinking === 'Never') {
    valuesScore += 3;
    valuesDescArr.push("Candidate habits fit");
  } else {
    valuesScore += 1;
    valuesDescArr.push("Mismatched Habits");
  }

  // 3. Religion (5 pts)
  if (customer.religion === candidate.religion) {
    valuesScore += 5;
    valuesDescArr.push(`Religion Match (${customer.religion})`);
  } else {
    valuesDescArr.push("Different Religion");
  }

  // 4. Caste (5 pts)
  if (customer.caste === candidate.caste) {
    valuesScore += 5;
    valuesDescArr.push(`Caste Match (${customer.caste})`);
  } else {
    valuesDescArr.push("Different Caste");
  }

  // 5. Language (3 pts)
  let languageValScore = 0;
  const hasSameMotherTongueFem = customer.motherTongue && candidate.motherTongue && 
    customer.motherTongue.toLowerCase() === candidate.motherTongue.toLowerCase();

  const mutualLanguagesFem = (customer.languagesKnown || []).filter(lang => 
    (candidate.languagesKnown || []).some(cl => cl.toLowerCase() === lang.toLowerCase())
  );

  if (hasSameMotherTongueFem) {
    languageValScore = 3;
    valuesDescArr.push(`Same mother tongue (${customer.motherTongue})`);
  } else if (mutualLanguagesFem.length > 0) {
    languageValScore = 2;
    valuesDescArr.push(`Shares ${mutualLanguagesFem.join(', ')}`);
  } else {
    valuesDescArr.push("No common languages");
  }
  valuesScore += languageValScore;

  breakdown.values = {
    score: valuesScore,
    max: 25,
    label: "Lifestyle & Values",
    desc: valuesDescArr.join(" · ")
  };

  // C. Relocation Preferences (25 Points)
  let relocationScore = 0;
  let relocationDesc = "";

  if (customer.city.toLowerCase() === candidate.city.toLowerCase()) {
    relocationScore = 25;
    relocationDesc = `Both are located in the same city (${customer.city})`;
  } else {
    const custReloc = customer.openToRelocate === 'Yes' || customer.openToRelocate === 'Maybe';
    const candReloc = candidate.openToRelocate === 'Yes';
    
    if (custReloc && candReloc) {
      relocationScore = 20;
      relocationDesc = `Different cities (${customer.city} vs ${candidate.city}), but both open to relocate`;
    } else if (candReloc) {
      relocationScore = 15;
      relocationDesc = `Different cities, candidate is open to relocate`;
    } else if (custReloc) {
      relocationScore = 10;
      relocationDesc = `Different cities, customer is open to relocate`;
    } else {
      relocationScore = 2;
      relocationDesc = `Different cities and relocation is unlikely`;
    }
  }

  breakdown.relocation = {
    score: relocationScore,
    max: 25,
    label: "Location & Relocation",
    desc: relocationDesc
  };

  // D. Demographics & Astrology (25 Points)
  // Combines Age Gap, Height, Gotra Avoidance, and Manglik Status matches
  const customerH = parseHeightInInches(customer.height);
  const candidateH = parseHeightInInches(candidate.height);
  
  let demoScore = 0;
  const demoDescArr = [];
  let gotraPenalty = 0;

  // 1. Age (10 pts)
  const ageDiff = candidate.age - customer.age;
  if (ageDiff >= 0 && ageDiff <= 5) {
    demoScore += 10;
    demoDescArr.push(`Excellent age gap (+${ageDiff} yrs)`);
  } else if (ageDiff > 5 && ageDiff <= 8) {
    demoScore += 7;
    demoDescArr.push(`Slightly larger age gap (+${ageDiff} yrs)`);
  } else {
    demoDescArr.push(`Uncommon age gap (+${ageDiff} yrs)`);
  }

  // 2. Height (5 pts)
  if (candidateH > customerH) {
    demoScore += 5;
    demoDescArr.push(`Candidate is taller`);
  } else {
    demoDescArr.push(`Candidate is shorter/equal`);
  }

  // 3. Manglik Alignment (5 pts)
  const custManglik = customer.manglik === 'Yes' || customer.manglik === 'Anshik';
  const candManglik = candidate.manglik === 'Yes' || candidate.manglik === 'Anshik';
  if (custManglik === candManglik) {
    demoScore += 5;
    demoDescArr.push(`Manglik compatible`);
  } else {
    demoScore += 1;
    demoDescArr.push(`Manglik mismatched`);
  }

  // 4. Gotra Avoidance (5 pts)
  if (customer.religion === 'Hindu' && customer.gotra && candidate.gotra && customer.gotra !== 'N/A' && candidate.gotra !== 'N/A') {
    if (customer.gotra.toLowerCase() === candidate.gotra.toLowerCase()) {
      gotraPenalty = 15; // Gotra avoidance violation penalty
      demoDescArr.push(`⚠️ Gotra Conflict (${customer.gotra})`);
    } else {
      demoScore += 5;
      demoDescArr.push(`Safe gotras`);
    }
  } else {
    demoScore += 5;
    demoDescArr.push(`Gotra safe`);
  }

  breakdown.demographics = {
    score: demoScore,
    max: 25,
    label: "Astro & Demographics",
    desc: demoDescArr.join(" · ")
  };

  let totalScore = breakdown.profession.score + breakdown.values.score + breakdown.relocation.score + breakdown.demographics.score;
  
  // Apply gotra penalty
  totalScore = Math.max(0, totalScore - gotraPenalty);

  return {
    score: totalScore,
    breakdown
  };
};
