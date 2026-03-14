/**
 * CBSE Physics Question Paper Blueprint (2025-26)
 *
 * Strict guidelines extracted from official CBSE course structure and
 * question-paper-design documents for Class XI and XII Physics theory papers.
 *
 * All weightage values are relative to THEORY_MAX_MARKS = 70.
 * When a teacher chooses a different total, every marks figure is
 * scaled proportionally via `getScaledPhysicsBlueprint()`.
 */

export interface PhysicsWeightageGroup {
  unitRange: string;
  unitNames: string[];
  chapterNames: string[];
  marks: number;
}

export interface PhysicsRubricBand {
  level: number;
  name: string;
  description: string;
  marks: number;
  percentage: number;
}

export interface CbsePhysicsBlueprint {
  grade: number;
  maxMarks: number;
  time: string;
  theoryOnly: boolean;
  weightageGroups: PhysicsWeightageGroup[];
  rubricBands: PhysicsRubricBand[];
  notes: string[];
}

const CLASS_11_BLUEPRINT: CbsePhysicsBlueprint = {
  grade: 11,
  maxMarks: 70,
  time: '3 hours',
  theoryOnly: true,
  weightageGroups: [
    {
      unitRange: 'I-IV',
      unitNames: [
        'Physical World and Measurement',
        'Kinematics',
        'Laws of Motion',
        'Work, Energy and Power',
      ],
      chapterNames: [
        'Physical World',
        'Units and Measurements',
        'Motion in a Straight Line',
        'Motion in a Plane',
        'Laws of Motion',
        'Work, Energy and Power',
      ],
      marks: 23,
    },
    {
      unitRange: 'V-VI',
      unitNames: [
        'Motion of System of Particles and Rigid Body',
        'Gravitation',
      ],
      chapterNames: [
        'System of Particles and Rotational Motion',
        'Gravitation',
      ],
      marks: 17,
    },
    {
      unitRange: 'VII-IX',
      unitNames: [
        'Properties of Bulk Matter',
        'Thermodynamics',
        'Behaviour of Perfect Gases and Kinetic Theory',
      ],
      chapterNames: [
        'Mechanical Properties of Solids',
        'Mechanical Properties of Fluids',
        'Thermal Properties of Matter',
        'Thermodynamics',
        'Kinetic Theory',
      ],
      marks: 20,
    },
    {
      unitRange: 'X',
      unitNames: ['Oscillations and Waves'],
      chapterNames: ['Oscillations', 'Waves'],
      marks: 10,
    },
  ],
  rubricBands: [
    {
      level: 1,
      name: 'Remembering & Understanding',
      description:
        'Exhibit memory of previously learned facts, terms, basic concepts, and answers. ' +
        'Demonstrate understanding of facts and ideas by organising, comparing, translating, interpreting, giving descriptions, and stating main ideas.',
      marks: 27,
      percentage: 38,
    },
    {
      level: 2,
      name: 'Applying',
      description:
        'Solve problems in new situations by applying acquired knowledge, facts, techniques, and rules in a different way.',
      marks: 22,
      percentage: 32,
    },
    {
      level: 3,
      name: 'Analysing, Evaluating & Creating',
      description:
        'Examine and break information into parts by identifying motives or causes. ' +
        'Make inferences and find evidence to support generalisations. ' +
        'Present and defend opinions by making judgments about information, validity of ideas, or quality of work based on a set of criteria. ' +
        'Compile information together in a different way by combining elements in a new pattern or proposing alternative solutions.',
      marks: 21,
      percentage: 30,
    },
  ],
  notes: [
    'This blueprint applies to the theory paper only. Practical marks are excluded from question generation.',
    'The official CBSE theory maximum is 70 marks; scale proportionally for any other requested total.',
    'Suitable internal variations may be made while keeping the overall weightage to different forms of questions and typology of questions the same.',
    'Stay strictly within the teacher-selected chapters. If the selected chapters do not cover all unit groups, match the CBSE percentages as closely as possible within the selected scope.',
  ],
};

