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
    explanation: 'Terminal velocity depends on mass, gravity, air density, drag coefficient, and cross-sectional area. Color has no effect on aerodynamics.',
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
