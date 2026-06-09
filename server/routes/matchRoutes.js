const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');

// Define path to the customers JSON file in the client source folder
const CUSTOMERS_FILE_PATH = path.join(__dirname, '../../client/src/data/customers.json');

/**
 * Helper to read customers from the JSON database file
 */
const readCustomers = () => {
  try {
    const rawData = fs.readFileSync(CUSTOMERS_FILE_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading customers.json file:', error);
    return [];
  }
};

/**
 * Helper to write customers back to the JSON database file
 */
const writeCustomers = (data) => {
  try {
    fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to customers.json file:', error);
    return false;
  }
};

/**
 * Fallback Match Pitch Generator (Rule-based)
 * Used if Claude API is missing, placeholder, or calls fail.
 */
const generateFallbackPitch = (customer, candidate, score) => {
  const isCustMale = customer.gender === 'Male';
  const groom = isCustMale ? customer : candidate;
  const bride = isCustMale ? candidate : customer;

  return `### Matrimonial Compatibility Analysis
*TDC Elite Matchmaker Engine (Local Rule-based Fallback)*

We have analyzed the profiles of **${customer.firstName} ${customer.lastName}** (${customer.age}, ${customer.gender}) and **${candidate.firstName} ${candidate.lastName}** (${candidate.age}, ${candidate.gender}) and calculated a matching compatibility score of **${score}%**. Below is a detailed, personalized breakdown to pitch this match.

---

#### 1. Career Synergy & Intellectual Alignment
- **Groom\'s Background:** ${groom.firstName} is a **${groom.designation}** at **${groom.company}** (earning ${groom.income}) with a background in **${groom.degree}**.
- **Bride\'s Background:** ${bride.firstName} is a **${bride.designation}** at **${bride.company}** (earning ${bride.income}) with a background in **${bride.degree}**.
- **Compatibility Note:** There is an excellent intellectual match here. Groom\'s career stability and Bride\'s professional background align with the standards of both families. They share a similar professional wavelength, which is ideal for a modern dual-career household.

#### 2. Lifestyle, Diet & Habits
- **Dietary Integration:** ${groom.firstName} follows a **${groom.diet}** diet, while ${bride.firstName} follows a **${bride.diet}** diet. ${groom.diet === bride.diet ? `They are an exact match, ensuring full comfort for cooking and daily life.` : `Their diets are compatible and easily integrated within standard households.`}
- **Personal Habits:** Both candidates align on smoking and drinking expectations (${groom.drinking === 'Never' && bride.drinking === 'Never' ? 'both prefer non-drinkers' : 'compatible social lifestyles'}), creating a clean foundation for their home environment.

#### 3. Gotra & Cultural Demographics
- **Gotra check:** Groom gotra is **${groom.gotra}** and Bride gotra is **${bride.gotra}**. ${customer.religion === 'Hindu' && groom.gotra === bride.gotra && groom.gotra !== 'N/A' ? '⚠️ WARNING: Same Gotra detected. Traditional weddings might require gotra exemption ceremonies.' : 'Gotras are safe and compatible, with no traditional gotra-avoidance conflicts.'}
- **Manglik Status:** Groom is **${groom.manglik === 'Yes' ? 'Manglik' : 'Non-Manglik'}** and Bride is **${bride.manglik === 'Yes' ? 'Manglik' : 'Non-Manglik'}**. This fits standard astrological matching preferences.

#### 4. Relocation & Location Matching
- **Geography:** ${customer.city.toLowerCase() === candidate.city.toLowerCase() ? `Both reside in **${customer.city}**, which eliminates relocation friction and simplifies immediate family interactions.` : `Groom is in **${groom.city}** and Bride is in **${bride.city}**. Since ${customer.gender === 'Female' ? 'relocation flexibility is high' : 'relocation preferences are matching'}, coordinating meetings will be feasible.`}

---

#### 💡 Matchmaker Strategic Advice (How to Pitch)
1. **When speaking to ${customer.firstName}\'s family:** Emphasize ${candidate.firstName}\'s career focus and shared lifestyle choices (${candidate.diet} diet, habits). This shows a respectful and compatible environment.
2. **Key selling point:** Highlight that both are highly focused on career growth and went to premier educational institutions (${groom.ugCollege} and ${bride.ugCollege}), creating a strong intellectual bridge.
3. **Suggested Next Steps:** Recommend sharing their biodata and horoscopes. Suggest a brief, informal video call between the candidates to break the ice before involving the wider families.`;
};

/**
 * Route: GET /api/customers
 * Fetch all customers
 */
router.get('/customers', (req, res) => {
  const customers = readCustomers();
  res.status(200).json(customers);
});

/**
 * Route: GET /api/customers/:id
 * Fetch a single customer by ID
 */
router.get('/customers/:id', (req, res) => {
  const { id } = req.params;
  const customers = readCustomers();
  const customer = customers.find(c => c.id === id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  res.status(200).json(customer);
});

/**
 * Route: PUT /api/customers/:id
 * Update customer notes and journey stage
 */
router.put('/customers/:id', (req, res) => {
  const { id } = req.params;
  const { journeyStage, notes } = req.body;
  
  const customers = readCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  // Update fields if provided
  if (journeyStage !== undefined) {
    customers[index].journeyStage = parseInt(journeyStage, 10);
  }
  
  if (notes !== undefined) {
    customers[index].notes = notes;
  }
  
  const success = writeCustomers(customers);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update customer data' });
  }
  
  res.status(200).json(customers[index]);
});

/**
 * Route: POST /api/score-match
 * Generates AI matchmaking pitch for two customer profiles
 */
router.post('/score-match', async (req, res) => {
  const { customer, candidate, score } = req.body;
  
  if (!customer || !candidate) {
    return res.status(400).json({ error: 'Missing customer or candidate profile' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isApiKeyPlaceholder = !apiKey || apiKey === 'your_anthropic_api_key_here';

  // Fallback to local rule-based pitch if API key is missing or is the default template placeholder
  if (isApiKeyPlaceholder) {
    console.log('Anthropic API key is placeholder or missing. Generating rule-based pitch locally.');
    const pitch = generateFallbackPitch(customer, candidate, score);
    return res.status(200).json({ pitch, source: 'local_fallback' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const prompt = `
You are a senior matrimonial matchmaker at TDC (The Divine Connection), a premium Indian matchmaking service.
You need to write a highly personalized, emotionally warm, and persuasive match introduction pitch. This pitch will be read by human matchmaker Priya Sharma when presenting a candidate to a client's family.

Client Profile (Customer):
- Name: ${customer.firstName} ${customer.lastName}
- Gender: ${customer.gender}
- Age: ${customer.age} years
- City: ${customer.city}
- Profession: ${customer.designation} at ${customer.company} (Income: ${customer.income})
- Education: ${customer.degree} (${customer.ugCollege})
- Caste/Religion: ${customer.caste} (${customer.religion})
- Gotra: ${customer.gotra} | Manglik Status: ${customer.manglik}
- Diet: ${customer.diet}
- Habits: Smoking: ${customer.smoking} | Drinking: ${customer.drinking}
- Special Notes: ${customer.notes}

Suggested Match Profile (Candidate):
- Name: ${candidate.firstName} ${candidate.lastName}
- Gender: ${candidate.gender}
- Age: ${candidate.age} years
- City: ${candidate.city}
- Profession: ${candidate.designation} at ${candidate.company} (Income: ${candidate.income})
- Education: ${candidate.degree} (${candidate.ugCollege})
- Caste/Religion: ${candidate.caste} (${candidate.religion})
- Gotra: ${candidate.gotra} | Manglik Status: ${candidate.manglik}
- Diet: ${candidate.diet}
- Habits: Smoking: ${candidate.smoking} | Drinking: ${candidate.drinking}
- Special Notes: ${candidate.notes}

Calculated Match Compatibility Score: ${score}%

Write a comprehensive matchmaking proposal pitch structured into the following sections in Markdown:
1. **Matching Highlights**: Analyze their career synergies, educational prestige, lifestyle/dietary choices, and geographic compatibility. Mention specific details (like income, college, diet) and write why they connect well.
2. **Astrological & Values Fit**: Check their gotra compatibility (avoiding same gotra for Hindus, else safety check) and manglik compatibility.
3. **Strategic Pitching Advice**: Actionable advice for the matchmaker on how to introduce this profile (e.g. what selling points to highlight first to the parents or candidate).
4. **Suggested Icebreaker**: A recommendation on how the candidates should connect first (casual coffee, online call, etc.).

Keep the tone polished, warm, respectful, and highly professional. Return only the pitch formatted in Markdown.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      system: 'You are an elite matrimonial matchmaker at TDC. Write a warm, persuasive, and professional pitch that human matchmaker Priya Sharma can use to introduce a match to a client or family. Write in formatted markdown, focusing on details like diet compatibility, educational pedigree, career synergy, and Gotra alignment.',
      messages: [{ role: 'user', content: prompt }]
    });

    const pitch = response.content[0].text;
    res.status(200).json({ pitch, source: 'claude_api' });
  } catch (error) {
    console.error('Anthropic API call failed, reverting to fallback pitch:', error.message);
    const pitch = generateFallbackPitch(customer, candidate, score);
    res.status(200).json({ pitch, source: 'local_fallback_on_error', error: error.message });
  }
});

module.exports = router;