const CLASS_12_BLUEPRINT: CbsePhysicsBlueprint = {
  grade: 12,
  maxMarks: 70,
  time: '3 hours',
  theoryOnly: true,
  weightageGroups: [
    {
      unitRange: 'I-II',
      unitNames: ['Electrostatics', 'Current Electricity'],
      chapterNames: [
        'Electric Charges and Fields',
        'Electrostatic Potential and Capacitance',
        'Current Electricity',
      ],
      marks: 16,
    },
    {
      unitRange: 'III-V',
      unitNames: [
        'Magnetic Effects of Current and Magnetism',
        'Electromagnetic Induction and Alternating Currents',
        'Electromagnetic Waves',
      ],
      chapterNames: [
        'Moving Charges and Magnetism',
        'Magnetism and Matter',
        'Electromagnetic Induction',
        'Alternating Current',
        'Electromagnetic Waves',
      ],
      marks: 17,
    },
    {
      unitRange: 'VI-VII',
      unitNames: ['Optics', 'Dual Nature of Radiation and Matter'],
      chapterNames: [
        'Ray Optics and Optical Instruments',
        'Wave Optics',
        'Dual Nature of Radiation and Matter',
      ],
      marks: 18,
    },
    {
      unitRange: 'VIII',
      unitNames: ['Atoms and Nuclei'],
      chapterNames: ['Atoms', 'Nuclei'],
      marks: 12,
    },
    {
      unitRange: 'IX',
      unitNames: ['Electronic Devices'],
      chapterNames: ['Semiconductor Electronics'],
      marks: 7,
    },
  ],
  rubricBands: [
    {
      level: 1,
      name: 'Remembering & Understanding',
      description:
        'Exhibit memory of previously learned facts, terms, basic concepts, and answers. ' +
        'Demonstrate understanding of facts and ideas by organising, comparing, translating, interpreting, giving descriptions, and stating main ideas.',
      marks: 27,
      percentage: 38,
    },
    {
      level: 2,
      name: 'Applying',
      description:
        'Solve problems in new situations by applying acquired knowledge, facts, techniques, and rules in a different way.',
      marks: 22,
      percentage: 32,
    },
    {
      level: 3,
      name: 'Analysing, Evaluating & Creating',
      description:
        'Examine and break information into parts by identifying motives or causes. ' +
        'Make inferences and find evidence to support generalisations. ' +
        'Present and defend opinions by making judgments about information, validity of ideas, or quality of work based on a set of criteria. ' +
        'Compile information together in a different way by combining elements in a new pattern or proposing alternative solutions.',
      marks: 21,
      percentage: 30,
    },
  ],
  notes: [
    'This blueprint applies to the theory paper only. Practical marks are excluded from question generation.',
    'The official CBSE theory maximum is 70 marks; scale proportionally for any other requested total.',
    'Suitable internal variations may be made while keeping the overall weightage to different forms of questions and typology of questions the same.',
    'Stay strictly within the teacher-selected chapters. If the selected chapters do not cover all unit groups, match the CBSE percentages as closely as possible within the selected scope.',
  ],
};

const BLUEPRINTS: Record<number, CbsePhysicsBlueprint> = {
  11: CLASS_11_BLUEPRINT,
  12: CLASS_12_BLUEPRINT,
};

export function getCbsePhysicsBlueprint(grade: number): CbsePhysicsBlueprint | null {
  return BLUEPRINTS[grade] ?? null;
}

export interface ScaledPhysicsWeightageGroup {
  unitRange: string;
  unitNames: string[];
  chapterNames: string[];
  baseMarks: number;
  scaledMarks: number;
  percentage: number;
}

export interface ScaledPhysicsRubricBand {
  name: string;
  description: string;
  baseMarks: number;
  scaledMarks: number;
  percentage: number;
}

export interface ScaledPhysicsBlueprint {
  grade: number;
  requestedMarks: number;
  baseMarks: number;
  scaleFactor: number;
  weightageGroups: ScaledPhysicsWeightageGroup[];
  rubricBands: ScaledPhysicsRubricBand[];
  notes: string[];
}

