export interface WikiContentBlock {
  type: 'paragraph' | 'list' | 'image' | 'heading' | 'table';
  content?: string;
  items?: string[];
  url?: string;
  alt?: string;
  caption?: string;
  level?: 2 | 3;       // for heading blocks
  headers?: string[];  // for table
  rows?: string[][];   // for table
}

export interface WikiSubtopic {
  id: string;
  title: string;
  subsections?: { id: string; title: string }[];
  blocks: WikiContentBlock[];
}

export interface WikiInfobox {
  type?: string;             // Engineering / Study / Hybrid
  category?: string;         // Build / Lab / Trial / Inquiry
  participants?: number;
  eyeProtection?: string;
  impound?: boolean;
  allowedResources?: string[];
  approxTime?: string;
  firstAppearance?: string;
  latestAppearance?: string;
  rotates?: boolean;
  officialLink?: string;
}

export interface EventWiki {
  id: string;
  name: string;
  description: string;
  infobox?: WikiInfobox;
  subtopics: WikiSubtopic[];
}

export const wikiData: Record<string, EventWiki> = {
  'anatomy': {
    id: 'anatomy',
    name: 'Anatomy & Physiology',
    description: 'Understand the anatomy and physiology of the human body systems (Integumentary, Skeletal, and Muscular).',
    infobox: {
      type: 'Study',
      category: 'Lab',
      participants: 2,
      eyeProtection: 'No',
      impound: false,
      approxTime: '30 minutes',
      firstAppearance: '1985',
      latestAppearance: '2026',
      rotates: true,
    },
    subtopics: [
      {
        id: 'integumentary',
        title: 'Integumentary System',
        blocks: [
          { type: 'paragraph', content: 'The integumentary system consists of the skin, hair, nails, glands, and nerves. Its main function is to act as a barrier to protect the body from the outside world.' },
          { type: 'paragraph', content: 'Key layers of the skin:' },
          { type: 'list', items: ['Epidermis: The outermost layer, providing a waterproof barrier.', 'Dermis: Contains tough connective tissue, hair follicles, and sweat glands.', 'Hypodermis (Subcutaneous tissue): Made of fat and connective tissue.'] }
        ]
      },
      {
        id: 'skeletal',
        title: 'Skeletal System',
        blocks: [
          { type: 'paragraph', content: 'The adult human skeletal system consists of 206 bones, as well as a network of tendons, ligaments, and cartilage that connects them.' },
          { type: 'list', items: ['Axial Skeleton: 80 bones including the skull, spine, ribs, and sternum.', 'Appendicular Skeleton: 126 bones including appendages (shoulders, arms, hips, legs).'] }
        ]
      },
      {
        id: 'muscular',
        title: 'Muscular System',
        blocks: [
          { type: 'paragraph', content: 'The muscular system is responsible for the movement of the human body. Attached to the bones of the skeletal system are about 700 named muscles that make up roughly half of a person\'s body weight.' }
        ]
      }
    ]
  },
  'astronomy': {
    id: 'astronomy',
    name: 'Astronomy',
    description: 'Learn about stellar evolution, variable stars, and deep sky objects.',
    infobox: {
      type: 'Study',
      category: 'Inquiry',
      participants: 2,
      eyeProtection: 'No',
      impound: false,
      approxTime: '30 minutes',
      firstAppearance: '1993',
      latestAppearance: '2026',
      rotates: true,
    },
    subtopics: [
      {
        id: 'stellar-evolution',
        title: 'Stellar Evolution',
        blocks: [
          { type: 'paragraph', content: 'Stellar evolution is the process by which a star changes over the course of time. Depending on the mass of the star, its lifetime can range from a few million years for the most massive to trillions of years for the least massive.' },
          { type: 'list', items: ['Nebula: A cloud of gas and dust where stars are born.', 'Main Sequence: The longest stage of a star\'s life, where it fuses hydrogen into helium.', 'Red Giant/Supergiant: The late phase of a star after it exhausts hydrogen in its core.', 'Supernova: The explosive death of a massive star.', 'Black Hole / Neutron Star / White Dwarf: The remnant of a dead star, depending on its mass.'] }
        ]
      },
      {
        id: 'hr-diagram',
        title: 'Hertzsprung-Russell Diagram',
        blocks: [
          { type: 'paragraph', content: 'The H-R diagram is a scatter plot of stars showing the relationship between the stars\' absolute magnitudes or luminosities versus their stellar classifications or effective temperatures.' }
        ]
      }
    ]
  },
  'disease-detectives': {
    id: 'disease-detectives',
    name: 'Disease Detectives',
    description: 'Focus on epidemiology, the study of the distribution and determinants of health-related states and events.',
    infobox: {
      type: 'Study',
      category: 'Trial',
      participants: 2,
      eyeProtection: 'No',
      impound: false,
      approxTime: '30 minutes',
      firstAppearance: '2004',
      latestAppearance: '2026',
      rotates: false,
    },
    subtopics: [
      {
        id: 'basic-epi',
        title: 'Basic Epidemiology',
        blocks: [
          { type: 'paragraph', content: 'Epidemiology relies on systematic and unbiased approach to the collection, analysis, and interpretation of data.' },
          { type: 'list', items: ['Endemic: The constant presence of a disease within a geographic area.', 'Epidemic: An increase, often sudden, in the number of cases of a disease above what is normally expected.', 'Pandemic: An epidemic that has spread over several countries or continents.'] }
        ]
      },
      {
        id: 'study-designs',
        title: 'Study Designs',
        blocks: [
          { type: 'paragraph', content: 'Different types of studies are used depending on the scenario:' },
          { type: 'list', items: ['Cohort Study: Compares a group with a given exposure to a group without the exposure.', 'Case-Control Study: Compares a group with a disease (cases) to a group without the disease (controls).', 'Cross-Sectional Study: Assesses exposure and disease at the same point in time.'] }
        ]
      }
    ]
  },
  'air-trajectory': {
    id: 'air-trajectory',
    name: 'Air Trajectory',
    description: 'Design, build, and calibrate a device capable of launching a projectile onto a target.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '15 minutes', firstAppearance: '2000', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'bungee-drop': {
    id: 'bungee-drop',
    name: 'Bungee Drop',
    description: 'Design a bungee cord that drops a mass as close as possible to the floor without touching it.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, allowedResources: ['Calibration Data', 'Tools'], approxTime: '10 minutes', firstAppearance: '2014', latestAppearance: '2026', rotates: true },
    subtopics: []
  },
  'chemistry-lab': {
    id: 'chemistry-lab',
    name: 'Chemistry Lab',
    description: 'Complete one or more tasks and answer a series of questions involving the scientific processes of chemistry.',
    infobox: { type: 'Study', category: 'Lab', participants: 2, eyeProtection: 'Category B', impound: false, approxTime: '30 minutes', firstAppearance: '1994', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'codebusters': {
    id: 'codebusters',
    name: 'Codebusters',
    description: 'Cryptanalysis and decoding of encrypted messages using various ciphers.',
    infobox: { type: 'Study', category: 'Trial', participants: 3, impound: false, allowedResources: ['One scientific calculator'], approxTime: '30 minutes', firstAppearance: '2013', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'detector-building': {
    id: 'detector-building',
    name: 'Detector Building',
    description: 'Build, test, and calibrate a device to measure an environmental parameter like temperature or salinity.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '20 minutes', firstAppearance: '2010', latestAppearance: '2026', rotates: true },
    subtopics: []
  },
  'dynamic-planet': {
    id: 'dynamic-planet',
    name: 'Dynamic Planet',
    description: 'Use process skills to complete tasks related to large-scale Earth processes.',
    infobox: { type: 'Study', category: 'Inquiry', participants: 2, impound: false, approxTime: '30 minutes', firstAppearance: '1991', latestAppearance: '2026', rotates: true },
    subtopics: []
  },
  'ecology': {
    id: 'ecology',
    name: 'Ecology',
    description: 'Answer questions involving content knowledge and process skills in the area of ecology and adaptations.',
    infobox: { type: 'Study', category: 'Trial', participants: 2, impound: false, approxTime: '30 minutes', firstAppearance: '1985', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'electric-vehicle': {
    id: 'electric-vehicle',
    name: 'Electric Vehicle',
    description: 'Design and build a battery-powered vehicle to travel a specified distance quickly and accurately.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '10 minutes', firstAppearance: '2005', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'experimental-design': {
    id: 'experimental-design',
    name: 'Experimental Design',
    description: 'Determine the variables, conduct an experiment, and report the findings.',
    infobox: { type: 'Study', category: 'Lab', participants: 3, eyeProtection: 'Category B', impound: false, approxTime: '30 minutes', firstAppearance: '1998', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'fermi-questions': {
    id: 'fermi-questions',
    name: 'Fermi Questions',
    description: 'Provide answers to a series of order of magnitude estimation questions.',
    infobox: { type: 'Study', category: 'Trial', participants: 2, impound: false, allowedResources: ['Two calculators'], approxTime: '30 minutes', firstAppearance: '1994', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'flight': {
    id: 'flight',
    name: 'Flight',
    description: 'Prior to the tournament, teams will construct, collect data on test flights, analyze and optimize a free flight rubber-powered aircraft.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '8 minutes', firstAppearance: '1985', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'forensics': {
    id: 'forensics',
    name: 'Forensics',
    description: 'Perform tests on evidence collected from a crime scene to identify the perpetrator.',
    infobox: { type: 'Study', category: 'Lab', participants: 2, eyeProtection: 'Category B', impound: false, approxTime: '30 minutes', firstAppearance: '1985', latestAppearance: '2026', rotates: true },
    subtopics: []
  },
  'fossils': {
    id: 'fossils',
    name: 'Fossils',
    description: 'Identify and classify fossils and demonstrate knowledge of ancient life.',
    infobox: { type: 'Study', category: 'Trial', participants: 2, impound: true, allowedResources: ['Resource Binder'], approxTime: '30 minutes', firstAppearance: '1985', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'geologic-mapping': {
    id: 'geologic-mapping',
    name: 'Geologic Mapping',
    description: 'Demonstrate understanding of the construction and use of topographic and geologic maps.',
    infobox: { type: 'Study', category: 'Inquiry', participants: 2, impound: false, approxTime: '30 minutes', firstAppearance: '2005', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'microbe-mission': {
    id: 'microbe-mission',
    name: 'Microbe Mission',
    description: 'Answer questions, solve problems, and analyze data pertaining to microbes.',
    infobox: { type: 'Study', category: 'Lab', participants: 2, eyeProtection: 'Category B', impound: false, approxTime: '30 minutes', firstAppearance: '2008', latestAppearance: '2026', rotates: true },
    subtopics: []
  },
  'optics': {
    id: 'optics',
    name: 'Optics',
    description: 'Competitors must participate in an activity involving positioning mirrors to direct a laser beam towards a target.',
    infobox: { type: 'Engineering', category: 'Lab', participants: 2, impound: true, approxTime: '30 minutes', firstAppearance: '1994', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'robot-tour': {
    id: 'robot-tour',
    name: 'Robot Tour',
    description: 'Design, build, program and test a robotic vehicle to navigate a track.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '10 minutes', firstAppearance: '2010', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'scrambler': {
    id: 'scrambler',
    name: 'Scrambler',
    description: 'Build a mechanical device to transport a falling mass and an egg along a straight track as fast as possible without breaking the egg.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '8 minutes', firstAppearance: '1993', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'tower': {
    id: 'tower',
    name: 'Tower',
    description: 'Design and build the most efficient tower out of wood and glue.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '10 minutes', firstAppearance: '1985', latestAppearance: '2026', rotates: false },
    subtopics: []
  },
  'wind-power': {
    id: 'wind-power',
    name: 'Wind Power',
    description: 'Build a blade assembly that captures wind power and answer questions related to alternative energy.',
    infobox: { type: 'Engineering', category: 'Build', participants: 2, impound: true, approxTime: '15 minutes', firstAppearance: '2008', latestAppearance: '2026', rotates: true },
    subtopics: []
  }
};
