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
  'hovercraft': {
    id: 'hovercraft',
    name: 'Hovercraft',
    description: 'Prior to the competition, participants will design, construct, and calibrate a self-propelled air-levitated vehicle that moves down a track.',
    infobox: { type: 'Physics', category: 'Build', participants: 2, eyeProtection: 'Category B', impound: true, allowedResources: ['One vehicle', 'Papers/notes', 'Tools/supplies', 'Spare parts', 'Two Class III calculators'], approxTime: '8 minutes', firstAppearance: '2017', latestAppearance: '2026', rotates: true },
    subtopics: [
      {
        id: 'description',
        title: 'Description',
        blocks: [
          { type: 'paragraph', content: 'Hovercraft is a build event for the 2025-2026 season. Formerly, it was a dual lab, with a test portion and build portion. The goal is to make a levitating vehicle that goes down a track without it stopping along the way. The hovercraft MUST levitate, otherwise it is considered a vehicle. This may be checked by many competitions if there are any suspicions.' }
        ]
      },
      {
        id: 'device',
        title: 'Device',
        blocks: [
          { type: 'paragraph', content: 'There are certain basic parameters which should be kept in mind while constructing the Hovercraft for the 2026 season:' },
          { type: 'list', items: [
            'The device must fit into a 40cm x 40cm x 40cm cube (including an inflated skirt).',
            'There is no limit on the mass of the vehicle, however, it is optimal that the craft is as light as possible. Note: Teams should not abandon functionality for the sake of a perfect score: if the device is too heavy, it may not complete a successful run.',
            'The device may be constructed of any material but may not modify or damage the track.',
            'Each device may only have up to two motors each rotating one propeller or impeller.',
            'All propellers/impellers must have shielding(including under the device), preventing a 3/8" dowel from touching them.',
            'The vehicle must have a 1/4" or larger dowel vertically attached within 3.0 cm of its front edge such that the top end is at least 20 cm above the lowest vehicle surface.',
            'Batteries may not exceed 12.0 volts as determined by their label for each circuit. Both lead and lithium batteries are now banned as per the soinc.org battery policy.',
            'Electrical components shall be limited to: Batteries at or under 12V each, Each motor may be powered by it\'s own up to 12V volt battery, provided that the motors lie on separate circuits, Wires, Motors (Including brushless motors), Manually operated switches, Resistors, Potentiometers, Rheostats, Capacitors, Fans, Blowers.',
            'Integrated circuits are not permitted unless they are part or-or embedded into commercially available fans used for cooling electronics or computers.',
            'The hovercraft must have switches or another type of device that enables and disables the fans/motors/blowers. If such device doesn’t exist, and twisting wires or inserting batteries are used instead to operate the hovercraft, this would be considered as a construction violation and will be scored as 0 points, due to it being deemed unsafe to operate. The hovercraft will not be permitted to run.'
          ]}
        ]
      },
      {
        id: 'hovercraft-design',
        title: 'Hovercraft Design',
        subsections: [
          { id: 'base', title: 'Base' },
          { id: 'fans', title: 'Fans' },
          { id: 'batteries', title: 'Batteries' },
          { id: 'wiring', title: 'Wiring' },
          { id: 'skirt', title: 'Skirt' }
        ],
        blocks: [
          { type: 'paragraph', content: 'Hovercrafts have a few essential parts - the base of the hovercraft itself, the fans, the batteries, the wiring/switches, and the skirt. The best teams will experiment with all these parts to find a successful design. The speed control methods will vary from device to device, ranging from fine-tuned potentiometers to simply covering up the thrust fan with tape to reduce airflow. Unlike some events, there is no single "best" method for all teams; instead, the best method is the one which has been tested most.' },
          { type: 'heading', level: 3, content: 'Base' },
          { type: 'paragraph', content: 'The base is likely the simplest thing to construct on the hovercraft. However, it still merits consideration in designing the most efficient device possible. A good base will make it easy to test and swap out components without destroying any structural support, among other considerations. It should also be strong enough to support all components without pushing the weight above 2000 g.' },
          { type: 'paragraph', content: 'There are many choices of materials when constructing a base. Common selections include foam core and basswood sheets, though others are certainly possible. Materials should be light enough to allow weight adjustment to change while maximizing the mass score.' },
          { type: 'paragraph', content: 'Also important are fan coverings. The rules require shielding over the fans with holes of 1/4" in diameter or smaller, so the base needs to include some form of covering (eg. mesh) so that no fan blades are exposed.' },
          { type: 'heading', level: 3, content: 'Fans' },
          { type: 'paragraph', content: 'Fans are some of the most important components to a functional, efficient hovercraft. Fans have entirely different requirements for lift and thrust, and should be selected accordingly. It can be very helpful to enable swapping of fans, which facilitates testing.' },
          { type: 'paragraph', content: 'Lift: Centrifugal blower fans are considered the most efficient type of lift fan, both in real-world designs and Science Olympiad devices. To fully support a 2 kg hovercraft, a fairly high pressure is required, making blower fans more efficient than traditional axial fans.' },
          { type: 'paragraph', content: 'Thrust: Thrust fans should instead prioritize CFM to provide maximum acceleration. Although it is possible to successfully use a powerful computer fan, hobby motors have the potential to be more effective and more adjustable. Devices need to be able to work on all surfaces, not just those they have been tested on.' },
          { type: 'heading', level: 3, content: 'Batteries' },
          { type: 'paragraph', content: 'There are a few possible choices for batteries. Traditional commercial batteries, like AAs or 9Vs could work, but are unlikely to provide the amperage required to lift and propel a heavy device.' },
          { type: 'paragraph', content: 'The most ideal solution seems to be nickel-metal hydride batteries, or NiMHs. NiMH batteries can be found up to 8.4V, but often overcharge above 9 volts, meaning they can very effectively be used even with 12V components.' },
          { type: 'paragraph', content: 'Although voltage is an important specification for any batteries used in hovercraft, so is capacity. Many teams use 3000 mAh batteries, which are more than enough for the amount of testing done in the Hovercraft event. 5000 mAh batteries are also available, and allow for longer testing periods but are more expensive. Some companies offer 1600 mAh batteries, but higher capacity is preferable.' },
          { type: 'paragraph', content: 'Caution is needed when using NiMH batteries or any type in general, which can be extremely dangerous if used improperly. However, should a NiMH battery be damaged, they explode rather than catch fire. However, this is only the case if the battery is very compromised.' },
          { type: 'paragraph', content: 'A general guideline is to charge NiMH batteries at 0.5C. For a typical 3000 mAh battery, this means charging at 1.5 A.' },
          { type: 'heading', level: 3, content: 'Wiring' },
          { type: 'paragraph', content: 'Wiring should be fairly cut-and-dry. Wires should be selected based on the power specifications of fans and batteries. There are many options available for switches, and very simple designs will work. Many household switches have two sides, perfect for the two circuits needed to power two fans. JST connectors or similar can be used to enable easy swapping of components, especially batteries and fans.' },
          { type: 'heading', level: 3, content: 'Skirt' },
          { type: 'paragraph', content: 'The skirt is likely the most difficult part of a hovercraft to perfect. Beyond hardware like fans and batteries, the skirt is the largest determining factor of a device\'s success. Skirts need to have as low of friction as possible to have accurate results and to enable low speed runs. Many hovercraft failed at the MI and PA state competitions when the track was created out of plywood, as many designs were unable to compensate for such high friction.' },
          { type: 'paragraph', content: 'There are practically infinite possible variations of the hovercraft skirt. However, these can be divided into a few smaller subsets.' },
          { type: 'paragraph', content: 'The bag skirt is exactly what it sounds like - a completely contained cushion of air, possibly with many small holes poked in it to decrease friction. This is one of the most common designs in Science Olympiad, seeing as it is easy to construct and fairly stable. However, its shortcoming lies in friction, as bag skirts are generally one of the most high friction skirt designs.' },
          { type: 'paragraph', content: 'The wall skirt is the other variation likely to be found in Science Olympiad competitions. The skirt itself is only a wall around the pocket of air, but all surfaces must be flat for the purpose of Science Olympiad, so a wall skirt can still contain a pocket of air. Unfortunately, the wall skirt is more prone to air leakage if constructed improperly and is difficult to construct for most competitors. Unorthodox techniques are often needed to construct an effective wall skirt. This is the most common design implemented among top teams, and variations of this skirt can be found on devices from teams such as LASA, Troy, Boca Raton, and others.' },
          { type: 'paragraph', content: 'Other innovations can be added to these types of skirts. One design used in many real-world hovercraft is the momentum curtain, which directs airflow to the edges of the hovercraft before bending down to propel the hovercraft up. This has the benefit of placing the highest pressure region near to the ground as opposed to in the center of a cushion of air. Also, many Science Olympiad hovercraft use a flat piece of wood or foam core at the bottom of a bag skirt to create a flat surface and decrease friction.' },
          { type: 'paragraph', content: 'The finger skirt is the third common category of hovercraft skirts, but is very unlikely to be used as almost all high school students lack the tools to construct such a complicated design.' },
          { type: 'paragraph', content: 'Testing, testing, and more testing is the only way to guarantee a good skirt design and a good overall score. Many teams are buying the same fans and batteries, so what truly sets teams apart is their skirts.' }
        ]
      },
      {
        id: 'written-exam',
        title: 'Written Exam (Past Years)',
        subsections: [
          { id: 'newtons-laws', title: 'Newton\'s Laws of Motion' },
          { id: 'kinematics', title: 'Kinematics' },
          { id: 'kinetic-energy', title: 'Kinetic Energy' },
          { id: 'momentum', title: 'Momentum' },
          { id: 'fluid-mechanics', title: 'Fluid Mechanics' },
          { id: 'air-cushioned', title: 'Air Cushioned Vehicles' }
        ],
        blocks: [
          { type: 'paragraph', content: 'Note: This section is from a previous season\'s rules (2018). Hovercraft no longer has an exam component and is a pure build event. The information is preserved for reference.' },
          { type: 'paragraph', content: 'Part 1 of the event consists of a written test which draws from the AP Physics 1, or algebra-based mechanics, curriculum. This test must contain at least five questions from each of the following topics: Newton\'s laws of motion, kinematics, kinetic energy, air cushioned vehicles and applications, and fluid mechanics for Div. C only. 20 – 30 minutes is suggested to complete this test.' },
          { type: 'heading', level: 3, content: 'Newton\'s Laws of Motion' },
          { type: 'paragraph', content: 'Newton\'s First Law: An object will remain at rest or in uniform motion unless acted on by an external force. This describes inertia.' },
          { type: 'paragraph', content: 'Newton\'s Second Law: The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force and inversely proportional to the mass of the object (F = ma).' },
          { type: 'paragraph', content: 'Newton\'s Third Law: Every action has an equal and opposite reaction. Forces always occur in equal action-reaction pairs, no matter what the masses of the objects being acted upon are.' },
          { type: 'heading', level: 3, content: 'Kinematics' },
          { type: 'paragraph', content: 'There are 5 variables in kinematics - initial velocity, final velocity, acceleration, time, and distance; these equations make it possible to find any two quantities given the other three. Equations include combinations of velocity, acceleration, time, and distance. Projectile motion can be treated as 2D kinematics - 1 equation for x, and 1 equation for y. It adds another variable - the angle the projectile is launched at.' },
          { type: 'heading', level: 3, content: 'Kinetic Energy' },
          { type: 'paragraph', content: 'Kinetic energy (0.5 * m * v^2), Gravitational potential energy (mgh), Elastic potential energy (0.5 * k * x^2), and Work (F * d * cos(theta)). These equations can be used by themselves or in larger problems like momentum conservation.' },
          { type: 'heading', level: 3, content: 'Momentum' },
          { type: 'paragraph', content: 'Momentum = mass * velocity. Impulse = force * time. In any collision, momentum is conserved. In a perfectly inelastic collision, two objects combine to form essentially one mass, and kinetic energy is not conserved. In a perfectly elastic collision, both kinetic energy and momentum are conserved as both objects simply bounce off of each other.' },
          { type: 'heading', level: 3, content: 'Fluid Mechanics (Division C)' },
          { type: 'paragraph', content: 'Density is a material\'s mass per unit volume. Specific gravity is the ratio of its density to the density of water.' },
          { type: 'paragraph', content: 'Pascal\'s Law: Pressure is the normal force per unit area. Pressure applied to an enclosed fluid is transmitted, undiminished, to every portion of the fluid and the walls of the containing vessel. This explains hydraulic lifts.' },
          { type: 'paragraph', content: 'Buoyancy (Archimedes\' principle): When a body is completely or partially immersed in a fluid, the fluid exerts an upward force on the body equal to the weight of the fluid displaced by the body.' },
          { type: 'paragraph', content: 'Bernoulli\'s Principle: Volume flow rate is equal to fluid velocity times area. The continuity equation states that the volume flow rate is constant for an incompressible fluid. Bernoulli\'s equation combines factors affecting a flowing incompressible fluid by applying conservation of energy.' },
          { type: 'paragraph', content: 'Viscosity is the internal friction within a fluid, or the resistance to flow.' },
          { type: 'heading', level: 3, content: 'Air Cushioned Vehicles' },
          { type: 'paragraph', content: 'History: 1716 Emanuel Swedenborg first uses the term "hovering". 1950s Christopher Cockerell (credited as the inventor of the hovercraft) develops the concept of an annular ring. 1959 The SR.N1 is first demonstrated. World Records include Largest Civil Hovercraft (SR.N4 Mk. III) and Fastest English Channel Crossing (22 minutes).' }
        ]
      },
      {
        id: 'scoring',
        title: 'Scoring',
        blocks: [
          { type: 'paragraph', content: 'For 2018, the final score (FS) for Hovercraft was scored using the formula: FS = MS + TS + ES + CS + IB.' },
          { type: 'list', items: [
            'MS (Mass Score): Based on the number of penny rolls used compared to the max by any successful team.',
            'TS (Time Score): Based on the time taken.',
            'ES (Exam Score): Score on the written test.',
            'CS (Chart Score): Based on a rubric offering up to 10 points for graphs or charts.',
            'IB (Impound Bonus): 3 points if the hovercraft is impounded properly.'
          ]},
          { type: 'paragraph', content: 'If a team fails to record a successful run, their MS and TS are set to 0. Construction violations multiply the penny rolls by 0.7, and competition violations multiply TS by 0.9.' }
        ]
      }
    ]
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