interface CbsePhysicsSectionDef {
  letter: string;
  title: string;
  questionType: string;
  marksPerQuestion: number;
  questionCount: number;
  totalMarks: number;
  mcqCount: number;
  assertionReasonCount: number;
  caseStudyCount: number;
  internalChoiceCount: number;
  description: string;
}

const CBSE_70_PHYSICS_SECTIONS: CbsePhysicsSectionDef[] = [
  {
    letter: 'A',
    title: 'SECTION – A',
    questionType: 'MCQ + Assertion-Reason',
    marksPerQuestion: 1,
    questionCount: 16,
    totalMarks: 16,
    mcqCount: 12,
    assertionReasonCount: 4,
    caseStudyCount: 0,
    internalChoiceCount: 0,
    description:
      'Questions 1 to 12 are Multiple Choice Questions and Questions 13 to 16 are Assertion-Reason based questions of 1 mark each.',
  },
  {
    letter: 'B',
    title: 'SECTION – B',
    questionType: 'Short Answer-I',
    marksPerQuestion: 2,
    questionCount: 5,
    totalMarks: 10,
    mcqCount: 0,
    assertionReasonCount: 0,
    caseStudyCount: 0,
    internalChoiceCount: 2,
    description: 'Questions 17 to 21 are short answer questions carrying 2 marks each.',
  },
  {
    letter: 'C',
    title: 'SECTION – C',
    questionType: 'Short Answer-II',
    marksPerQuestion: 3,
    questionCount: 7,
    totalMarks: 21,
    mcqCount: 0,
    assertionReasonCount: 0,
    caseStudyCount: 0,
    internalChoiceCount: 2,
    description: 'Questions 22 to 28 are short answer questions carrying 3 marks each.',
  },
  {
    letter: 'D',
    title: 'SECTION – D',
    questionType: 'Case Study',
    marksPerQuestion: 4,
    questionCount: 2,
    totalMarks: 8,
    mcqCount: 0,
    assertionReasonCount: 0,
    caseStudyCount: 2,
    internalChoiceCount: 2,
    description:
      'Questions 29 and 30 are case study based questions. Read the paragraphs and answer the sub-parts that follow.',
  },
  {
    letter: 'E',
    title: 'SECTION – E',
    questionType: 'Long Answer',
    marksPerQuestion: 5,
    questionCount: 3,
    totalMarks: 15,
    mcqCount: 0,
    assertionReasonCount: 0,
    caseStudyCount: 0,
    internalChoiceCount: 3,
    description: 'Questions 31 to 33 are long answer questions carrying 5 marks each.',
  },
];

export interface ScaledPhysicsSection {
  letter: string;
  title: string;
  questionType: string;
  marksPerQuestion: number;
  questionCount: number;
  totalMarks: number;
  mcqCount: number;
  assertionReasonCount: number;
  caseStudyCount: number;
  internalChoiceCount: number;
  description: string;
}

export function getScaledPhysicsBlueprint(
  grade: number,
  requestedMarks: number,
): ScaledPhysicsBlueprint | null {
  const base = getCbsePhysicsBlueprint(grade);
  if (!base) return null;

  const factor = requestedMarks / base.maxMarks;
  const roundHalf = (n: number) => Math.round(n * 2) / 2;

  const weightageGroups: ScaledPhysicsWeightageGroup[] = base.weightageGroups.map((group) => ({
    unitRange: group.unitRange,
    unitNames: group.unitNames,
    chapterNames: group.chapterNames,
    baseMarks: group.marks,
    scaledMarks: roundHalf(group.marks * factor),
    percentage: parseFloat(((group.marks / base.maxMarks) * 100).toFixed(1)),
  }));

  const weightageTotal = weightageGroups.reduce((sum, group) => sum + group.scaledMarks, 0);
  const weightageDiff = requestedMarks - weightageTotal;
  if (weightageDiff !== 0) {
    const largest = weightageGroups.reduce((a, b) =>
      b.scaledMarks > a.scaledMarks ? b : a,
    );
    largest.scaledMarks = roundHalf(largest.scaledMarks + weightageDiff);
  }

  const rubricBands: ScaledPhysicsRubricBand[] = base.rubricBands.map((band) => ({
    name: band.name,
    description: band.description,
    baseMarks: band.marks,
    scaledMarks: roundHalf(band.marks * factor),
    percentage: band.percentage,
  }));

  const rubricTotal = rubricBands.reduce((sum, band) => sum + band.scaledMarks, 0);
  const rubricDiff = requestedMarks - rubricTotal;
  if (rubricDiff !== 0) {
    const largest = rubricBands.reduce((a, b) =>
      b.scaledMarks > a.scaledMarks ? b : a,
    );
    largest.scaledMarks = roundHalf(largest.scaledMarks + rubricDiff);
  }

  return {
    grade,
    requestedMarks,
    baseMarks: base.maxMarks,
    scaleFactor: factor,
    weightageGroups,
    rubricBands,
    notes: base.notes,
  };
}

