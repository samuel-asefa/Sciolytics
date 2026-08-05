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
    event: 'Ping Pong Parachute',
    subtopic: 'Physics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which factor does NOT directly affect the terminal velocity of a falling parachute?',
    options: ['Surface area of the canopy', 'Mass of the payload', 'Air density', 'Color of the parachute'],
    correctAnswer: 'Color of the parachute',
    explanation: 'Terminal velocity depends on mass, gravity, air density, drag coefficient, and cross-sectional area. Color has no effect on aerodynamics.',
  },
  {
    id: 'q_therm_c_2019_1',
    event: 'Thermodynamics',
    subtopic: 'History',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Who is considered to be the father of thermodynamics?',
    options: [
      'Sadi Carnot',
      'James Watt',
      'J. Willard Gibbs',
      'Isaac Newton',
      'James Joule'
    ],
    correctAnswer: 'Sadi Carnot',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_2',
    event: 'Thermodynamics',
    subtopic: 'History',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'When was the first thermometer created?',
    options: [
      '1597',
      '1654',
      '1724',
      '1856'
    ],
    correctAnswer: '1856',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_3',
    event: 'Thermodynamics',
    subtopic: 'History',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which one of these is no longer supported and has been replaced?',
    options: [
      'Kinetic Theory',
      'Principle of Conservation of Mass',
      'Caloric Theory',
      'Principle of Conservation of Energy'
    ],
    correctAnswer: 'Caloric Theory',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_4',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Phase Diagram] Which of the following letters corresponds to the triple point of the substance?',
    options: [
      'C',
      'D',
      'B',
      'E'
    ],
    correctAnswer: 'D',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_5',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Phase Diagram] Which of the following letters corresponds to the gas phase of the substance?',
    options: [
      'A',
      'B',
      'C',
      'D'
    ],
    correctAnswer: 'B',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_6',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Phase Diagram] What is the normal boiling point of the substance?',
    options: [
      '1 atmosphere',
      '100°C',
      '60°C',
      '0.5 atmosphere'
    ],
    correctAnswer: '100°C',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_7',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Phase Diagram] What is the normal melting point of the substance?',
    options: [
      '0.5 atmosphere',
      '1 atmosphere',
      '60°C',
      '100°C'
    ],
    correctAnswer: '60°C',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_8',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Phase Diagram] What process occurs when the substance moves from region A to region B?',
    options: [
      'Melting/Fusion',
      'Vaporization',
      'Deposition',
      'Sublimation'
    ],
    correctAnswer: 'Sublimation',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_9',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Phase Diagram] What process occurs when the substance moves from region B to C?',
    options: [
      'Melting/fusion',
      'Vaporization',
      'Condensation',
      'Freezing'
    ],
    correctAnswer: 'Condensation',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_10',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Heating Curve] Which of the following segments corresponds to the liquid phase?',
    options: [
      'DE',
      'BC',
      'AB',
      'CD'
    ],
    correctAnswer: 'CD',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_11',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Heating Curve] Which of the following segments corresponds to the process of freezing?',
    options: [
      'B to C',
      'C to B',
      'E to D',
      'D to E'
    ],
    correctAnswer: 'C to B',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_12',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: '[Refer to Heating Curve] Which of the following segments require a latent heat?',
    options: [
      'EF',
      'AB',
      'CD',
      'BC'
    ],
    correctAnswer: 'BC',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_13',
    event: 'Thermodynamics',
    subtopic: 'Phase Changes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following phases are easily compressible?',
    options: [
      'Gases',
      'Liquids',
      'Solids',
      'A and B'
    ],
    correctAnswer: 'Gases',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_14',
    event: 'Thermodynamics',
    subtopic: 'Calorimetry',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'How much heat is required to heat a 17 g block of ice from -38°C to 17 g of steam at 113°C? Use ΔH(vap)=40.8 kJ/mol and ΔH(fus)=6.0 kJ/mol and C(ice)=2.108 J/(g°C) and C(steam)=1.996 J/(g°C).',
    options: [
      '804.52 kJ',
      '8.96 kJ',
      '9.71 kJ',
      '53.11 kJ'
    ],
    correctAnswer: '53.11 kJ',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_15',
    event: 'Thermodynamics',
    subtopic: 'Heat Transfer',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following kinds of heat transfer occurs when there is direct contact involved?',
    options: [
      'Conduction',
      'Convection',
      'Radiation',
      'More than one of the above'
    ],
    correctAnswer: 'Conduction',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_16',
    event: 'Thermodynamics',
    subtopic: 'Heat Transfer',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following kinds of heat transfer relies on heat rising?',
    options: [
      'Radiation',
      'Conduction',
      'Convection',
      'More than one of the above'
    ],
    correctAnswer: 'Convection',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_17',
    event: 'Thermodynamics',
    subtopic: 'Heat Transfer',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'What is the heat flux for a 6 m x 12 m sheet of glass that is 2 cm thick and is 20°C on one side and 60°C on the other side? Use 0.96 W/(m K) for the thermal conductivity constant for glass.',
    options: [
      '1920 W/m²',
      '55.296 W',
      '0.533 W/m³',
      '0.768 W/m²'
    ],
    correctAnswer: '1920 W/m²',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_18',
    event: 'Thermodynamics',
    subtopic: 'Thermodynamic Processes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which one of these is not one of the steps of the Carnot Cycle?',
    options: [
      'Adiabatic compression',
      'Isothermal expansion',
      'Isovolumetric expansion',
      'None of the above'
    ],
    correctAnswer: 'Isovolumetric expansion',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_19',
    event: 'Thermodynamics',
    subtopic: 'Thermodynamic Processes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the efficiency of a Carnot Cycle that has temperatures of 37°C and 63°C?',
    options: [
      '70.3%',
      '26.0%',
      '58.7%',
      '41.3%'
    ],
    correctAnswer: '41.3%',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_20',
    event: 'Thermodynamics',
    subtopic: 'Thermodynamic Processes',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which one of the following is described by a constant volume?',
    options: [
      'Isovolumetric',
      'Isobaric',
      'Isochoric',
      'More than one of the above'
    ],
    correctAnswer: 'More than one of the above',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_21',
    event: 'Thermodynamics',
    subtopic: 'Laws of Thermodynamics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following statements is not part of the laws of thermodynamics?',
    options: [
      'Two systems in thermal equilibrium with a third are in equilibrium with each other.',
      'The entropy of a system approaches a constant as temperature approaches absolute zero.',
      'Mass can neither be created nor destroyed.',
      'The entropy of an isolated system always increases.'
    ],
    correctAnswer: 'Mass can neither be created nor destroyed.',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_22',
    event: 'Thermodynamics',
    subtopic: 'Entropy and Free Energy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Which of the following reactions would be predicted to be spontaneous at relatively high temperatures but nonspontaneous at relatively low temperatures?',
    options: [
      'An endothermic reaction with ΔS°reaction < 0',
      'An exothermic reaction with ΔS°reaction > 0',
      'An endothermic reaction with ΔS°reaction > 0',
      'An exothermic reaction with ΔSreaction < 0'
    ],
    correctAnswer: 'An endothermic reaction with ΔS°reaction > 0',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_23',
    event: 'Thermodynamics',
    subtopic: 'Entropy and Free Energy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'If someone left the valve to a hydrogen gas tank open in a lab so that the partial pressures of H2 and N2 (in the air) in the lab both reached 0.50 atm, would the following reaction forming highly toxic liquid hydrazine (N2H4) become a concern (is the following reaction spontaneous at 25°C given these partial pressures?) 2H2(g) + N2(g) <--> N2H4(l) ΔG°reaction = 149 kJ/mol',
    options: [
      'Yes concern because Qp > Kp and ΔG < 0',
      'No concern because Qp > Kp and ΔG > 0',
      'Yes concern because Qp < Kp and ΔG < 0',
      'No concern because Qp < Kp and ΔG > 0'
    ],
    correctAnswer: 'No concern because Qp > Kp and ΔG > 0',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_24',
    event: 'Thermodynamics',
    subtopic: 'Entropy and Free Energy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following statements is false?',
    options: [
      'If ΔG° > 0 for a reaction at some temperature, that reaction is product-favored and Keq > 1 at that temperature',
      'If ΔG > 0, ΔG represents the minimum work that must be done to the system for it to produce product(s)',
      'If ΔG° = 0, then ΔG can be either =0, >0 or <0',
      'ΔG is based upon the difference between Keq and Q of a reaction system at some temperature T'
    ],
    correctAnswer: 'If ΔG° > 0 for a reaction at some temperature, that reaction is product-favored and Keq > 1 at that temperature',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_25',
    event: 'Thermodynamics',
    subtopic: 'Entropy and Free Energy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Hard',
    question: 'Consider the following system which has been shown to be spontaneous at 298 K and select the true statement below: N2 + 3H2 -> 2NH3',
    options: [
      'ΔSsys < 0 so ΔSsurr > 0 to a greater extent and ΔSuniv > 0.',
      'ΔSsys > 0, so ΔSsurr > 0 and ΔSuniv > 0.',
      'ΔSsys > 0, so ΔSsurr < 0 to a lesser extent and ΔSuniv > 0.',
      'ΔSsys < 0, so ΔSsurr > 0 to a lesser extent and ΔSuniv < 0'
    ],
    correctAnswer: 'ΔSsys < 0 so ΔSsurr > 0 to a greater extent and ΔSuniv > 0.',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_26',
    event: 'Thermodynamics',
    subtopic: 'Laws of Thermodynamics',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'A spontaneous process must lead to:',
    options: [
      'A net decrease in the entropy of the universe',
      'A net increase in the entropy of the universe',
      'A decrease in the entropy of the surroundings',
      'An increase in the entropy of the system'
    ],
    correctAnswer: 'A net increase in the entropy of the universe',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_27',
    event: 'Thermodynamics',
    subtopic: 'Entropy and Free Energy',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'If a reaction is non-spontaneous and ΔS°sys > 0 at 25°C select the true statement about the reaction.',
    options: [
      'ΔSsurr < 0',
      'ΔSuniv > 0',
      '(ΔSsys + ΔSsurr) > 0',
      'None of the above'
    ],
    correctAnswer: 'ΔSsurr < 0',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_28',
    event: 'Thermodynamics',
    subtopic: 'Units and Conversions',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'Which of the following is equal to 1 kilocalorie?',
    options: [
      '4,184 kJ',
      '4.184 J',
      '4,184 J',
      '1000 Calories'
    ],
    correctAnswer: '4,184 J',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_29',
    event: 'Thermodynamics',
    subtopic: 'Units and Conversions',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Easy',
    question: '300°C is equal to which of the following?',
    options: [
      '557.14 Romer',
      '26.85 Kelvin',
      '148.89 Fahrenheit',
      '1031.67 Rankine'
    ],
    correctAnswer: '1031.67 Rankine',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_30',
    event: 'Thermodynamics',
    subtopic: 'Heat Transfer',
    division: 'C',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the radiant exitance of a real surface with a temperature of 1367 K and an emissivity of 0.88?',
    options: [
      '1.74*10^5 W/m²',
      '1.98*10^5 W/m²',
      '6.82*10^-5 W/m²',
      '7.75*10^-5 W/m²'
    ],
    correctAnswer: '1.74*10^5 W/m²',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_31',
    event: 'Thermodynamics',
    subtopic: 'Calorimetry',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: '102.5 g of water at 65.6°C is mixed with 102.5 g of water, already in the coffee cup calorimeter, at 18.5°C. The final temperature of the water is 35.0°C. Calculate the heat capacity of the calorimeter in J/K',
    correctAnswer: '366.5 J/K',
    explanation: 'q(out) = 102.5 g * 4.184 J/(g°C) * (65.6°C - 35.0°C). q(in) = 102.5 g * 4.184 J/(g°C) * (35.0°C - 18.5°C). q(cal) = C(cal) * (35°C - 18.5°C). q(out) - q(in) = q(cal) = C(cal) * ΔT(cal). C(cal) = (q(out) - q(in)) / ΔT(cal) = 6046.9 J / 16.5 K = 366.5 J/K.',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_32',
    event: 'Thermodynamics',
    subtopic: 'Calorimetry',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: '139 g of an unknown sample was heated to 96.4°C and placed into a calorimeter containing 70.9 g of water at 20.0°C. The heat capacity of the calorimeter was 12.6 J/K The final temperature in the calorimeter was 23.7°C. What is the specific heat (in J/(g°C)) of the sample?',
    correctAnswer: '0.1132 J/(g°C)',
    explanation: 'q(out) = 139 g * C * (96.4°C - 23.7°C). q(in) = 70.9 g * 4.184 J/(g°C) * (23.7°C - 20°C). q(cal) = 12.6 J/K * (23.7°C - 20°C). q(out) - q(in) = q(cal). 10105.3 * C - 1097.6 = 46.62. C = 0.1132 J/(g°C).',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_33',
    event: 'Thermodynamics',
    subtopic: 'Calorimetry',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'When 34.2 mL of 0.500 M HCl at 25.0°C is added to 62.4 mL of 0.500 M NaOH at 25.0°C in a coffee-cup calorimeter, the temperature of the mixture rises to 28.2°C What is the heat of reaction per mole of NaCl (in kJ/mol)? Assume the mixture has a specific heat capacity of 4.18 J/ (g K) and that the densities of the reactant solutions are both 1.07 g/mL.',
    correctAnswer: '-80.93 kJ/mol',
    explanation: 'q(rxn) = -q(soln) = -mCΔT = -(62.4 mL + 34.2 mL) * 1.07 g/mL * 4.184 J/(g°C) * (28.2°C - 25°C). mol NaCl = 34.2 mL * (1 L / 1000 mL) * 0.5 mol/L. ΔHrxn = q(rxn) / mol NaCl = -1383.89 J / 0.0171 mol = -80.93 kJ/mol.',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_34',
    event: 'Thermodynamics',
    subtopic: 'Calorimetry',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'When 15.1 g KOH is dissolved in 100.4 g of water in a coffee-cup calorimeter, the temperature rises from 19°C to 31.64°C. What is the enthalpy change per gram (in J/g) of KOH dissolved in the water?',
    correctAnswer: '-404.52 J/g',
    explanation: 'q(rxn) = -q(soln) = -mCΔT = -(100.4 g + 15.1 g) * 4.184 J/(g°C) * (31.64°C - 19°C). ΔHrxn = q(rxn) / g KOH = -6108.31 J / 15.1 g KOH = -404.52 J/g.',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_35',
    event: 'Thermodynamics',
    subtopic: 'Calorimetry',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'In a bomb calorimeter compartment surrounded by 1.357 kg of water, the combustion of 1.351 g of benzene C6H6 (l) raised the temperature of the water from 23.640°C to 32.692°C The heat capacity of the calorimeter is 0.885 kJ/ °C. What is ΔE for the reaction in kJ/mol of C6H6 (l)?',
    correctAnswer: '-3433.8 kJ/mol',
    explanation: 'q(soln) = 1.357 kg * 1000 g/kg * 4.184 J/(g°C) * (32.692°C - 23.64°C). q(cal) = 0.885 kJ/°C * 1000 J/kJ * (32.692°C - 23.64°C). q(rxn) = -(q(soln) + q(cal)). ΔE(rxn) = q(rxn) / mol C6H6 = -(51,394.4 J + 8,011.02 J) / 0.0173 mol C6H6 = -3433.8 kJ/mol.',
    year: 2019,
    tournament: 'Regional'
  },
  {
    id: 'q_therm_c_2019_36',
    event: 'Thermodynamics',
    subtopic: 'Entropy and Free Energy',
    division: 'C',
    type: 'FRQ',
    difficulty: 'Hard',
    question: 'The standard molar entropy of vaporization (ΔS°vap) for benzene is 88 J/ (mol K) at 25°C. Consider this information, along with the following standard molar enthalpies of formation (ΔH°f) for benzene at 25°C, and estimate the normal boiling point of benzene. (ΔH°f [C6H6 (l)] = 49 kJ/mol, ΔH°f [C6H6 (g)] = 80 kJ/mol).',
    correctAnswer: '79.27°C',
    explanation: 'ΔH°(vap) = ΔH°f(g) - ΔH°f(l) = 80 - 49 = 31 kJ/mol = 31000 J/mol. At boiling point, ΔG° = ΔH° - TΔS° = 0. T = ΔH° / ΔS° = 31000 (J/mol) / 88 (J/(mol K)) = 352.27 K = 79.27°C.',
    year: 2019,
    tournament: 'Regional'
  }
