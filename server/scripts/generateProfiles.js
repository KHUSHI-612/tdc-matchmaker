const fs = require('fs');
const path = require('path');

const CUSTOMERS_FILE_PATH = path.join(__dirname, '../../client/src/data/customers.json');

// Realistic Indian Matrimonial Datapools
const maleNames = [
  'Rohan', 'Vikram', 'Aditya', 'Siddharth', 'Arjun', 'Rahul', 'Dev', 'Manish', 'Nitin', 'Kunwar',
  'Piyush', 'Rishi', 'Samar', 'Varun', 'Yash', 'Abhishek', 'Gaurav', 'Kartik', 'Pranav', 'Shreyas',
  'Vivek', 'Aman', 'Ishaan', 'Dhruv', 'Sanjay', 'Harsh', 'Mayank', 'Rajesh', 'Alok', 'Sachin',
  'Vijay', 'Amit', 'Sunil', 'Karan', 'Deepak', 'Sandeep', 'Anil', 'Manoj', 'Pankaj', 'Rajiv',
  'Sameer', 'Tarun', 'Anuj', 'Ashish', 'Gopal', 'Madhav', 'Pradeep', 'Srinivas', 'Venkat', 'Hari'
];

const femaleNames = [
  'Neha', 'Riya', 'Pooja', 'Shreya', 'Meera', 'Kriti', 'Divya', 'Kavya', 'Shruti', 'Aisha',
  'Sneha', 'Tanvi', 'Disha', 'Isha', 'Simran', 'Aditi', 'Nikita', 'Nidhi', 'Payal', 'Ritu',
  'Aakanksha', 'Kajal', 'Mansha', 'Preeti', 'Priyanka', 'Sonal', 'Komal', 'Jyoti', 'Kiran', 'Swati',
  'Archana', 'Geeta', 'Lata', 'Madhu', 'Rekha', 'Seema', 'Usha', 'Anita', 'Sunita', 'Anjali',
  'Deepika', 'Kareena', 'Katrina', 'Priyanka', 'Alia', 'Shraddha', 'Sonam', 'Anushka', 'Vidya', 'Rani'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Mehta', 'Shah', 'Iyer', 'Kapoor', 'Malhotra', 'Batra', 'Trivedi',
  'Joshi', 'Patel', 'Reddy', 'Nair', 'Sengupta', 'Chatterjee', 'Banerjee', 'Rao', 'Singh', 'Chawla',
  'Bhasin', 'Oberoi', 'Mishra', 'Pandey', 'Saxena', 'Srivastava', 'Choudhury', 'Sen', 'Grover', 'Johar',
  'Aggarwal', 'Bansal', 'Goel', 'Jindal', 'Garg', 'Singhal', 'Mitthal', 'Guha', 'Roy', 'Dutta',
  'Chaudhary', 'Desai', 'Kulkarni', 'Bhatt', 'Nene', 'Pillai', 'Menon', 'Kurian', 'Mathew', 'Varghese'
];

const companies = [
  'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Reliance Industries', 'Adani Group',
  'HDFC Bank', 'ICICI Bank', 'Tata Motors', 'Ola Cabs', 'Zomato', 'Paytm', 'Swiggy', 'Flipkart',
  'Amazon India', 'Google India', 'Microsoft India', 'Deloitte', 'PwC', 'EY', 'KPMG', 'McKinsey'
];

const designationsMale = [
  'Senior Software Engineer', 'Product Manager', 'Data Scientist', 'Financial Analyst',
  'Investment Banker', 'Business Consultant', 'Operations Manager', 'Marketing Director',
  'System Architect', 'Hardware Engineer', 'Chartered Accountant', 'Corporate Lawyer'
];

const designationsFemale = [
  'Software Developer', 'UX Designer', 'HR Manager', 'Financial Consultant', 'Account Executive',
  'Brand Manager', 'Public Relations Specialist', 'Content Strategist', 'Research Scientist',
  'Chartered Accountant', 'Corporate Counsel', 'Product Designer'
];

const colleges = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'BITS Pilani', 'Delhi University', 'Mumbai University',
  'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'ISB Hyderabad', 'FMS Delhi', 'RV College of Engineering',
  'SRM University', 'VIT Vellore', 'LSR Delhi', 'St. Stephen\'s College', 'Christ University'
];

const degrees = [
  'B.Tech in Computer Science', 'B.Tech in Electronics', 'Dual Degree B.Tech + M.Tech',
  'MBA in Finance', 'MBA in Marketing', 'M.Tech in Data Science', 'B.Com Honors',
  'Chartered Accountant (CA)', 'LL.B / Corporate Law', 'M.Sc in Economics'
];

const religions = ['Hindu', 'Jain', 'Sikh', 'Muslim', 'Christian'];

const castesByReligion = {
  Hindu: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Maratha', 'Rajput'],
  Jain: ['Shah', 'Oswal', 'Porwal', 'Banya'],
  Sikh: ['Jat', 'Khatri', 'Arora', 'Ramgarhia'],
  Muslim: ['Sunni', 'Shia', 'Sayyid', 'Sheikh'],
  Christian: ['Catholic', 'Protestant', 'Syrian Christian']
};

const gotras = ['Bharadwaj', 'Kashyap', 'Vashishta', 'Sandilya', 'Atri', 'Gautam', 'N/A'];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad'];

const diets = ['Vegetarian', 'Jain', 'Non-Vegetarian', 'Eggetarian'];