function getScaledPhysicsSections(totalMarks: number): ScaledPhysicsSection[] {
  if (totalMarks === 70) return CBSE_70_PHYSICS_SECTIONS;

  const factor = totalMarks / 70;
  const scaled = CBSE_70_PHYSICS_SECTIONS.map((section) => {
    const questionCount = Math.max(1, Math.round(section.questionCount * factor));
    const total = questionCount * section.marksPerQuestion;
    const mcqCount = section.mcqCount > 0
      ? Math.max(1, Math.round(section.mcqCount * factor))
      : 0;
    const assertionReasonCount = section.assertionReasonCount > 0
      ? Math.max(1, Math.round(section.assertionReasonCount * factor))
      : 0;
    const caseStudyCount = section.caseStudyCount > 0
      ? Math.max(1, Math.round(section.caseStudyCount * factor))
      : 0;
    const internalChoiceCount = section.internalChoiceCount > 0
      ? Math.max(1, Math.round(section.internalChoiceCount * factor))
      : 0;

    return {
      ...section,
      questionCount,
      totalMarks: total,
      mcqCount: Math.min(mcqCount, questionCount),
      assertionReasonCount: Math.min(assertionReasonCount, questionCount),
      caseStudyCount: Math.min(caseStudyCount, questionCount),
      internalChoiceCount: Math.min(internalChoiceCount, questionCount),
    };
  });

  const currentTotal = scaled.reduce((sum, section) => sum + section.totalMarks, 0);
  const diff = totalMarks - currentTotal;
  if (diff !== 0) {
    const adjustable = [...scaled].sort((a, b) => b.totalMarks - a.totalMarks);
    for (const section of adjustable) {
      const qDiff = Math.round(diff / section.marksPerQuestion);
      if (qDiff !== 0 && section.questionCount + qDiff >= 1) {
        section.questionCount += qDiff;
        section.totalMarks = section.questionCount * section.marksPerQuestion;
        if (section.mcqCount > 0 || section.assertionReasonCount > 0) {
          const ar = Math.min(section.assertionReasonCount || 0, section.questionCount);
          section.assertionReasonCount = ar;
          section.mcqCount = Math.max(section.questionCount - ar, 0);
        }
        break;
      }
    }
  }

  const sectionA = scaled.find((section) => section.letter === 'A');
  if (sectionA) {
    sectionA.assertionReasonCount = Math.min(sectionA.assertionReasonCount || 0, sectionA.questionCount);
    sectionA.mcqCount = Math.max(sectionA.questionCount - sectionA.assertionReasonCount, 0);
  }

  return scaled;
}

