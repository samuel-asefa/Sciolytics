export interface Question {
  id: string;
  event: string;
  subtopic: string;
  division: 'B' | 'C' | 'Both';
  type: 'MCQ' | 'FRQ';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options?: string[]; // For MCQ only
  correctAnswer: string;
  keywords?: string[]; // For FRQ grading
  explanation?: string;
  year?: number;
  tournament?: string;
}

const accurateQuestions: Question[] = [
  // Anatomy & Physiology
  {
    id: 'q_ana_1',
    event: 'Anatomy & Physiology',
    subtopic: 'Endocrine System',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following hormones is produced by the anterior pituitary gland and directly acts on the gonads?',
    options: ['Oxytocin', 'Antidiuretic Hormone (ADH)', 'Luteinizing Hormone (LH)', 'Thyroxine (T4)'],
    correctAnswer: 'Luteinizing Hormone (LH)',
    explanation: 'LH is an gonadotropin produced by the anterior pituitary. Oxytocin and ADH are produced by the hypothalamus and released by the posterior pituitary. T4 is produced by the thyroid gland.',
    year: 2023,
    tournament: 'National'
  },
  {
    id: 'q_ana_2',
    event: 'Anatomy & Physiology',
    subtopic: 'Nervous System',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'During an action potential, the rapid depolarization phase is primarily driven by the influx of which ion?',
    options: ['Potassium (K+)', 'Sodium (Na+)', 'Calcium (Ca2+)', 'Chloride (Cl-)'],
    correctAnswer: 'Sodium (Na+)',
    explanation: 'When a neuron reaches threshold, voltage-gated sodium channels open allowing a rapid influx of Na+ into the cell, which causes depolarization from roughly -55mV to +30mV.',
    year: 2022,
    tournament: 'State'
  },
  {
    id: 'q_ana_3',
    event: 'Anatomy & Physiology',
    subtopic: 'Cardiovascular System',
    division: 'Both',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Describe the pathway of a red blood cell from the right atrium to the aorta, listing all major valves and chambers it passes through in order.',
    correctAnswer: 'Right atrium -> tricuspid valve -> right ventricle -> pulmonary valve -> pulmonary trunk/arteries -> lungs -> pulmonary veins -> left atrium -> bicuspid/mitral valve -> left ventricle -> aortic valve -> aorta.',
    keywords: ['tricuspid', 'right ventricle', 'pulmonary valve', 'lungs', 'left atrium', 'bicuspid', 'mitral', 'left ventricle', 'aortic valve'],
    explanation: 'For full credit, the response must sequentially trace the flow of blood through the right heart (deoxygenated), the pulmonary circuit, and the left heart (oxygenated).',
    year: 2021,
    tournament: 'Regional'
  },
  
  // Astronomy
  {
    id: 'q_ast_1',
    event: 'Astronomy',
    subtopic: 'Stellar Evolution',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'What is the Chandrasekhar limit (approximately 1.44 solar masses)?',
    options: [
      'The minimum mass for a star to undergo nuclear fusion.',
      'The maximum mass of a stable white dwarf star.',
      'The mass required for a star to end as a black hole.',
      'The maximum mass of a neutron star before collapsing.'
    ],
    correctAnswer: 'The maximum mass of a stable white dwarf star.',
    explanation: 'The Chandrasekhar limit is the maximum mass at which electron degeneracy pressure can support a white dwarf against gravitational collapse. Beyond this (roughly 1.44 M_sun), it will collapse into a neutron star or undergo a Type Ia supernova.',
    year: 2023,
    tournament: 'National'
  },
  {
    id: 'q_ast_2',
    event: 'Astronomy',
    subtopic: 'Cosmology',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Explain what the cosmic microwave background (CMB) is and why it is significant to the Big Bang theory.',
    correctAnswer: 'The CMB is the residual thermal radiation left over from the time of recombination in Big Bang cosmology. It is significant because it provides the strongest evidence for the early hot, dense state of the universe, demonstrating roughly uniform background temperature (with minor anisotropies).',
    keywords: ['radiation', 'recombination', 'big bang', 'evidence', 'residual', 'temperature', 'remnant', 'glow'],
    explanation: 'Answers should mention it being leftover radiation from the early universe (recombination/decoupling era) and serving as a critical piece of evidence supporting the Big Bang model.',
  },

  // Disease Detectives
  {
    id: 'q_dd_1',
    event: 'Disease Detectives',
    subtopic: 'Epidemiology',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'A sudden increase in the occurrence of a disease in a localized area is best described as:',
    options: ['Endemic', 'Pandemic', 'Epidemic', 'Outbreak'],
    correctAnswer: 'Outbreak',
    explanation: 'An outbreak is a sudden rise in disease incidence restricted to a localized area or specific population. An epidemic is larger and more widespread. Endemic refers to baseline levels, and a pandemic is completely global.',
    year: 2022,
    tournament: 'Regional'
  },
  {
    id: 'q_dd_2',
    event: 'Disease Detectives',
    subtopic: 'Biostatistics',
    division: 'Both',
    type: 'FRQ',
    difficulty: 'Medium',
    question: 'What is the difference between incidence and prevalence in epidemiological studies?',
    correctAnswer: 'Incidence refers to the number of NEW cases of a disease in a specific population during a specified time period. Prevalence refers to the TOTAL number of cases (both new and existing/old) in a population at a given time.',
    keywords: ['incidence', 'new cases', 'prevalence', 'total cases', 'existing', 'time'],
    explanation: 'Incidence measures risk/new occurrences over time as a rate. Prevalence measures the overall burden of the disease in the population at a snapshot or period.',
  },
  
  // Experimental Design
  {
    id: 'q_ed_1',
    event: 'Experimental Design',
    subtopic: 'Variables',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'In an experiment testing how the amount of sunlight affects plant growth, what is the dependent variable?',
    options: ['The amount of sunlight', 'The type of plant', 'The plant growth (height/mass)', 'The type of soil used'],
    correctAnswer: 'The plant growth (height/mass)',
    explanation: 'The dependent variable is what is being measured or observed as a result of changes to the independent variable. In this case, plant growth depends on sunlight.',
    year: 2024,
    tournament: 'State'
  },
  
  // Dynamic Planet
  {
    id: 'q_dp_1',
    event: 'Dynamic Planet',
    subtopic: 'Plate Tectonics',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'At which type of plate boundary is new oceanic crust typically formed?',
    options: ['Convergent boundary', 'Divergent boundary', 'Transform boundary', 'Subduction zone'],
    correctAnswer: 'Divergent boundary',
    explanation: 'New oceanic crust is formed at divergent boundaries, specifically at mid-ocean ridges, where tectonic plates pull apart and magma rises to fill the gap.',
  },
  {
    id: 'q_dp_2',
    event: 'Dynamic Planet',
    subtopic: 'Volcanoes',
    division: 'Both',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Describe the relationship between magma viscosity, silica content, and the explosivity of a volcanic eruption.',
    correctAnswer: 'Magma with high silica content has high viscosity, making it thick and sticky. This traps gases, leading to a buildup of pressure and highly explosive eruptions. Low silica magma has low viscosity, allowing gases to escape easily, resulting in effusive (non-explosive) lava flows.',
    keywords: ['high silica', 'high viscosity', 'viscous', 'traps gas', 'explosive', 'pressure', 'low silica', 'effusive'],
    explanation: 'Must connect high silica -> high viscosity -> trapped gas -> explosive eruptions. (And the converse for low silica/effusive eruptions).',
  },
  {
    id: 'q_bot_1',
    event: 'Botany',
    subtopic: 'Plant Physiology',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following plant hormones is primarily responsible for apical dominance?',
    options: ['Ethylene', 'Gibberellins', 'Auxins', 'Cytokinins'],
    correctAnswer: 'Auxins',
    explanation: 'Auxins produced in the apical meristem inhibit the growth of lateral buds, a phenomenon known as apical dominance.',
  },
  {
    id: 'q_dg_1',
    event: 'Designer Genes',
    subtopic: 'Molecular Genetics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'In the lac operon, what binds to the operator to prevent transcription?',
    options: ['RNA Polymerase', 'Lactose', 'Repressor', 'Promoter'],
    correctAnswer: 'Repressor',
    explanation: 'The lac repressor protein binds to the operator, preventing RNA polymerase from transcribing the operon genes unless lactose is present to bind to the repressor.',
  },
  {
    id: 'q_wq_1',
    event: 'Water Quality',
    subtopic: 'Aquatic Ecology',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which index is commonly used to assess the health of an aquatic ecosystem based on benthic macroinvertebrates?',
    options: ['Secchi Depth', 'PTI (Pollution Tolerance Index)', 'DO (Dissolved Oxygen)', 'pH'],
    correctAnswer: 'PTI (Pollution Tolerance Index)',
    explanation: 'The PTI assigns a tolerance value to different types of macroinvertebrates to gauge water pollution levels.',
  },
  {
    id: 'q_rs_1',
    event: 'Remote Sensing',
    subtopic: 'Satellite Imagery',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which spectral band is most useful for distinguishing vegetation from soil and observing plant health?',
    options: ['Blue', 'Green', 'Red', 'Near-Infrared (NIR)'],
    correctAnswer: 'Near-Infrared (NIR)',
    explanation: 'Healthy vegetation reflects near-infrared radiation strongly, making the NIR band crucial for computing indices like NDVI.',
  },
  {
    id: 'q_rm_1',
    event: 'Rocks and Minerals',
    subtopic: 'Mineralogy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following minerals exhibits double refraction?',
    options: ['Quartz', 'Calcite', 'Feldspar', 'Halite'],
    correctAnswer: 'Calcite',
    explanation: 'Calcite exhibits strong double refraction (birefringence), where a single ray of light is split into two upon entering the crystal.',
  },
  {
    id: 'q_chem_1',
    event: 'Chemistry Lab',
    subtopic: 'Aqueous Solutions',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the pH of a 0.01 M solution of HCl?',
    options: ['1', '2', '3', '4'],
    correctAnswer: '2',
    explanation: 'HCl is a strong acid that completely dissociates. pH = -log[H+]. -log(0.01) = 2.',
  },
  {
    id: 'q_for_1',
    event: 'Forensics',
    subtopic: 'Trace Evidence',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which technique is primarily used to identify the chemical composition of an unknown plastic sample?',
    options: ['Gas Chromatography', 'Mass Spectrometry', 'FTIR Spectroscopy', 'Thin-Layer Chromatography'],
    correctAnswer: 'FTIR Spectroscopy',
    explanation: 'Fourier-Transform Infrared (FTIR) Spectroscopy is commonly used for polymer and plastic identification based on characteristic infrared absorption peaks.',
  },
  {
    id: 'q_hov_1',
    event: 'Hovercraft',
    subtopic: 'Physics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which principle of fluid dynamics explains the generation of lift for a hovercraft skirt?',
    options: ["Bernoulli's Principle", "Archimedes' Principle", "Pascal's Law", "Newton's Third Law"],
    correctAnswer: "Newton's Third Law",
    explanation: 'The downward thrust of the air creates an equal and opposite upward force (lift) according to Newton’s Third Law. The pressurized skirt maintains the air cushion.',
  },
  {
    id: 'q_pm_1',
    event: 'Protein Modeling',
    subtopic: 'Protein Structure',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Alpha helices and beta sheets are examples of which level of protein structure?',
    options: ['Primary', 'Secondary', 'Tertiary', 'Quaternary'],
    correctAnswer: 'Secondary',
    explanation: 'Secondary structure refers to local folded structures that form within a polypeptide due to interactions between atoms of the backbone (e.g., hydrogen bonding).',
  },
  {
    id: 'q_therm_1',
    event: 'Thermodynamics',
    subtopic: 'Laws of Thermodynamics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which law of thermodynamics states that the entropy of an isolated system never decreases over time?',
    options: ['Zeroth Law', 'First Law', 'Second Law', 'Third Law'],
    correctAnswer: 'Second Law',
    explanation: 'The Second Law dictates that natural processes proceed in a direction that increases the total entropy of the universe.',
  },
  {
    id: 'q_cl_1',
    event: 'Circuit Lab',
    subtopic: 'DC Circuits',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the equivalent resistance of two 10-ohm resistors in parallel?',
    options: ['5 ohms', '10 ohms', '15 ohms', '20 ohms'],
    correctAnswer: '5 ohms',
    explanation: 'For two identical resistors in parallel, the equivalent resistance is half the resistance of one resistor: (10*10)/(10+10) = 100/20 = 5 ohms.',
  },
  {
    id: 'q_bl_1',
    event: 'Boomilever',
    subtopic: 'Structural Engineering',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'In a standard Boomilever design, which structural member primarily experiences tension?',
    options: ['The base chord', 'The tension tie', 'The lateral braces', 'The compression block'],
    correctAnswer: 'The tension tie',
    explanation: 'The upper member(s) that attach to the testing wall and hold the boom up are in tension, pulling away from the wall.',
  },
  {
    id: 'q_ev_1',
    event: 'Electric Vehicle',
    subtopic: 'Electrical Components',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'Which component controls the power delivered to the motor in an EV?',
    options: ['Battery', 'ESC (Electronic Speed Controller)', 'Servo', 'Microcontroller'],
    correctAnswer: 'ESC (Electronic Speed Controller)',
    explanation: 'An ESC interprets signals from the microcontroller/receiver and regulates the voltage/current to the motor to control its speed.',
  },
  {
    id: 'q_mp_1',
    event: 'Mission Possible',
    subtopic: 'Simple Machines',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the ideal mechanical advantage of a ramp that is 10 meters long and 2 meters high?',
    options: ['2', '5', '10', '20'],
    correctAnswer: '5',
    explanation: 'Ideal Mechanical Advantage (IMA) for an inclined plane is Length / Height = 10 / 2 = 5.',
  },
  {
    id: 'q_ws_1',
    event: 'Wright Stuff',
    subtopic: 'Aerodynamics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What adjustment would you make to correct a plane that is stalling in flight?',
    options: ['Add nose weight', 'Add tail weight', 'Increase incidence of the main wing', 'Decrease rudder angle'],
    correctAnswer: 'Add nose weight',
    explanation: 'Stalling often occurs because the center of gravity is too far back. Adding weight to the nose moves the CG forward.',
  },
  {
    id: 'q_cb_1',
    event: 'Codebusters',
    subtopic: 'Cryptanalysis',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which cipher uses a grid and a keyword to substitute letters, often requiring finding the intersection of a row and column?',
    options: ['Caesar Cipher', 'Vigenère Cipher', 'Atbash Cipher', 'Baconian Cipher'],
    correctAnswer: 'Vigenère Cipher',
    explanation: 'The Vigenère cipher uses a Vigenère square (or tabula recta) and a repeating keyword to perform polyalphabetic substitution.',
  },
  {
    id: 'q_ecad_1',
    event: 'Engineering CAD',
    subtopic: 'CAD Basics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which file format is most commonly used for exporting 3D models for 3D printing?',
    options: ['.DWG', '.PDF', '.STL', '.DXF'],
    correctAnswer: '.STL',
    explanation: 'STL (STereoLithography) files represent 3D surfaces as a series of connected triangles and are the standard format for 3D printing slicers.',
  },
  {
    id: 'q_ppp_1',
    event: 'Ping-Pong Parachute',
    subtopic: 'Physics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which factor does NOT directly affect the terminal velocity of a falling parachute?',
    options: ['Surface area of the canopy', 'Mass of the payload', 'Air density', 'Color of the parachute'],
    correctAnswer: 'Color of the parachute',
  },
  // MORE Anatomy & Physiology
  {
    id: 'q_ana_4',
    event: 'Anatomy & Physiology',
    subtopic: 'Endocrine System',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which of the following is an example of a steroid hormone?',
    options: ['Insulin', 'Epinephrine', 'Cortisol', 'Glucagon'],
    correctAnswer: 'Cortisol',
    explanation: 'Cortisol is a steroid hormone produced by the adrenal cortex. Insulin and glucagon are peptide hormones, and epinephrine is an amine hormone.',
    year: 2021,
    tournament: 'State'
  },
  {
    id: 'q_ana_5',
    event: 'Anatomy & Physiology',
    subtopic: 'Nervous System',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Identify the cranial nerve responsible for both hearing and balance, and state its Roman numeral designation.',
    correctAnswer: 'Vestibulocochlear nerve, Cranial Nerve VIII (8)',
    keywords: ['Vestibulocochlear', 'VIII', '8', 'Eighth'],
    explanation: 'The vestibulocochlear nerve (CN VIII) carries sensory information from the cochlea (hearing) and vestibule (balance) to the brain.',
    year: 2022,
    tournament: 'Regional'
  },
  // MORE Astronomy
  {
    id: 'q_ast_3',
    event: 'Astronomy',
    subtopic: 'Stellar Evolution',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What type of star is typically found at the center of a planetary nebula?',
    options: ['Red Giant', 'White Dwarf', 'Neutron Star', 'Main Sequence Star'],
    correctAnswer: 'White Dwarf',
    explanation: 'A planetary nebula is the ejected outer layers of a red giant star. The hot, dense core left behind is a white dwarf, which illuminates the nebula.',
    year: 2023,
    tournament: 'Regional'
  },
  {
    id: 'q_ast_4',
    event: 'Astronomy',
    subtopic: 'Exoplanets',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which method of exoplanet detection involves observing the periodic dimming of a star as a planet passes in front of it?',
    options: ['Radial Velocity', 'Transit Method', 'Direct Imaging', 'Gravitational Microlensing'],
    correctAnswer: 'Transit Method',
    explanation: 'The transit method relies on the slight dip in a star\'s brightness when a planet transits (crosses) its disk from our line of sight.',
    year: 2022,
    tournament: 'State'
  },
  // MORE Disease Detectives
  {
    id: 'q_dd_3',
    event: 'Disease Detectives',
    subtopic: 'Study Design',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which type of study design is most prone to recall bias?',
    options: ['Randomized Controlled Trial', 'Cohort Study', 'Case-Control Study', 'Cross-Sectional Study'],
    correctAnswer: 'Case-Control Study',
    explanation: 'Case-control studies are retrospective and rely on participants remembering past exposures, making them highly susceptible to recall bias.',
    year: 2023,
    tournament: 'State'
  },
  {
    id: 'q_dd_4',
    event: 'Disease Detectives',
    subtopic: 'Biostatistics',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Calculate the Odds Ratio (OR) for a disease given the following data: 40 exposed cases, 10 unexposed cases, 20 exposed controls, and 80 unexposed controls. Show your formula.',
    correctAnswer: 'OR = (40 * 80) / (10 * 20) = 3200 / 200 = 16',
    keywords: ['16', '3200', '200', 'ad/bc'],
    explanation: 'Odds Ratio is calculated as (Exposed Cases * Unexposed Controls) / (Unexposed Cases * Exposed Controls) or ad/bc. OR = (40 * 80) / (10 * 20) = 16.',
    year: 2024,
    tournament: 'National'
  },
  // MORE Experimental Design
  {
    id: 'q_ed_2',
    event: 'Experimental Design',
    subtopic: 'Variables',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following best describes a control variable in an experiment?',
    options: ['The variable manipulated by the experimenter', 'The variable measured to determine the outcome', 'A variable kept constant to prevent it from affecting the dependent variable', 'A group that does not receive the experimental treatment'],
    correctAnswer: 'A variable kept constant to prevent it from affecting the dependent variable',
    explanation: 'Control variables (or constants) are factors kept the same throughout the experiment so they do not inadvertently affect the dependent variable.',
    year: 2022,
    tournament: 'Regional'
  },
  {
    id: 'q_ed_3',
    event: 'Experimental Design',
    subtopic: 'Data Analysis',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Medium',
    question: 'Explain the difference between qualitative and quantitative data, providing one example of each.',
    correctAnswer: 'Quantitative data is numerical and measurable (e.g., height in cm, mass in g). Qualitative data is descriptive and non-numerical (e.g., color, texture, smell).',
    keywords: ['numerical', 'measurable', 'descriptive', 'non-numerical', 'numbers', 'qualities'],
    explanation: 'Must distinguish between numerical/measured data (quantitative) and descriptive/categorical data (qualitative) with valid examples.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Dynamic Planet
  {
    id: 'q_dp_3',
    event: 'Dynamic Planet',
    subtopic: 'Oceanography',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'What is the primary driving force behind thermohaline circulation?',
    options: ['Wind patterns', 'Differences in water density', 'The Coriolis effect', 'Tidal forces'],
    correctAnswer: 'Differences in water density',
    explanation: 'Thermohaline circulation is the global conveyor belt of ocean currents driven by differences in water density, which is controlled by temperature (thermo) and salinity (haline).',
    year: 2021,
    tournament: 'National'
  },
  {
    id: 'q_dp_4',
    event: 'Dynamic Planet',
    subtopic: 'Glaciology',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'A ridge of unsorted glacial till deposited at the edge of a glacier is known as a:',
    options: ['Esker', 'Drumlin', 'Moraine', 'Kame'],
    correctAnswer: 'Moraine',
    explanation: 'Moraines are accumulations of dirt and rocks (till) that have fallen onto the glacier surface or have been pushed along by the glacier as it moves.',
    year: 2022,
    tournament: 'Regional'
  },
  // MORE Botany
  {
    id: 'q_bot_2',
    event: 'Botany',
    subtopic: 'Plant Anatomy',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which tissue is responsible for the transport of water and dissolved minerals from the roots to the rest of the plant?',
    options: ['Phloem', 'Xylem', 'Epidermis', 'Parenchyma'],
    correctAnswer: 'Xylem',
    explanation: 'Xylem transports water and dissolved minerals upward from the roots, while phloem transports sugars and other organic compounds throughout the plant.',
    year: 2023,
    tournament: 'Regional'
  },
  {
    id: 'q_bot_3',
    event: 'Botany',
    subtopic: 'Plant Reproduction',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Describe the process of double fertilization in angiosperms and the two products it yields.',
    correctAnswer: 'Double fertilization involves two sperm cells. One sperm cell fertilizes the egg cell to form a diploid (2n) zygote. The other sperm cell fuses with the two polar nuclei in the central cell to form a triploid (3n) endosperm.',
    keywords: ['two sperm', 'fertilizes egg', 'diploid zygote', 'polar nuclei', 'triploid endosperm'],
    explanation: 'Must mention both fertilization events: sperm + egg = zygote, and sperm + polar nuclei = endosperm.',
    year: 2022,
    tournament: 'National'
  },
  // MORE Designer Genes
  {
    id: 'q_dg_2',
    event: 'Designer Genes',
    subtopic: 'Mendelian Genetics',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'In a dihybrid cross between two heterozygotes (AaBb x AaBb) showing independent assortment, what is the expected phenotypic ratio?',
    options: ['1:1:1:1', '9:3:3:1', '3:1', '1:2:1'],
    correctAnswer: '9:3:3:1',
    explanation: 'A classic Mendelian dihybrid cross of two heterozygotes yields a 9:3:3:1 phenotypic ratio.',
    year: 2024,
    tournament: 'Regional'
  },
  {
    id: 'q_dg_3',
    event: 'Designer Genes',
    subtopic: 'Molecular Genetics',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Briefly explain the role of DNA ligase in DNA replication.',
    correctAnswer: 'DNA ligase facilitates the joining of DNA strands together by catalyzing the formation of a phosphodiester bond. It is essential for joining Okazaki fragments on the lagging strand during DNA replication.',
    keywords: ['Okazaki fragments', 'lagging strand', 'phosphodiester bond', 'join', 'seal'],
    explanation: 'Must mention its role in sealing nicks/joining Okazaki fragments on the lagging strand.',
    year: 2021,
    tournament: 'State'
  },
  // MORE Water Quality
  {
    id: 'q_wq_2',
    event: 'Water Quality',
    subtopic: 'Chemical Analysis',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'What is the primary consequence of high nitrate and phosphate levels in a freshwater ecosystem?',
    options: ['Increased dissolved oxygen', 'Eutrophication and algal blooms', 'Decreased water temperature', 'Increased water clarity'],
    correctAnswer: 'Eutrophication and algal blooms',
    explanation: 'Excess nutrients (nitrates and phosphates) lead to eutrophication, causing rapid growth of algae (algal blooms). When the algae die and decompose, it severely depletes dissolved oxygen levels.',
    year: 2022,
    tournament: 'State'
  },
  {
    id: 'q_wq_3',
    event: 'Water Quality',
    subtopic: 'Estuaries',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What defines a halocline in an estuarine environment?',
    options: ['A rapid change in temperature with depth', 'A rapid change in salinity with depth', 'A rapid change in dissolved oxygen with depth', 'A rapid change in pH with depth'],
    correctAnswer: 'A rapid change in salinity with depth',
    explanation: 'A halocline is a subtype of chemocline caused by a strong, vertical salinity gradient within a body of water.',
    year: 2023,
    tournament: 'Regional'
  },
  // MORE Remote Sensing
  {
    id: 'q_rs_2',
    event: 'Remote Sensing',
    subtopic: 'Satellite Imagery',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following is an active remote sensing system?',
    options: ['Landsat 8 OLI', 'MODIS', 'LIDAR', 'ASTER'],
    correctAnswer: 'LIDAR',
    explanation: 'LIDAR (Light Detection and Ranging) is an active system because it emits its own energy source (laser pulses) and measures the reflection. The others rely on passive reflection of sunlight or thermal emissions.',
    year: 2022,
    tournament: 'State'
  },
  {
    id: 'q_rs_3',
    event: 'Remote Sensing',
    subtopic: 'Indices',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Write the formula for the Normalized Difference Vegetation Index (NDVI).',
    correctAnswer: 'NDVI = (NIR - Red) / (NIR + Red)',
    keywords: ['NIR', 'Red', 'Near-Infrared', 'difference', 'sum', 'ratio'],
    explanation: 'NDVI is calculated using the Near-Infrared and Red bands: (NIR - Red) / (NIR + Red).',
    year: 2021,
    tournament: 'National'
  },
  // MORE Rocks and Minerals
  {
    id: 'q_rm_2',
    event: 'Rocks and Minerals',
    subtopic: 'Igneous Rocks',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'An igneous rock that cools very quickly on the Earth\'s surface, resulting in a glassy texture with no visible crystals, is:',
    options: ['Granite', 'Basalt', 'Obsidian', 'Pumice'],
    correctAnswer: 'Obsidian',
    explanation: 'Obsidian is an extrusive igneous rock that cools so rapidly that crystals do not have time to form, resulting in a glassy texture.',
    year: 2023,
    tournament: 'Regional'
  },
  {
    id: 'q_rm_3',
    event: 'Rocks and Minerals',
    subtopic: 'Mineralogy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'According to Bowen\'s Reaction Series, which mineral is the first to crystallize from a cooling magma?',
    options: ['Quartz', 'Muscovite mica', 'Potassium feldspar', 'Olivine'],
    correctAnswer: 'Olivine',
    explanation: 'Olivine forms at the highest temperatures and is the first mineral to crystallize in the discontinuous branch of Bowen\'s Reaction Series.',
    year: 2022,
    tournament: 'State'
  },
  // MORE Chemistry Lab
  {
    id: 'q_chem_2',
    event: 'Chemistry Lab',
    subtopic: 'Thermodynamics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Under what conditions is a reaction always spontaneous?',
    options: ['Positive ΔH, Positive ΔS', 'Negative ΔH, Positive ΔS', 'Negative ΔH, Negative ΔS', 'Positive ΔH, Negative ΔS'],
    correctAnswer: 'Negative ΔH, Positive ΔS',
    explanation: 'Gibbs Free Energy is ΔG = ΔH - TΔS. For a reaction to be always spontaneous, ΔG must be negative at all temperatures, which occurs when ΔH is negative (exothermic) and ΔS is positive (increased entropy).',
    year: 2024,
    tournament: 'National'
  },
  {
    id: 'q_chem_3',
    event: 'Chemistry Lab',
    subtopic: 'Aqueous Solutions',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Medium',
    question: 'Calculate the molarity of a solution containing 11.7g of NaCl (molar mass = 58.44 g/mol) dissolved in enough water to make 500 mL of solution.',
    correctAnswer: '0.4 M',
    keywords: ['0.4', '0.40', '0.400'],
    explanation: 'Moles of NaCl = 11.7 g / 58.44 g/mol = 0.2 mol. Volume = 0.5 L. Molarity = 0.2 mol / 0.5 L = 0.4 M.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Forensics
  {
    id: 'q_for_2',
    event: 'Forensics',
    subtopic: 'Fingerprints',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'What is the most common fingerprint pattern in the human population?',
    options: ['Loop', 'Whorl', 'Arch', 'Tented Arch'],
    correctAnswer: 'Loop',
    explanation: 'Loops are the most common fingerprint pattern, accounting for roughly 60-65% of the population. Whorls account for ~30-35%, and arches for about 5%.',
    year: 2022,
    tournament: 'Regional'
  },
  {
    id: 'q_for_3',
    event: 'Forensics',
    subtopic: 'Blood Analysis',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'A blood droplet that falls perfectly vertically onto a smooth, non-porous surface from a height of 90 degrees will form a shape closest to a:',
    options: ['Perfect circle', 'Elongated oval', 'Star with many spines', 'Teardrop'],
    correctAnswer: 'Perfect circle',
    explanation: 'Blood dropped at a 90-degree angle onto a smooth surface produces a circular stain. Lower angles produce more elongated (elliptical) stains.',
    year: 2021,
    tournament: 'State'
  },
  // MORE Hovercraft
  {
    id: 'q_hov_2',
    event: 'Hovercraft',
    subtopic: 'Physics',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Medium',
    question: 'What is the formula to calculate the pressure exerted by the hovercraft on the ground, given its mass (m) and the area of the skirt (A)? Assume gravity is (g).',
    correctAnswer: 'P = (m * g) / A',
    keywords: ['F/A', 'mg/A', 'mass', 'gravity', 'area'],
    explanation: 'Pressure is Force divided by Area. The force here is the weight of the hovercraft, which is mass times gravity (m*g). Thus, Pressure = mg / A.',
    year: 2022,
    tournament: 'State'
  },
  // MORE Protein Modeling
  {
    id: 'q_pm_2',
    event: 'Protein Modeling',
    subtopic: 'Protein Structure',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which amino acid is uniquely known to form covalent disulfide bonds that stabilize tertiary and quaternary protein structures?',
    options: ['Methionine', 'Cysteine', 'Proline', 'Glycine'],
    correctAnswer: 'Cysteine',
    explanation: 'Cysteine contains a sulfhydryl (-SH) group. Two cysteines can oxidize to form a covalent disulfide bond (-S-S-), which strongly stabilizes protein structure.',
    year: 2023,
    tournament: 'National'
  },
  {
    id: 'q_pm_3',
    event: 'Protein Modeling',
    subtopic: 'Jmol Viewer',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'In Jmol, what command would you use to select only the amino acid residues 10 through 20?',
    options: ['select 10-20', 'restrict 10:20', 'select resno >= 10 and resno <= 20', 'choose 10 to 20'],
    correctAnswer: 'select 10-20',
    explanation: 'In Jmol script, you can use "select 10-20" to specifically select residues numbered 10 through 20.',
    year: 2021,
    tournament: 'Regional'
  },
  // MORE Thermodynamics
  {
    id: 'q_therm_2',
    event: 'Thermodynamics',
    subtopic: 'Heat Transfer',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which mode of heat transfer is primarily responsible for the heating of the Earth by the Sun?',
    options: ['Conduction', 'Convection', 'Radiation', 'Advection'],
    correctAnswer: 'Radiation',
    explanation: 'Radiation is the only mode of heat transfer that can occur through the vacuum of space, via electromagnetic waves.',
    year: 2022,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_3',
    event: 'Thermodynamics',
    subtopic: 'Thermodynamic Processes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'An adiabatic process is characterized by:',
    options: ['Constant volume', 'Constant pressure', 'Constant temperature', 'No heat exchange with the surroundings'],
    correctAnswer: 'No heat exchange with the surroundings',
    explanation: 'In an adiabatic process, Q = 0, meaning no heat is added to or removed from the system.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Circuit Lab
  {
    id: 'q_cl_2',
    event: 'Circuit Lab',
    subtopic: 'DC Circuits',
    division: 'Both',
    type: 'FRQ',
    difficulty: 'Medium',
    question: 'State Ohm\'s Law formula.',
    correctAnswer: 'V = I * R',
    keywords: ['V=IR', 'V = I * R', 'Voltage = Current x Resistance', 'V = IR'],
    explanation: 'Ohm\'s law relates Voltage (V), Current (I), and Resistance (R).',
    year: 2024,
    tournament: 'Regional'
  },
  {
    id: 'q_cl_3',
    event: 'Circuit Lab',
    subtopic: 'Digital Logic',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which logic gate outputs a 1 ONLY when both of its inputs are 1?',
    options: ['OR', 'AND', 'XOR', 'NAND'],
    correctAnswer: 'AND',
    explanation: 'An AND gate only outputs true (1) if all its inputs are true (1).',
    year: 2022,
    tournament: 'State'
  },
  // MORE Boomilever
  {
    id: 'q_bl_2',
    event: 'Boomilever',
    subtopic: 'Structural Engineering',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which wood is most commonly used by teams for building Boomilevers due to its high strength-to-weight ratio?',
    options: ['Oak', 'Balsa', 'Pine', 'Maple'],
    correctAnswer: 'Balsa',
    explanation: 'Balsa wood is lightweight but has an excellent strength-to-weight ratio, making it ideal for Science Olympiad structural events.',
    year: 2021,
    tournament: 'Regional'
  },
  // MORE Electric Vehicle
  {
    id: 'q_ev_2',
    event: 'Electric Vehicle',
    subtopic: 'Physics',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'Explain the purpose of using a relay or a MOSFET in an EV braking circuit.',
    correctAnswer: 'A relay or MOSFET acts as an electronic switch to quickly apply a short circuit across the motor terminals (or apply reverse voltage). This causes dynamic braking, stopping the vehicle rapidly and accurately.',
    keywords: ['switch', 'dynamic braking', 'short circuit', 'stop', 'current', 'motor'],
    explanation: 'Relays/MOSFETs are used to control high current to the motor and to implement active/dynamic braking by shorting the motor leads.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Mission Possible
  {
    id: 'q_mp_2',
    event: 'Mission Possible',
    subtopic: 'Energy Conversions',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'A marble rolling down a track and hitting a switch that completes a circuit is an example of what energy conversion?',
    options: ['Electrical to Kinetic', 'Kinetic to Electrical', 'Potential to Chemical', 'Thermal to Kinetic'],
    correctAnswer: 'Kinetic to Electrical',
    explanation: 'The kinetic energy of the rolling marble triggers the switch, which allows electrical energy to flow through the circuit.',
    year: 2022,
    tournament: 'Regional'
  },
  // MORE Wright Stuff
  {
    id: 'q_ws_2',
    event: 'Wright Stuff',
    subtopic: 'Aerodynamics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the primary function of adding dihedral to the main wing of a free-flight aircraft?',
    options: ['To increase maximum lift', 'To reduce drag', 'To provide roll stability', 'To increase the speed of the aircraft'],
    correctAnswer: 'To provide roll stability',
    explanation: 'Dihedral (the upward angle of the wings from the fuselage) helps the aircraft automatically stabilize its roll axis during flight.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Codebusters
  {
    id: 'q_cb_2',
    event: 'Codebusters',
    subtopic: 'Cryptanalysis',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'Which of the following letters is statistically the most frequently used in the English language, making it a primary target in aristocrat ciphers?',
    options: ['A', 'E', 'I', 'T'],
    correctAnswer: 'E',
    explanation: 'The letter E is the most common letter in the English language, followed by T, A, O, I, N, S, H, R.',
    year: 2024,
    tournament: 'Regional'
  },
  {
    id: 'q_cb_3',
    event: 'Codebusters',
    subtopic: 'Math Ciphers',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'In an Affine cipher where E(x) = (ax + b) mod 26, what condition must "a" satisfy for the cipher to be decipherable?',
    correctAnswer: '"a" must be coprime to 26 (i.e., gcd(a, 26) = 1).',
    keywords: ['coprime', 'gcd', 'greatest common divisor', 'relatively prime', '1'],
    explanation: 'For the Affine cipher to have an inverse function, the multiplier "a" must not share any common factors with 26 other than 1. Since 26 = 2 * 13, "a" cannot be even or a multiple of 13.',
    year: 2023,
    tournament: 'National'
  },
  // MORE Engineering CAD
  {
    id: 'q_ecad_2',
    event: 'Engineering CAD',
    subtopic: 'CAD Basics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'In 3D CAD modeling, what operation creates a 3D solid by extending a 2D sketch along a straight line?',
    options: ['Revolve', 'Sweep', 'Extrude', 'Loft'],
    correctAnswer: 'Extrude',
    explanation: 'Extruding takes a 2D profile and pushes it along a linear path to create a 3D shape. Revolve spins it around an axis, Sweep follows a drawn path, and Loft transitions between multiple profiles.',
    year: 2022,
    tournament: 'State'
  },
  // MORE Ping-Pong Parachute
  {
    id: 'q_ppp_2',
    event: 'Ping-Pong Parachute',
    subtopic: 'Physics',
    division: 'Both',
    type: 'FRQ',
    difficulty: 'Medium',
    question: 'Why is a vent hole often cut into the center of a parachute canopy?',
    correctAnswer: 'A vent hole allows trapped air to escape from the center, which increases the stability of the parachute and prevents it from oscillating (swinging back and forth) heavily.',
    keywords: ['stability', 'oscillating', 'swinging', 'air to escape', 'spilling'],
    explanation: 'Without a vent hole, air spills out randomly from the edges of the canopy, causing violent rocking or oscillation. The vent hole guides air out smoothly, stabilizing the descent.',
    year: 2023,
    tournament: 'Regional'
  },
  // MORE Microbe Mission
  {
    id: 'q_mm_1',
    event: 'Microbe Mission',
    subtopic: 'Microscopy',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'When using a compound light microscope, what is the total magnification if the ocular lens is 10x and the objective lens is 40x?',
    options: ['40x', '50x', '100x', '400x'],
    correctAnswer: '400x',
    explanation: 'Total magnification is calculated by multiplying the magnification of the ocular lens (10x) by the objective lens (40x), which equals 400x.',
    year: 2021,
    tournament: 'Regional'
  },
  {
    id: 'q_mm_2',
    event: 'Microbe Mission',
    subtopic: 'Bacteria',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following structures is responsible for the transfer of plasmids between bacteria during conjugation?',
    options: ['Flagella', 'Cilia', 'Pili', 'Capsule'],
    correctAnswer: 'Pili',
    explanation: 'Specialized pili, called sex pili, form a physical connection between two bacteria to allow the transfer of genetic material (plasmids) during conjugation.',
    year: 2022,
    tournament: 'State'
  },
  // MORE Ecology
  {
    id: 'q_eco_1',
    event: 'Ecology',
    subtopic: 'Population Dynamics',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'In the logistic growth model, what term describes the maximum population size that an environment can support?',
    options: ['Intrinsic rate of increase', 'Carrying capacity', 'Biotic potential', 'Limiting factor'],
    correctAnswer: 'Carrying capacity',
    explanation: 'Carrying capacity (K) is the maximum number of individuals of a particular species that the environment can sustain indefinitely.',
    year: 2024,
    tournament: 'Regional'
  },
  {
    id: 'q_eco_2',
    event: 'Ecology',
    subtopic: 'Biomes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which biome is characterized by very low precipitation, extreme temperature fluctuations, and plants adapted to conserve water (like CAM plants)?',
    options: ['Tundra', 'Desert', 'Taiga', 'Savanna'],
    correctAnswer: 'Desert',
    explanation: 'Deserts have extremely low rainfall and wide temperature variations. CAM (Crassulacean Acid Metabolism) photosynthesis is a common adaptation in desert plants to minimize water loss.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Fossils
  {
    id: 'q_fos_1',
    event: 'Fossils',
    subtopic: 'Paleontology',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which geologic era is often referred to as the "Age of Reptiles"?',
    options: ['Paleozoic', 'Mesozoic', 'Cenozoic', 'Precambrian'],
    correctAnswer: 'Mesozoic',
    explanation: 'The Mesozoic Era (Triassic, Jurassic, Cretaceous periods) was dominated by dinosaurs and other reptiles.',
    year: 2022,
    tournament: 'Regional'
  },
  // MORE Geologic Mapping
  {
    id: 'q_gm_1',
    event: 'Geologic Mapping',
    subtopic: 'Topography',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'On a topographic map, what does it mean when contour lines are very close together?',
    options: ['The area is very flat', 'The area has a steep slope', 'There is a river or stream', 'There is a depression or sinkhole'],
    correctAnswer: 'The area has a steep slope',
    explanation: 'Closely spaced contour lines indicate a rapid change in elevation over a short distance, meaning a steep slope or cliff.',
    year: 2023,
    tournament: 'State'
  },
  // MORE Ornithology
  {
    id: 'q_orn_1',
    event: 'Ornithology',
    subtopic: 'Bird Identification',
    division: 'Both',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which anatomical feature is unique to birds and found in no other living animal group?',
    options: ['A four-chambered heart', 'Feathers', 'Warm-blooded metabolism', 'Amniotic eggs'],
    correctAnswer: 'Feathers',
    explanation: 'While mammals also have 4-chambered hearts and are warm-blooded, and reptiles lay amniotic eggs, only birds possess feathers among extant species.',
    year: 2021,
    tournament: 'Regional'
  },
  // MORE Optics
  {
    id: 'q_opt_1',
    event: 'Optics',
    subtopic: 'Geometric Optics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'If an object is placed exactly at the focal point of a converging (convex) lens, where will the image form?',
    options: ['At the focal point on the other side', 'At twice the focal length', 'At infinity (no clear image forms)', 'Halfway between the lens and the focal point'],
    correctAnswer: 'At infinity (no clear image forms)',
    explanation: 'When an object is placed at the focal point of a converging lens, the refracted light rays are parallel, so they never converge to form a real image (they meet at infinity).',
    year: 2024,
    tournament: 'National'
  }
];

export const questionBank: Question[] = accurateQuestions;

export const getQuestionsByEvent = (event: string): Question[] => {
  return questionBank.filter(q => q.event === event);
};

export const getQuestionsBySubtopic = (event: string, subtopic: string): Question[] => {
  return questionBank.filter(q => q.event === event && q.subtopic === subtopic);
};

// Auto extract unique events and subtopics based on actual questions
export const getAllEvents = (): string[] => {
  const events = new Set(questionBank.map(q => q.event));
  return Array.from(events).sort();
};

export const getAllSubtopics = (): Record<string, string[]> => {
  const subtopicsDict: Record<string, Set<string>> = {};
  
  questionBank.forEach(q => {
    if (!subtopicsDict[q.event]) {
      subtopicsDict[q.event] = new Set();
    }
    subtopicsDict[q.event].add(q.subtopic);
  });
  
  const result: Record<string, string[]> = {};
  for (const event in subtopicsDict) {
    result[event] = Array.from(subtopicsDict[event]).sort();
  }
  
  return result;
};

export const getSubtopicList = (event: string): string[] => {
  const all = getAllSubtopics();
  return all[event] || ['General'];
};