,
  {
    "id": "q_chem_2025_ssss_1a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "A student performs a lab experiment about MgCl2 and Na2SO4. What is the balanced chemical equation?",
    "correctAnswer": "MgCl2 (aq) + Na2SO4 (aq) -> MgSO4 (s) + 2NaCl (aq)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_1b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "A student performs a lab experiment about MgCl2 and Na2SO4. If the student combines 1 mole of MgCl2 and 1 mole of Na2SO4, what will be the percent composition MgCl2 in the mixture?",
    "correctAnswer": "40.15%",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_1c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "A student performs a lab experiment about MgCl2 and Na2SO4. If the student makes a mixture of 5 moles of MgCl2 and 1 mole of Na2SO4, what will be the new percent composition of MgCl2?",
    "correctAnswer": "77.05%",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_1d",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "A student performs a lab experiment about MgCl2 and Na2SO4. The student creates a new mixture that is 20% chlorine by mass, what is the percent mass of MgCl2 in the mixture?",
    "correctAnswer": "26.85%",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_1e",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "A student performs a lab experiment about MgCl2 and Na2SO4. If a mixture that is 20% chlorine by mass weighed 250.00 grams, what was the mass of Na2SO4?",
    "correctAnswer": "182.88 grams Na2SO4",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_2a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Determine the empirical formula for a compound with the following percent composition: 15.8% carbon and 84.2% sulfur",
    "correctAnswer": "CS2",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_2b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Determine the empirical formula for a compound with the following percent composition: 28.03% magnesium, 21.60% silicon, 1.16% hydrogen, and 49.21% oxygen",
    "correctAnswer": "Mg3Si2H3O8",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_2c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Determine the empirical formula for a compound with the following percent composition: 17.66% carbon, 0.74% hydrogen, 69.84% fluoride, and 11.76% oxygen",
    "correctAnswer": "C2HF5O",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_3a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Determine the percent composition for a compound with the following empirical formula: H2SO4",
    "correctAnswer": "2.06% hydrogen, 32.69% sulfur, and 65.25% oxygen",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_3b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Determine the percent composition for a compound with the following empirical formula: Cl2O7",
    "correctAnswer": "38.8% chlorine and 61.2% oxygen",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_3c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Determine the percent composition for a compound with the following empirical formula: NaNO3",
    "correctAnswer": "27% sodium, 16.48% nitrogen, and 56.52% oxygen",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_4a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Consider the reaction between Calcium Chloride and Potassium Hydroxide. Write the balanced chemical equation.",
    "correctAnswer": "CaCl2 (aq) + 2KOH (aq) -> Ca(OH)2 (s) + 2KCl (aq)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_4b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Consider the reaction between Calcium Chloride and Potassium Hydroxide. Write the net ionic equation.",
    "correctAnswer": "Ca2+ (aq) + 2OH- (aq) -> Ca(OH)2 (s)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_4c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Consider the reaction between Calcium Chloride and Potassium Hydroxide. In the given reaction, how many grams of Calcium Chloride would it take to create 30.00 grams of Calcium Hydroxide?",
    "correctAnswer": "44.93 grams CaCl2",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_4d",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Consider the reaction between Calcium Chloride and Potassium Hydroxide. Given 50.00 grams of KOH, how many grams of each product are made?",
    "correctAnswer": "33.01 grams Ca(OH)2 and 66.43 grams KCl",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_4e",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Consider the reaction between Calcium Chloride and Potassium Hydroxide. Assuming the reaction goes to completion, what is the excess reactant and how much of it remains given 30 grams of Calcium Chloride and 50 grams of Potassium Hydroxide?",
    "correctAnswer": "19.66 grams KOH",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_4f",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Easy",
    "question": "Consider the reaction between Calcium Chloride and Potassium Hydroxide. What type of reaction is this?",
    "correctAnswer": "Double replacement reaction",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_5a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Use the combustion of butane (C4H10). What is the balanced combustion reaction equation?",
    "correctAnswer": "2C4H10 (g) + 13O2 (g) -> 8CO2 (g) + 10H2O (g)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_5b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "A small tank contains 17.8 liters of butane. How many grams of fuel is this? (The density of butane is 2.48 g/L).",
    "correctAnswer": "44.14 grams C4H10",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_5c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "A small tank contains 17.8 liters of butane (density = 2.48 g/L). How many grams of oxygen gas is needed to combust this much butane?",
    "correctAnswer": "157.87 grams O2",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_5d",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "How many grams of carbon dioxide will be released by burning a 17.8 L tank of butane (density = 2.48 g/L) with excess oxygen gas?",
    "correctAnswer": "133.7 grams CO2",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_5e",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "Is the combustion of butane an exothermic or endothermic reaction?",
    "options": [
      "Exothermic",
      "Endothermic"
    ],
    "correctAnswer": "Exothermic",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_6a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Balance the following oxidation-reduction reaction: MnO4-(aq) + C2O4 2-(aq) -> MnO2 (s) + CO2 (g)",
    "correctAnswer": "3C2O4 2- (aq) + 2MnO4 - (aq) + 4H2O (l) -> 6CO2 (g) + 2MnO2 (s) + 8OH- (aq)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_6b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Balance the following oxidation-reduction reaction: Cr2O7 2-(aq) + C2O4 2-(aq) -> Cr+3 (aq) + CO2 (aq)",
    "correctAnswer": "14H+ (aq) + Cr2O7 2- (aq) + 3C2O4 2- (aq) -> 2Cr3+ (aq) + 6CO2 (g) + 7H2O (l)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_6c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Balance the following oxidation-reduction reaction: Br2 (l) + OH- (aq) -> BrO3 - (aq) + Br- (aq)",
    "correctAnswer": "3Br2 (l) + 6OH- (aq) -> BrO3 - (aq) + 5Br- (aq) + 3H2O (l)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_6d",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Balance the following oxidation-reduction reaction: Sn (s) + NO3- (aq) -> SnO2 (s) + NO2 (g)",
    "correctAnswer": "Sn(s) + 4H+ (aq) + 4NO3 - (aq) -> SnO2 (s) + 4NO2 (g) + 2H2O (l)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_7a",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "Identify what type of reaction it is: 2H2 + O2 -> 2H2O",
    "options": [
      "Synthesis",
      "Decomposition",
      "Single replacement",
      "Double replacement",
      "Combustion"
    ],
    "correctAnswer": "Synthesis",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_7b",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "Identify what type of reaction it is: CaCO3 -> CaO + CO2",
    "options": [
      "Synthesis",
      "Decomposition",
      "Single replacement",
      "Double replacement",
      "Combustion"
    ],
    "correctAnswer": "Decomposition",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_7c",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "Identify what type of reaction it is: Zn + 2HCl -> ZnCl2 + H2",
    "options": [
      "Synthesis",
      "Decomposition",
      "Single replacement",
      "Double replacement",
      "Combustion"
    ],
    "correctAnswer": "Single replacement",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_7d",
    "event": "Chemistry Lab",
    "subtopic": "Chemical Reactions/Stoichiometry",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "Identify what type of reaction it is: NaCl + AgNO3 -> AgCl + NaNO3",
    "options": [
      "Synthesis",
      "Decomposition",
      "Single replacement",
      "Double replacement",
      "Combustion"
    ],
    "correctAnswer": "Double replacement",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_8a",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "Use the following data gathered from several experiments:\nNH4+(aq) + NO2-(aq) -> N2 (g) + 2H2O (l)\nTrial 1: [NH4+] = 0.25 M, [NO2-] = 0.25 M, Rate = 1.25 x 10^-3 M/s\nTrial 2: [NH4+] = 0.5 M, [NO2-] = 0.25 M, Rate = 2.5 x 10^-3 M/s\nTrial 3: [NH4+] = 0.25 M, [NO2-] = 0.125 M, Rate = 3.125 x 10^-4 M/s\nWhat will the new rate be if a 4th trial is conducted with 0.5 M [NH4+] and 0.5 M [NO2-]?",
    "correctAnswer": "1.0 x 10^-2 M/s",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_8b",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Based on the previous data (NH4+ is 1st order, NO2- is 2nd order), if the initial concentration is doubled for NH4+ but cut in half for NO2-, how will the rate of reaction change?",
    "correctAnswer": "The rate is halved",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_8c",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "If a 4th trial is done with the same concentration of NH4+ as the first trial (0.25 M), and it is found that the rate is 1.125 x 10^-2 M/s, how was the concentration of NO2- changed? (Recall Trial 1: [NO2-] = 0.25 M, Rate = 1.25 x 10^-3 M/s)",
    "correctAnswer": "It was tripled (0.75 M)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_8d",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "What is the numerical value of k for the reaction (NH4+ is 1st order, NO2- is 2nd order)? Trial 1: [NH4+] = 0.25 M, [NO2-] = 0.25 M, Rate = 1.25 x 10^-3 M/s",
    "correctAnswer": "k=0.08 M-2 s-1",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_8e",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Easy",
    "question": "Of what order is the above reaction (NH4+ is 1st order, NO2- is 2nd order)?",
    "correctAnswer": "Third order",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_9a",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "Choose the answer choice that correctly identifies AND explains why the following change will affect the rate of a reaction: Increasing the pressure",
    "options": [
      "Increase the rate of reaction because there are more particles closer together, leading to more frequent collisions.",
      "Decrease the rate of reaction because particles no longer have enough space to move or collide.",
      "Increase the rate of reaction because an increase in pressure means that an increase in temperature must have occurred.",
      "Decrease the rate of reaction because energy must be removed from the system in order to increase the pressure."
    ],
    "correctAnswer": "Increase the rate of reaction because there are more particles closer together, leading to more frequent collisions.",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_9b",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "Choose the answer choice that correctly identifies AND explains why the following change will affect the rate of a reaction: Large surface area",
    "options": [
      "Increase the rate of reaction because masses with large unconventional shapes mean they must have faster reaction rates than typical masses with normal shapes.",
      "Decrease the rate of reaction because a larger surface area means colliding molecules have more area that needs to collide correctly in order to successfully cause a reaction.",
      "Increase the rate of reaction because this creates more particles open with opportunities available for successful collisions with other particles.",
      "Decrease the rate of reaction because a larger surface area means the particle has more mass, making it slower and have less energy."
    ],
    "correctAnswer": "Increase the rate of reaction because this creates more particles open with opportunities available for successful collisions with other particles.",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_9c",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "Choose the answer choice that correctly identifies AND explains why the following change will affect the rate of a reaction: Increasing the temperature",
    "options": [
      "Decrease the rate of reaction because all of that temperature will make particles tired, and they won’t feel like moving",
      "Increase the rate of reaction because an increase in temperature is an increase in energy, which gives more particles on average enough energy to successfully cause a reaction.",
      "Increase the rate of reaction because higher temperatures mean all the particles will now have the same energy enough to cause a reaction.",
      "Decrease the rate of reaction because it will increase the activation energy as well, leading to fewer particles having enough energy to successfully react."
    ],
    "correctAnswer": "Increase the rate of reaction because an increase in temperature is an increase in energy, which gives more particles on average enough energy to successfully cause a reaction.",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_9d",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "Choose the answer choice that correctly identifies AND explains why the following change will affect the rate of a reaction: Presence of a catalyst",
    "options": [
      "Increase the rate of reaction because the catalyst increases the amount of energy, and so more particles have enough energy to successfully react.",
      "Decrease the rate of reaction because a catalyst slows particles down, decreasing the likelihood of a successful reaction.",
      "Decrease the rate of reaction because the catalyst increases pressure and gets in the way of reactants.",
      "Increase the rate of reaction because the catalyst lowers the amount of energy reactants needs to successfully collide."
    ],
    "correctAnswer": "Increase the rate of reaction because the catalyst lowers the amount of energy reactants needs to successfully collide.",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_9e",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "Choose the answer choice that correctly identifies AND explains why the following change will affect the rate of a reaction: Decreasing the concentration",
    "options": [
      "Increase the rate of reaction because a lower concentration means there are fewer reactants getting in the way of each other.",
      "Decrease the rate of reaction because the decrease in concentration means the forces pulling them together are weaker.",
      "Increase the rate of reaction because if reactants are further apart, they will get lonely and want to successfully react together more.",
      "Decrease the rate of reaction because fewer particles makes collisions less frequent and means there is a less of a chance of an effective collision between two particles."
    ],
    "correctAnswer": "Decrease the rate of reaction because fewer particles makes collisions less frequent and means there is a less of a chance of an effective collision between two particles.",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10a",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Consider the following steps of a reaction (You may use pre-equilibrium approximation):\nC2H4 + H3O+ -> C2H5+ + H2O (fast)\nC2H5+ + H2O -> C2H5OH2+ (slow)\nC2H5OH2+ + H2O -> C2H5OH + H3O+ (fast)\nWhat is the balanced chemical equation?",
    "correctAnswer": "C2H4 + H2O -> C2H5OH",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10b",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "For the reaction C2H4 + H2O -> C2H5OH, what type of reaction is the balanced reaction?",
    "options": [
      "Synthesis reaction",
      "Decomposition reaction",
      "Single replacement",
      "Double replacement"
    ],
    "correctAnswer": "Synthesis reaction",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10c",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "In the context of this mechanism:\nC2H4 + H3O+ -> C2H5+ + H2O (fast)\nC2H5+ + H2O -> C2H5OH2+ (slow)\nC2H5OH2+ + H2O -> C2H5OH + H3O+ (fast)\nWhat is C2H5+?",
    "options": [
      "A reactant",
      "A product",
      "A catalyst",
      "An intermediate"
    ],
    "correctAnswer": "An intermediate",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10d",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "In the context of this mechanism:\nC2H4 + H3O+ -> C2H5+ + H2O (fast)\nC2H5+ + H2O -> C2H5OH2+ (slow)\nC2H5OH2+ + H2O -> C2H5OH + H3O+ (fast)\nWhat is H3O+?",
    "options": [
      "A reactant",
      "A product",
      "A catalyst",
      "An intermediate"
    ],
    "correctAnswer": "A catalyst",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10e",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Based on the mechanism:\nC2H4 + H3O+ -> C2H5+ + H2O (fast)\nC2H5+ + H2O -> C2H5OH2+ (slow)\nC2H5OH2+ + H2O -> C2H5OH + H3O+ (fast)\nWhat is the reaction order with respect to C2H4?",
    "correctAnswer": "First order with respect to C2H4",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10f",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Based on the mechanism:\nC2H4 + H3O+ -> C2H5+ + H2O (fast)\nC2H5+ + H2O -> C2H5OH2+ (slow)\nWhat is the reaction order with respect to H2O?",
    "correctAnswer": "First order with respect to H2O",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10g",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "Based on the mechanism where C2H4 is first order and H2O is first order, what is the reaction order overall?",
    "correctAnswer": "Second order",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10h",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "If the reaction is first order with respect to C2H4, what would happen to the rate of reaction if the concentration of C2H4 was tripled?",
    "correctAnswer": "The reaction would proceed 3 times faster",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_10i",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "If the reaction is first order with respect to H2O, what will happen to the rate of reaction if the concentration of H2O is increased by 5 times?",
    "correctAnswer": "It will proceed 5 times faster",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_11a",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "A student performed an experiment regarding the decomposition of H2O2 into H2O and O2. The student measured the partial vapor pressure of water to be 0.0313 atm. Assuming total pressure is 1.000 atm and ideal gas conditions, calculate the partial pressure of O2 in atm.",
    "correctAnswer": "0.9687 atm",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_11b",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "From the data:\nTime (s): 0, 30, 60, 90, 120\nVolume O2 (mL): 0, 15.2, 30.5, 45.9, 61.1\nWith partial pressure O2 = 0.9687 atm, what is the average rate of O2 formation in mol/(L*s) for the first minute (0-60s)? (Assume standard temperature 298.15K if needed, but rate depends on calculation from volume vs time).",
    "correctAnswer": "4.02 x 10^-4 mol/L*s",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_11c",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "With a rate of O2 formation of 4.02 x 10^-4 mol/L*s, what would the rate of decomposition of H2O2 be during the same time interval for 2H2O2 (aq) -> 2H2O (l) + O2 (g)?",
    "correctAnswer": "8.04 x 10^-4 mol/L*s",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_11d",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Medium",
    "question": "What is the reason the rate of O2 formation and the rate of H2O2 decomposition are different in the reaction 2H2O2 -> 2H2O + O2?",
    "correctAnswer": "The different molar ratios mean different rates of occurrence. 2 moles of H2O2 are consumed for every 1 mole of O2 created so it disappears twice as fast as O2 appears.",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_11e",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Hard",
    "question": "If the student conducted the experiment at 308.15 K instead of 298.15 K, by what percentage would the rate of reaction increase? (Hint: use the Arrhenius equation and typical values if not provided, or simply match standard expectations for 10K increase)",
    "correctAnswer": "167% faster (2.67x increase)",
    "year": 2025,
    "tournament": "SSSS"
  },
  {
    "id": "q_chem_2025_ssss_bonus_1",
    "event": "Chemistry Lab",
    "subtopic": "Kinetics",
    "division": "C",
    "type": "FRQ",
    "difficulty": "Easy",
    "question": "Why was the catalyst so popular at the party?",
    "correctAnswer": "Because it really sped up the conversation!",
    "year": 2025,
    "tournament": "SSSS"
  }
];

export const questionBank: Question[] = accurateQuestions;

export const getQuestionsByEvent = (event: string): Question[] => {
  return questionBank.filter(q => q.event === event);
};

export const getQuestionsBySubtopic = (event: string, subtopic: string): Question[] => {
  return questionBank.filter(q => q.event === event && q.subtopic === subtopic);
};
export const getAllEvents = (): string[] => [
  // Life, Personal & Social Science
  'Anatomy & Physiology',
  'Botany',
  'Designer Genes',
  'Disease Detectives',
  'Water Quality',
  // Earth & Space Science
  'Astronomy',
  'Dynamic Planet',
  'Remote Sensing',
  'Rocks and Minerals',
  // Physical Science & Chemistry
  'Chemistry Lab',
  'Circuit Lab',
  'Forensics',
  'Hovercraft',
  'Protein Modeling',
  'Thermodynamics',
  // Technology & Engineering Design
  'Boomilever',
  'Electric Vehicle',
  'Mission Possible',
  'Wright Stuff',
  // Inquiry & Nature of Science
  'Codebusters',
  'Engineering CAD',
  'Experimental Design',
  'Ping Pong Parachute',
  // Featured Trial Event
  'Code Craze',
];

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