export function getCbsePhysicsInstructionLines(
  grade: number,
  totalMarks: number,
): string[] | null {
  const scaled = getScaledPhysicsBlueprint(grade, totalMarks);
  if (!scaled) return null;

  const sections = getScaledPhysicsSections(totalMarks);
  const totalQuestions = sections.reduce((sum, section) => sum + section.questionCount, 0);

  const instructionLines: string[] = [
    `Please check that this question paper contains ${totalQuestions} questions.`,
    'Read the following instructions carefully and strictly follow them.',
    'All questions are compulsory.',
    'This question paper is divided into five sections - Section A, B, C, D and E.',
  ];

  let qCursor = 1;
  for (const section of sections) {
    const qEnd = qCursor + section.questionCount - 1;
    if (section.letter === 'A') {
      const mcqEnd = qCursor + section.mcqCount - 1;
      instructionLines.push(
        `Question numbers ${qCursor} to ${mcqEnd} are multiple choice questions and question numbers ${mcqEnd + 1} to ${qEnd} are Assertion-Reason based questions carrying 1 mark each.`
      );
    } else if (section.letter === 'D') {
      instructionLines.push(
        `Question numbers ${qCursor} to ${qEnd} are case study based questions carrying ${section.marksPerQuestion} marks each.`
      );
    } else {
      instructionLines.push(
        `Question numbers ${qCursor} to ${qEnd} carry ${section.marksPerQuestion} marks each.`
      );
    }
    qCursor = qEnd + 1;
  }

  const choiceParts = sections
    .filter((section) => section.internalChoiceCount > 0)
    .map((section) => `${section.internalChoiceCount} question(s) in Section ${section.letter}`);
  if (choiceParts.length > 0) {
    instructionLines.push(
      `There is no overall choice. However, internal choice has been provided in ${choiceParts.join(', ')}.`
    );
  }

  instructionLines.push('Use of calculator is not permitted.');
  instructionLines.push('Use proper SI units and draw neat labelled diagrams wherever required.');

  return instructionLines;
}