const languages = [
  ['Hindi', 'English'], ['Gujarati', 'Hindi', 'English'], ['Tamil', 'English'],
  ['Punjabi', 'Hindi', 'English'], ['Marathi', 'Hindi', 'English'], ['Bengali', 'English'],
  ['Telugu', 'English'], ['Kannada', 'English']
];

const generateProfiles = () => {
  let existingCustomers = [];
  try {
    if (fs.existsSync(CUSTOMERS_FILE_PATH)) {
      existingCustomers = JSON.parse(fs.readFileSync(CUSTOMERS_FILE_PATH, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not read existing customers, starting fresh.');
  }

  // Preserve the original 15 assigned clients
  const finalProfiles = [...existingCustomers.slice(0, 15)];
  
  // Find starting ID index
  let idCounter = 16;

  // Generate 100 dummy profiles (50 male, 50 female)
  for (let i = 0; i < 100; i++) {
    const isMale = i % 2 === 0;
    const gender = isMale ? 'Male' : 'Female';
    
    const firstName = isMale 
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${100 + i}@example.com`;
    const phone = `+91 9${Math.floor(Math.random() * 9)}876 ${1000 + i}`;
    
    // Matrimonial distributions
    const age = 24 + Math.floor(Math.random() * 10); // 24 to 33
    const height = isMale 
      ? `5'${7 + Math.floor(Math.random() * 5)}"` // 5'7" to 5'11"
      : `5'${1 + Math.floor(Math.random() * 6)}"`; // 5'1" to 5'6"
      
    const incomeNum = 6 + Math.floor(Math.random() * 30); // 6 to 35 LPA
    const income = `${incomeNum} LPA`;
    
    const company = companies[Math.floor(Math.random() * companies.length)];
    const designation = isMale
      ? designationsMale[Math.floor(Math.random() * designationsMale.length)]
      : designationsFemale[Math.floor(Math.random() * designationsFemale.length)];
      
    const ugCollege = colleges[Math.floor(Math.random() * colleges.length)];
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    
    const religion = religions[Math.floor(Math.random() * religions.length)];
    const castes = castesByReligion[religion];
    const caste = castes[Math.floor(Math.random() * castes.length)];
    
    const gotra = religion === 'Hindu' 
      ? gotras[Math.floor(Math.random() * (gotras.length - 1))] // avoid N/A for Hindus
      : 'N/A';
      
    const manglik = religion === 'Hindu'
      ? ['No', 'Yes', 'Anshik'][Math.floor(Math.random() * 3)]
      : 'No';
      
    const motherTongue = religion === 'Sikh' ? 'Punjabi' :
                         religion === 'Jain' ? 'Gujarati' :
                         ['Hindi', 'Tamil', 'Marathi', 'Bengali', 'Telugu', 'Kannada'][Math.floor(Math.random() * 6)];
                         
    const diet = religion === 'Jain' ? 'Jain' : diets[Math.floor(Math.random() * diets.length)];
    const drinking = ['Never', 'Never', 'Socially'][Math.floor(Math.random() * 3)];
    const smoking = ['Never', 'Never', 'Never', 'Occasional'][Math.floor(Math.random() * 4)];
    
    const city = cities[Math.floor(Math.random() * cities.length)];
    const siblings = Math.floor(Math.random() * 3);
    const languagesKnown = languages[Math.floor(Math.random() * languages.length)];
    
    const partnerAgeMin = age - 3;
    const partnerAgeMax = age + 4;
    
    const wantKids = ['Yes', 'Yes', 'Maybe'][Math.floor(Math.random() * 3)];
    const openToRelocate = ['Yes', 'No', 'Maybe'][Math.floor(Math.random() * 3)];
    const openToPets = ['Yes', 'No', 'Maybe'][Math.floor(Math.random() * 3)];

    const noteOptions = [
      "Seeking a well-educated partner with progressive values.",
      "Family-oriented person, seeks someone focused on career development.",
      "Prefers candidates based in metro cities who align on lifestyle values.",
      "Looking for a partner who shares similar dietary and habit configurations.",
      "Open to relocation for the right candidate. Mutual understanding is key."
    ];
    const notes = noteOptions[Math.floor(Math.random() * noteOptions.length)];

    finalProfiles.push({
      id: `c${idCounter++}`,
      firstName,
      lastName,
      gender,
      dateOfBirth: `${1993 + Math.floor(Math.random() * 9)}-05-15`,
      age,
      country: 'India',
      city,
      height,
      email,
      phone,
      ugCollege,
      degree,
      income,
      company,
      designation,
      maritalStatus: 'Never Married',
      languagesKnown,
      siblings,
      caste,
      religion,
      gotra,
      manglik,
      motherTongue,
      familyType: ['Nuclear', 'Joint'][Math.floor(Math.random() * 2)],
      diet,
      drinking,
      smoking,
      wantKids,
      openToRelocate,
      openToPets,
      horoscopeMatch: ['Required', 'Not Important'][Math.floor(Math.random() * 2)],
      partnerAgeMin,
      partnerAgeMax,
      status: 'Active',
      journeyStage: 1,
      assignedMatchmakerId: 'unassigned', // Unassigned pool profiles
      notes
    });
  }

  // Ensure directories exist
  const dataDir = path.dirname(CUSTOMERS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(finalProfiles, null, 2), 'utf8');
  console.log(`Successfully generated ${idCounter - 16} dummy profiles and wrote 115 total profiles to customers.json!`);
};

generateProfiles();
