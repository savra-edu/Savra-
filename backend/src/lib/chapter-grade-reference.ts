/**
 * Grade-wise chapter mapping per subject (CBSE/NCERT reference).
 * Used by seed to create grade-specific chapters.
 *
 * Keys: subject code (matches Subject.code)
 * Values: Record<grade, chapter names[]>
 *
 * For grades 9–10: SCI = unified Science (Physics+Chemistry+Biology), SOCSCI = unified Social Science (History+Geography).
 */
export const CHAPTER_GRADE_REFERENCE: Record<string, Record<number, string[]>> = {
  ENG: {
    6: ["Who Did Patrick's Homework?", "How the Dog Found Himself a New Master!", "Taro's Reward", "An Indian-American Woman in Space: Kalpana Chawla", "A Different Kind of School", "Who I Am", "Fair Play", "A Game of Chance", "Desert Animals", "The Banyan Tree", "A Pact with the Sun", "The Friendly Mongoose", "The Shepherd's Treasure", "The Old-Clock Shop", "Tansen", "The Monkey and the Crocodile", "The Wonder Called Sleep", "A Pact with the Sun"],
    7: ["Three Questions", "A Gift of Chappals", "Gopal and the Hilsa Fish", "The Ashes That Made Trees Bloom", "Quality", "Expert Detectives", "The Invention of Vita-Wonk", "Fire: Friend and Foe", "A Homage to our Brave Soldiers", "The Tiny Teacher", "Bringing up Kari", "Golu Grows a Nose", "Chandni", "The Bear Story", "A Tiger in the House", "An Alien Hand"],
    8: ["The Best Christmas Present in the World", "The Tsunami", "Glimpses of the Past", "Bepin Choudhury's Lapse of Memory", "The Summit Within", "This is Jody's Fawn", "A Visit to Cambridge", "A Short Monsoon Diary", "The Great Stone Face", "How the Camel got his hump", "Children at work", "The Selfish Giant", "The Treasure within", "Princess September", "The Fight", "Jalebis", "Ancient Education System of India"],
    9: ["The Fun They Had", "The Sound of Music", "The Little Girl", "A Truly Beautiful Mind", "The Snake and the Mirror", "My Childhood", "Packing", "Reach for the Top", "The Bond of Love", "Kathmandu", "If I Were You", "The Lost Child", "The Adventures of Toto", "Iswaran the Storyteller", "In the Kingdom of Fools", "The Happy Prince", "Weathering the Storm in Ersama", "The Last Leaf", "A House Is Not a Home", "The Accidental Tourist", "The Beggar"],
    10: ["A Letter to God", "Nelson Mandela: Long Walk to Freedom", "Two Stories about Flying", "From the Diary of Anne Frank", "Glimpses of India", "Mijbil the Otter", "Madam Rides the Bus", "The Sermon at Benares", "The Proposal", "A Triumph of Surgery", "The Thief's Story", "The Midnight Visitor", "A Question of Trust", "Footprints Without Feet", "The Making of a Scientist", "The Necklace", "Bholi", "The Book That Saved the Earth"],
    11: ["The Portrait of a Lady", "We're Not Afraid to Die… if We Can All Be Together", "Discovering Tut: The Saga Continues", "Landscape of the Soul", "The Ailing Planet: The Green Movement's Role", "The Browning Version", "The Adventure", "Silk Road", "The Summer of the Beautiful White Horse", "The Address", "Ranga's Marriage", "Albert Einstein at School", "Mother's Day", "The Ghat of the Only World", "Birth", "The Tale of Melon City"],
    12: ["The Last Lesson", "Lost Spring", "Deep Water", "The Rattrap", "Indigo", "Poets and Pancakes", "The Interview", "Going Places", "My Mother at Sixty-Six", "Keeping Quiet", "A Thing of Beauty", "A Roadside Stand", "Aunt Jennifer's Tigers", "The Third Level", "The Tiger King", "Journey to the End of the Earth", "The Enemy", "On the Face of It", "Memories of Childhood", "The Cutting of My Long Hair", "We Too Are Human Beings"],
  },
  MATH: {
    6: ["Knowing Our Numbers", "Whole Numbers", "Playing with Numbers", "Basic Geometrical Ideas", "Understanding Elementary Shapes", "Integers", "Fractions", "Decimals", "Data Handling", "Mensuration", "Algebra", "Ratio and Proportion"],
    7: ["Integers", "Fractions and Decimals", "Data Handling", "Simple Equations", "Lines and Angles", "The Triangle and its Properties", "Comparing Quantities", "Rational Numbers", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers", "Symmetry", "Visualising Solid Shapes"],
    8: ["Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Practical Geometry", "Algebraic Expressions and Identities", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Squares and Square Roots", "Cubes and Cube Roots", "Comparing Quantities", "Mensuration", "Data Handling", "Visualising Solid Shapes", "Introduction to Graphs", "Playing with Numbers"],
    9: ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
    10: ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Applications of Trigonometry", "Circles", "Constructions", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"],
    11: ["Sets", "Relations and Functions", "Trigonometric Functions", "Principle of Mathematical Induction", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Mathematical Reasoning", "Statistics", "Probability"],
    12: ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Application of Derivatives", "Integrals", "Application of Integrals", "Differential Equations", "Vector Algebra", "Three-Dimensional Geometry", "Linear Programming", "Probability"],
  },
  SCI: {
    6: ["Components of Food", "Sorting Materials into Groups", "Separation of Substances", "Getting to Know Plants", "Body Movements", "The Living Organisms — Characteristics and Habitats", "Motion and Measurement of Distances", "Light, Shadows and Reflections", "Electricity and Circuits", "Fun with Magnets", "Air Around Us"],
    7: ["Nutrition in Plants", "Nutrition in Animals", "Heat", "Acids, Bases and Salts", "Physical and Chemical Changes", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and its Effects", "Light", "Forests: Our Lifeline", "Wastewater Story"],
    8: ["Crop Production and Management", "Microorganisms: Friend and Foe", "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals", "Cell — Structure and Functions", "Reproduction in Animals", "Reaching the Age of Adolescence", "Force and Pressure", "Friction", "Sound", "Chemical Effects of Electric Current", "Some Natural Phenomena", "Light", "Stars and The Solar System"],
    9: ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom", "The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources"],
    10: ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Light – Reflection and Refraction", "The Human Eye and the Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy", "Our Environment", "Management of Natural Resources"],
  },
  SOCSCI: {
    6: ["What, Where, How and When?", "From Hunting-Gathering to Growing Food", "In the Earliest Cities", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas", "Ashoka, The Emperor Who Gave Up War", "The Earth in the Solar System", "Globe: Latitudes and Longitudes", "Motions of the Earth", "Maps", "Major Domains of the Earth", "Understanding Diversity", "What is Government?", "Panchayati Raj", "Rural Administration"],
    7: ["Tracing Changes Through a Thousand Years", "New Kings and Kingdoms", "The Delhi Sultans", "The Mughal Empire", "Tribes, Nomads and Settled Communities", "Environment", "Inside Our Earth", "Our Changing Earth", "Air", "Water", "Human Environment Interactions", "On Equality", "Role of the Government in Health", "How the State Government Works", "Women Change the World"],
    8: ["How, When and Where", "From Trade to Territory", "Ruling the Countryside", "When People Rebel", "Civilising the Native, Educating the Nation", "Women, Caste and Reform", "The Making of the National Movement: 1870s-1947", "Resources", "Land, Soil, Water, Natural Vegetation and Wildlife Resources", "Agriculture", "Industries", "Human Resources", "The Indian Constitution", "Understanding Secularism", "Why do we need a Parliament?", "Judiciary", "Public Facilities"],
    9: ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World", "India – Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population"],
    10: ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World", "Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of National Economy"],
  },
  HINDI: {
    6: ["वह चिड़िया जो", "बचपन", "नादान दोस्त", "चाँद से थोड़ी सी गप्पें", "अक्षरों का महत्व", "पार नज़र के", "साथी हाथ बढ़ाना", "ऐसे-ऐसे", "टिकट अलबम", "झाँसी की रानी"],
    7: ["हम पंछी उन्मुक्त गगन के", "दादी माँ", "हिमालय की बेटियाँ", "कठपुतली", "मिठाईवाला", "रक्त और हमारा शरीर", "पापा खो गए", "शाम एक किसान", "चिड़िया की बच्ची", "अपूर्व अनुभव"],
    8: ["ध्वनि", "लाख की चूड़ियाँ", "बस की यात्रा", "दीवानों की हस्ती", "चिट्टियों की अनूठी दुनिया", "भगवान के डाकिए", "क्या निराश हुआ जाए", "यह सबसे कठिन समय नहीं", "कबीर की साखियाँ", "कामचोर"],
  },
  CHEM: {
    9: ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom"],
    10: ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"],
    11: ["Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements and Periodicity", "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "s-Block Elements", "p-Block Elements", "Organic Chemistry", "Hydrocarbons", "Environmental Chemistry"],
    12: ["Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "General Principles and Processes of Isolation of Elements", "p-Block Elements", "d- and f-Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Organic Compounds Containing Nitrogen", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
  },
  HIST: {
    9: ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World"],
    10: ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World"],
    11: ["From the Beginning of Time", "Writing and City Life", "An Empire Across Three Continents", "The Central Islamic Lands", "Nomadic Empires", "The Three Orders", "Changing Cultural Traditions", "Confrontation of Cultures", "The Industrial Revolution", "Displacing Indigenous Peoples", "Paths to Modernisation"],
    12: ["Bricks, Beads and Bones", "Kings, Farmers and Towns", "Kinship, Caste and Class", "Thinkers, Beliefs and Buildings", "Through the Eyes of Travellers", "Bhakti-Sufi Traditions", "An Imperial Capital Vijayanagara", "Peasants, Zamindars and the State", "Kings and Chronicles", "Colonialism and the Countryside", "Rebels and the Raj", "Colonialism and Indian Towns", "Mahatma Gandhi and the Nationalist Movement", "The Making of the Constitution", "Nationalism, Partition and Independence"],
  },
  GEO: {
    9: ["India – Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population"],
    10: ["Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of National Economy"],
    11: ["Geography as a Discipline", "The Origin and Evolution of the Earth", "Interior of the Earth", "Distribution of Oceans and Continents", "Minerals and Rocks", "Geomorphic Processes", "Landforms and their Evolution", "Composition and Structure of Atmosphere", "Solar Radiation, Heat Balance and Temperature", "Atmospheric Circulation and Weather Systems", "Water in the Atmosphere", "World Climate and Climate Change", "Water (Oceans)", "Movements of Ocean Water", "Life on the Earth", "Biodiversity and Conservation", "India: Location", "Structure and Physiography", "Drainage System", "Climate", "Natural Vegetation", "Soils", "Natural Hazards and Disasters"],
    12: ["Human Geography: Nature and Scope", "The World Population: Distribution, Density and Growth", "Human Development", "Primary Activities", "Secondary Activities", "Tertiary and Quaternary Activities", "Transport, Communication and Trade", "International Trade", "Human Settlements", "Resources and Development", "Agriculture", "Water Resources", "Minerals and Energy Resources", "Manufacturing Industries", "Planning and Sustainable Development in Indian Context"],
  },
  PHY: {
    9: ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"],
    10: ["Light – Reflection and Refraction", "The Human Eye and the Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"],
    11: ["Physical World", "Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles and Rotational Motion", "Gravitation", "Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves"],
    12: ["Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei", "Semiconductor Electronics"],
  },
  BIO: {
    9: ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why Do We Fall Ill", "Natural Resources", "Improvement in Food Resources"],
    10: ["Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Our Environment", "Management of Natural Resources"],
    11: ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals", "Cell: The Unit of Life", "Biomolecules", "Cell Cycle and Cell Division", "Transport in Plants", "Mineral Nutrition", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration"],
    12: ["Reproduction in Organisms", "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement in Food Production", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
  },
  ECO: {
    11: ["Indian Economy on the Eve of Independence", "Indian Economy (1950–1990)", "Liberalisation, Privatisation and Globalisation: An Appraisal", "Poverty", "Human Capital Formation in India", "Rural Development", "Employment: Growth, Informalisation and Other Issues", "Infrastructure", "Environment and Sustainable Development", "Comparative Development Experiences of India and its Neighbours", "Introduction", "Collection of Data", "Organisation of Data", "Presentation of Data", "Measures of Central Tendency", "Measures of Dispersion", "Correlation", "Index Numbers"],
    12: ["National Income and Related Aggregates", "Money and Banking", "Determination of Income and Employment", "Government Budget and Economy", "Balance of Payments", "Development Experience (1947–1990) and Economic Reforms since 1991", "Current Challenges facing Indian Economy", "Development Experience of India – A Comparison with Neighbours"],
  },
  POL: {
    11: ["Constitution: Why and How?", "Rights in the Indian Constitution", "Election and Representation", "Executive", "Legislature", "Judiciary", "Federalism", "Local Governments", "Constitution as a Living Document", "Political Theory: An Introduction", "Freedom", "Equality", "Social Justice", "Rights", "Citizenship", "Nationalism", "Secularism", "Peace", "Development"],
    12: ["The End of Bipolarity", "Contemporary Centres of Power", "Contemporary South Asia", "International Organisations", "Security in the Contemporary World", "Environment and Natural Resources", "Globalisation", "Challenges of Nation-Building", "Era of One-Party Dominance", "Politics of Planned Development", "India's External Relations", "Recent Developments in Indian Politics"],
  },
  ACC: {
    11: ["Introduction to Accounting", "Theory Base of Accounting", "Recording of Transactions – I", "Recording of Transactions – II", "Bank Reconciliation Statement", "Trial Balance and Rectification of Errors", "Depreciation, Provisions and Reserves", "Bills of Exchange", "Financial Statements – I", "Financial Statements – II"],
    12: ["Accounting for Partnership Firms", "Reconstitution of Partnership: Admission of a Partner", "Reconstitution of Partnership: Retirement/Death of a Partner", "Dissolution of Partnership Firm", "Accounting for Share Capital", "Issue and Redemption of Debentures", "Analysis of Financial Statements", "Cash Flow Statement", "Project Work", "Practical File"],
  },
  HMUS: {
    11: ["हिंदुस्तानी संगीत की उत्पत्ति एवं विकास", "स्वर, श्रुति एवं सप्तक", "ठाठ एवं राग", "राग का लक्षण", "ताल एवं लय", "हिंदुस्तानी संगीत की शास्त्रीय गायन शैलियाँ", "संगीत की लिपि पद्धति", "भारतीय लोक संगीत"],
    12: ["History and Development of Hindustani Music", "Expanded Swara, Shruti, Saptak Concepts", "Raga and Its Elaborations", "Advanced Lakshana of Ragas", "Expanded Tala and Laya Studies", "Classical Music Forms", "Notation and Composition Practices", "Folk and Regional Traditions"],
  },
  IP: {
    11: ["Introduction to Computer System", "Introduction to Python", "Database Concepts and the Structured Query Language", "Introduction to Emerging Technologies"],
    12: ["Data Handling using Pandas and Data Visualization", "Database Query using SQL", "Introduction to Computer Networks", "Societal Impacts of IT and Ethics"],
  },
  PSY: {
    11: ["What is Psychology?", "Methods of Enquiry in Psychology", "Human Development", "Sensory, Attentional and Perceptual Processes", "Learning", "Human Memory", "Thinking", "Motivation and Emotion", "Introduction", "Statistics in Psychology", "Data Handling", "Measures of Central Tendency", "Measures of Variability", "Normal Probability Curve"],
    12: ["Variations in Psychological Attributes", "Self and Personality", "Meeting Life Challenges", "Psychological Disorders", "Therapeutic Approaches", "Attitude and Social Cognition", "Social Influence and Group Processes"],
  },
  SOC: {
    11: ["Sociology and Society", "Terms, Concepts and Their Use in Sociology", "Understanding Social Institutions", "Culture and Socialization", "Doing Sociology: Research Methods", "Society, Social Structure and Social Stratification", "Social Change and Social Order in Rural and Urban Society", "Environment and Society", "Introducing Western Sociologists", "Indian Sociologists"],
    12: ["Structural Change", "Cultural Change", "The Demographic Structure of Indian Society", "Social Institutions: Continuity and Change", "Patterns of Social Inequality and Exclusion", "The Challenges of Cultural Diversity", "Change and Development in Rural Society", "Change and Development in Industrial Society", "Social Movements"],
  },
  LEGAL: {
    11: ["Judiciary", "Topics of Law", "Legal Services", "Legal Profession", "Alternative Dispute Resolution", "Human Rights in India", "Consumer Protection Laws"],
    12: ["Judiciary in India", "Alternative Dispute Resolution (ADR)", "Topics in Law-I: Business and Contract", "Topics in Law-II: General Laws", "Human Rights in India", "International Law", "Legal Profession and Services", "Project/Practical File"],
  },
  PE: {
    11: ["Changing Trends and Career in Physical Education", "Olympic Value Education", "Physical Fitness, Wellness and Lifestyle", "Physical Education and Sports for CWSN (Children with Special Needs – Divyang)", "Yoga", "Physical Activity and Leadership Training", "Test, Measurement and Evaluation", "Fundamentals of Anatomy and Physiology", "Fundamentals of Kinesiology and Biomechanics", "Psychology and Sports", "Training and Doping in Sports"],
    12: ["Management of Sporting Events", "Children and Women in Sports", "Yoga for Health and Lifestyle", "Physical Education and Sports for Persons with Special Needs", "Sports and Nutrition", "Test, Measurement and Evaluation", "Physiology and Injuries in Sports", "Biomechanics and Sports", "Psychology and Sports", "Training in Sports"],
  },
};