export function buildCbsePhysicsPromptSection(
  subject: string,
  grade: number,
  totalMarks: number,
): string {
  if (subject.toLowerCase() !== 'physics') return '';

  const scaled = getScaledPhysicsBlueprint(grade, totalMarks);
  if (!scaled) return '';

  const isFullPaper = totalMarks === scaled.baseMarks;
  const sections = getScaledPhysicsSections(totalMarks);
  const totalQuestions = sections.reduce((sum, section) => sum + section.questionCount, 0);

  const weightageTable = scaled.weightageGroups
    .map((group) => {
      const units = group.unitNames.join('; ');
      const chapters = group.chapterNames.join(', ');
      return `  Units ${group.unitRange}: ~${group.scaledMarks} marks (${group.percentage}%)\n    Unit themes: ${units}\n    Chapters covered: ${chapters}`;
    })
    .join('\n');

  const rubricTable = scaled.rubricBands
    .map(
      (band) =>
        `  ${band.name}: ~${band.scaledMarks} marks (${band.percentage}%)\n    → ${band.description}`,
    )
    .join('\n');

  const scalingNote = isFullPaper
    ? ''
    : `\nNOTE: The CBSE base blueprint is for a 70-mark theory paper. This paper is ${totalMarks} marks, ` +
      `so all values have been scaled proportionally (factor ${scaled.scaleFactor.toFixed(2)}). ` +
      `Maintain the same percentages even though absolute marks differ.\n`;

  let qCursor = 1;
  const sectionLines = sections.map((section) => {
    const qEnd = qCursor + section.questionCount - 1;
    let text = `${section.title} (${section.questionCount} × ${section.marksPerQuestion} = ${section.totalMarks} marks):\n`;

    if (section.letter === 'A') {
      const mcqEnd = qCursor + section.mcqCount - 1;
      const arStart = mcqEnd + 1;
      text += `  - Questions ${qCursor} to ${mcqEnd}: Multiple Choice Questions (MCQs), 1 mark each, 4 options (A)/(B)/(C)/(D)\n`;
      text += `  - Questions ${arStart} to ${qEnd}: Assertion-Reason based questions, 1 mark each, 4 options\n`;
      text += '  - Before the first assertion-reason question, add a "Note/Direction" paragraph exactly like a CBSE board paper.\n';
      text += '  - Use EXACTLY these 4 options for all assertion-reason questions:\n';
      text += '    (A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).\n';
      text += '    (B) Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of Assertion (A).\n';
      text += '    (C) Assertion (A) is true, but Reason (R) is false.\n';
      text += '    (D) Assertion (A) is false, but Reason (R) is true.\n';
    } else if (section.letter === 'D') {
      text += `  - Questions ${qCursor} to ${qEnd}: Case-study based questions, 4 marks each\n`;
      text += '  - Each case study must contain a short paragraph/context followed by four sub-parts of 1 mark each\n';
      text += `  - Include an OR alternative in one sub-part for ${section.internalChoiceCount} question(s)\n`;
      text += '  - Use the question text format: "[Case paragraph]\\n(i) ... [1]\\n(ii) ... [1]\\n(iii) ... [1]\\n(iv) ... [1]\\nOR\\n(iv) alternative ... [1]"\n';
    } else if (section.letter === 'E') {
      text += `  - Questions ${qCursor} to ${qEnd}: Long answer questions, 5 marks each\n`;
      text += `  - Include an OR alternative for ${section.internalChoiceCount} question(s)\n`;
      text += '  - Prefer the board-paper style with sub-parts like (a)/(b) when natural\n';
    } else {
      text += `  - Questions ${qCursor} to ${qEnd}: ${section.questionType}, ${section.marksPerQuestion} marks each\n`;
      if (section.internalChoiceCount > 0) {
        text += `  - Include OR alternatives for ${section.internalChoiceCount} question(s) using "orText" and "orAnswer"\n`;
      }
    }

    qCursor = qEnd + 1;
    return text;
  });

  const instructionLines = getCbsePhysicsInstructionLines(grade, totalMarks) || [];

  return `
═══════════════════════════════════════════════════════════════
  CBSE PHYSICS THEORY BLUEPRINT — CLASS ${grade} (2025-26)
  THESE ARE MANDATORY GUIDELINES. DO NOT DEVIATE.
═══════════════════════════════════════════════════════════════
${scalingNote}
IMPORTANT SCOPE RULE:
- This is a THEORY paper only. Ignore the practical component.
- Use the 70-mark theory rubric as the source blueprint and scale it proportionally for ${totalMarks} marks.

UNIT / CHAPTER WEIGHTAGE DISTRIBUTION (Total: ${totalMarks} marks):
${weightageTable}

COGNITIVE / RUBRIC DISTRIBUTION (Total: ${totalMarks} marks):
${rubricTable}

═══════════════════════════════════════════════════════════════
  MANDATORY CBSE PHYSICS PAPER SKELETON
  IMPORTANT: For this Physics paper, use this section
  structure INSTEAD of any custom question distribution above.
═══════════════════════════════════════════════════════════════

${sectionLines.join('\n')}

ENGLISH INSTRUCTION-PAGE NOTES — use these EXACT instructions in the "instructions" array:
${instructionLines.map((line, i) => `(${toRomanLower(i + 1)}) ${line}`).join('\n')}

SECTION JSON FORMAT:
- Every section MUST include "marksInfo" using "count × marks = total"
- Every question with internal choice MUST include "orText" and "orAnswer"
- Section D case-study questions must embed sub-parts inside the question "text"
- Assertion-Reason questions must use "type": "assertion_reasoning"

HOW TO APPLY THESE GUIDELINES:
1. Distribute marks across the selected chapters so that the paper matches the unit-group weightage above as closely as possible.
2. Stay strictly within the teacher-selected chapters. Do NOT ask questions from chapters that were not selected.
3. If the selected chapters do not cover all unit groups, preserve the CBSE percentages as closely as possible within the represented groups.
4. Ensure the total marks in the final paper exactly equal ${totalMarks}.
5. Ensure the aggregate cognitive demand across all questions matches the rubric distribution above.
6. Keep the paper quality, difficulty level, and CBSE style aligned with the official theory blueprint.

ADDITIONAL CBSE NOTES:
${scaled.notes.map((note, i) => `  ${i + 1}. ${note}`).join('\n')}
═══════════════════════════════════════════════════════════════
`;
}

function toRomanLower(n: number): string {
  const lookup: [number, string][] = [
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
  ];
  let result = '';
  let remaining = n;
  for (const [value, numeral] of lookup) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}
