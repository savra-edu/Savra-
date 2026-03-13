/**
 * CBSE Mathematics Question Paper Blueprint (2025-26)
 *
 * Strict guidelines extracted from official CBSE course structure and
 * question-paper-design documents for Class XI and XII.
 *
 * All weightage values are relative to MAX_MARKS = 80.
 * When a teacher chooses a different total, every marks figure is
 * scaled proportionally via `getScaledBlueprint()`.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UnitWeightage {
  unitNo: string;       // "I", "II", …
  unitName: string;
  marks: number;        // absolute marks at base (80)
}

export interface BloomLevel {
  level: number;        // 1, 2, 3
  name: string;
  description: string;
  marks: number;        // absolute marks at base (80)
  percentage: number;   // percentage weightage
}

export interface CbseMathBlueprint {
  grade: number;
  maxMarks: number;
  time: string;
  units: UnitWeightage[];
  bloomsDistribution: BloomLevel[];
  internalChoicePercent: number;
  notes: string[];
}

// ─── Class 11 ───────────────────────────────────────────────────────────────

const CLASS_11_BLUEPRINT: CbseMathBlueprint = {
  grade: 11,
  maxMarks: 80,
  time: '3 hours',
  units: [
    { unitNo: 'I',   unitName: 'Sets and Functions',         marks: 23 },
    { unitNo: 'II',  unitName: 'Algebra',                    marks: 25 },
    { unitNo: 'III', unitName: 'Coordinate Geometry',        marks: 12 },
    { unitNo: 'IV',  unitName: 'Calculus',                   marks: 8  },
    { unitNo: 'V',   unitName: 'Statistics and Probability', marks: 12 },
  ],
  bloomsDistribution: [
    {
      level: 1,
      name: 'Remembering & Understanding',
      description:
        'Exhibit memory of previously learned material by recalling facts, terms, basic concepts, and answers. ' +
        'Demonstrate understanding of facts and ideas by organising, comparing, translating, interpreting, giving descriptions, and stating main ideas.',
      marks: 44,
      percentage: 55,
    },
    {
      level: 2,
      name: 'Applying',
      description:
        'Solve problems to new situations by applying acquired knowledge, facts, techniques and rules in a different way.',
      marks: 20,
      percentage: 25,
    },
    {
      level: 3,
      name: 'Analysing, Evaluating & Creating',
      description:
        'Examine and break information into parts by identifying motives or causes. ' +
        'Make inferences and find evidence to support generalisations. ' +
        'Present and defend opinions by making judgments about information, validity of ideas, or quality of work based on a set of criteria. ' +
        'Compile information together in a different way by combining elements in a new pattern or proposing alternative solutions.',
      marks: 16,
      percentage: 20,
    },
  ],
  internalChoicePercent: 33,
  notes: [
    'No chapter/unit-wise weightage. Care to be taken to cover all chapters.',
    'Suitable internal variations may be made for generating various templates keeping the overall weightage to different form of questions and typology of questions same.',
    '33% internal choices will be given in all sections.',
    'There will be no overall choice in the question paper.',
  ],
};

// ─── Class 12 ───────────────────────────────────────────────────────────────

const CLASS_12_BLUEPRINT: CbseMathBlueprint = {
  grade: 12,
  maxMarks: 80,
  time: '3 hours',
  units: [
    { unitNo: 'I',   unitName: 'Relations and Functions',                    marks: 8  },
    { unitNo: 'II',  unitName: 'Algebra',                                    marks: 10 },
    { unitNo: 'III', unitName: 'Calculus',                                   marks: 35 },
    { unitNo: 'IV',  unitName: 'Vectors and Three-Dimensional Geometry',     marks: 14 },
    { unitNo: 'V',   unitName: 'Linear Programming',                        marks: 5  },
    { unitNo: 'VI',  unitName: 'Probability',                               marks: 8  },
  ],
  bloomsDistribution: [
    {
      level: 1,
      name: 'Remembering & Understanding',
      description:
        'Exhibit memory of previously learned material by recalling facts, terms, basic concepts, and answers. ' +
        'Demonstrate understanding of facts and ideas by organising, comparing, translating, interpreting, giving descriptions, and stating main ideas.',
      marks: 44,
      percentage: 55,
    },
    {
      level: 2,
      name: 'Applying',
      description:
        'Solve problems to new situations by applying acquired knowledge, facts, techniques and rules in a different way.',
      marks: 20,
      percentage: 25,
    },
    {
      level: 3,
      name: 'Analysing, Evaluating & Creating',
      description:
        'Examine and break information into parts by identifying motives or causes. ' +
        'Make inferences and find evidence to support generalisations. ' +
        'Present and defend opinions by making judgments about information, validity of ideas, or quality of work based on a set of criteria. ' +
        'Compile information together in a different way by combining elements in a new pattern or proposing alternative solutions.',
      marks: 16,
      percentage: 20,
    },
  ],
  internalChoicePercent: 33,
  notes: [
    'No chapter/unit-wise weightage. Care to be taken to cover all chapters.',
    'Suitable internal variations may be made for generating various templates keeping the overall weightage to different form of questions and typology of questions same.',
    '33% internal choices will be given in all sections.',
    'There will be no overall choice in the question paper.',
  ],
};

// ─── Lookup ─────────────────────────────────────────────────────────────────

const BLUEPRINTS: Record<number, CbseMathBlueprint> = {
  11: CLASS_11_BLUEPRINT,
  12: CLASS_12_BLUEPRINT,
};

/**
 * Returns the raw CBSE blueprint for the given grade, or `null` if we don't
 * have CBSE-specific guidelines for that grade.
 */
export function getCbseMathBlueprint(grade: number): CbseMathBlueprint | null {
  return BLUEPRINTS[grade] ?? null;
}

// ─── Scaling ────────────────────────────────────────────────────────────────

export interface ScaledUnit {
  unitNo: string;
  unitName: string;
  baseMarks: number;
  scaledMarks: number;
  percentage: number;
}

export interface ScaledBloom {
  name: string;
  description: string;
  baseMarks: number;
  scaledMarks: number;
  percentage: number;
}

export interface ScaledBlueprint {
  grade: number;
  requestedMarks: number;
  baseMarks: number;
  scaleFactor: number;
  units: ScaledUnit[];
  bloomsDistribution: ScaledBloom[];
  internalChoicePercent: number;
  notes: string[];
}

/**
 * Takes the CBSE base-80 blueprint and scales every marks figure
 * proportionally to `requestedMarks`.
 *
 * Rounding: individual values are rounded to nearest 0.5, then the
 * residual is absorbed by the largest unit/bloom to keep the total exact.
 */
export function getScaledBlueprint(
  grade: number,
  requestedMarks: number,
): ScaledBlueprint | null {
  const base = getCbseMathBlueprint(grade);
  if (!base) return null;

  const factor = requestedMarks / base.maxMarks;

  const roundHalf = (n: number) => Math.round(n * 2) / 2;

  // Scale units
  const scaledUnits: ScaledUnit[] = base.units.map((u) => ({
    unitNo: u.unitNo,
    unitName: u.unitName,
    baseMarks: u.marks,
    scaledMarks: roundHalf(u.marks * factor),
    percentage: parseFloat(((u.marks / base.maxMarks) * 100).toFixed(1)),
  }));

  // Adjust residual on largest unit
  const unitTotal = scaledUnits.reduce((s, u) => s + u.scaledMarks, 0);
  const unitDiff = requestedMarks - unitTotal;
  if (unitDiff !== 0) {
    const largest = scaledUnits.reduce((a, b) =>
      b.scaledMarks > a.scaledMarks ? b : a,
    );
    largest.scaledMarks = roundHalf(largest.scaledMarks + unitDiff);
  }

  // Scale Bloom's
  const scaledBlooms: ScaledBloom[] = base.bloomsDistribution.map((b) => ({
    name: b.name,
    description: b.description,
    baseMarks: b.marks,
    scaledMarks: roundHalf(b.marks * factor),
    percentage: b.percentage,
  }));

  const bloomTotal = scaledBlooms.reduce((s, b) => s + b.scaledMarks, 0);
  const bloomDiff = requestedMarks - bloomTotal;
  if (bloomDiff !== 0) {
    const largest = scaledBlooms.reduce((a, b) =>
      b.scaledMarks > a.scaledMarks ? b : a,
    );
    largest.scaledMarks = roundHalf(largest.scaledMarks + bloomDiff);
  }

  return {
    grade,
    requestedMarks,
    baseMarks: base.maxMarks,
    scaleFactor: factor,
    units: scaledUnits,
    bloomsDistribution: scaledBlooms,
    internalChoicePercent: base.internalChoicePercent,
    notes: base.notes,
  };
}

// ─── CBSE Section Structure ─────────────────────────────────────────────────

interface CbseSectionDef {
  letter: string;
  title: string;
  questionType: string;
  marksPerQuestion: number;
  questionCount: number;
  totalMarks: number;
  assertionReasonCount: number;
  internalChoiceCount: number;
  description: string;
}

const CBSE_80_SECTIONS: CbseSectionDef[] = [
  {
    letter: 'A',
    title: 'SECTION – A',
    questionType: 'MCQ + Assertion-Reason',
    marksPerQuestion: 1,
    questionCount: 20,
    totalMarks: 20,
    assertionReasonCount: 2,
    internalChoiceCount: 0,
    description: 'Questions 1 to 18 are Multiple Choice Questions (MCQs) and Questions 19 & 20 are Assertion-Reason based questions of 1 mark each.',
  },
  {
    letter: 'B',
    title: 'SECTION – B',
    questionType: 'Very Short Answer (VSA)',
    marksPerQuestion: 2,
    questionCount: 5,
    totalMarks: 10,
    assertionReasonCount: 0,
    internalChoiceCount: 2,
    description: '5 Very Short Answer (VSA) type questions of 2 marks each.',
  },
  {
    letter: 'C',
    title: 'SECTION – C',
    questionType: 'Short Answer (SA)',
    marksPerQuestion: 3,
    questionCount: 6,
    totalMarks: 18,
    assertionReasonCount: 0,
    internalChoiceCount: 3,
    description: '6 Short Answer (SA) type questions of 3 marks each.',
  },
  {
    letter: 'D',
    title: 'SECTION – D',
    questionType: 'Long Answer (LA)',
    marksPerQuestion: 5,
    questionCount: 4,
    totalMarks: 20,
    assertionReasonCount: 0,
    internalChoiceCount: 2,
    description: '4 Long Answer (LA) type questions of 5 marks each.',
  },
  {
    letter: 'E',
    title: 'SECTION – E',
    questionType: 'Case Study',
    marksPerQuestion: 4,
    questionCount: 3,
    totalMarks: 12,
    assertionReasonCount: 0,
    internalChoiceCount: 2,
    description: '3 Case Study based questions of 4 marks each. Each has sub-parts: (i) 1 mark, (ii) 1 mark, (iii) 2 marks.',
  },
];

/**
 * Scales the CBSE 5-section structure for non-80 totals.
 * Keeps marks-per-question fixed; adjusts question counts proportionally.
 */
function getScaledSections(totalMarks: number): CbseSectionDef[] {
  if (totalMarks === 80) return CBSE_80_SECTIONS;

  const factor = totalMarks / 80;
  const scaled: CbseSectionDef[] = CBSE_80_SECTIONS.map((s) => {
    const rawCount = Math.max(1, Math.round(s.questionCount * factor));
    const sectionTotal = rawCount * s.marksPerQuestion;
    const arCount = s.assertionReasonCount > 0
      ? Math.max(1, Math.round(s.assertionReasonCount * factor))
      : 0;
    const choiceCount = s.internalChoiceCount > 0
      ? Math.max(1, Math.round(s.internalChoiceCount * factor))
      : 0;
    return {
      ...s,
      questionCount: rawCount,
      totalMarks: sectionTotal,
      assertionReasonCount: Math.min(arCount, rawCount),
      internalChoiceCount: Math.min(choiceCount, rawCount),
    };
  });

  // Adjust to hit exact total by tweaking the largest section's count
  const currentTotal = scaled.reduce((s, sec) => s + sec.totalMarks, 0);
  const diff = totalMarks - currentTotal;
  if (diff !== 0) {
    const adjustable = [...scaled].sort((a, b) => b.totalMarks - a.totalMarks);
    for (const sec of adjustable) {
      const qDiff = Math.round(diff / sec.marksPerQuestion);
      if (qDiff !== 0 && sec.questionCount + qDiff >= 1) {
        sec.questionCount += qDiff;
        sec.totalMarks = sec.questionCount * sec.marksPerQuestion;
        break;
      }
    }
  }

  return scaled;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────

/**
 * Builds the CBSE-specific prompt section that gets injected into the
 * Gemini assessment prompt for Mathematics Class 11 / 12.
 *
 * Returns an empty string for non-applicable subject/grade combos so the
 * caller can just concatenate without branching.
 */
export function buildCbseMathPromptSection(
  subject: string,
  grade: number,
  totalMarks: number,
): string {
  const isMath =
    subject.toLowerCase() === 'mathematics' ||
    subject.toLowerCase() === 'maths';
  if (!isMath) return '';

  const scaled = getScaledBlueprint(grade, totalMarks);
  if (!scaled) return '';

  const isFullPaper = totalMarks === 80;
  const sections = getScaledSections(totalMarks);
  const totalQuestions = sections.reduce((s, sec) => s + sec.questionCount, 0);

  const unitTable = scaled.units
    .map(
      (u) =>
        `  Unit ${u.unitNo} – ${u.unitName}: ~${u.scaledMarks} marks (${u.percentage}%)`,
    )
    .join('\n');

  const bloomTable = scaled.bloomsDistribution
    .map(
      (b) =>
        `  ${b.name}: ~${b.scaledMarks} marks (${b.percentage}%)\n    → ${b.description}`,
    )
    .join('\n');

  const scalingNote = isFullPaper
    ? ''
    : `\nNOTE: The CBSE base blueprint is for 80 marks. This paper is ${totalMarks} marks, ` +
      `so all values have been scaled proportionally (factor ${scaled.scaleFactor.toFixed(2)}). ` +
      `Maintain the same PERCENTAGE distribution even though absolute marks differ.\n`;

  // Build section structure text
  let qStart = 1;
  const sectionLines = sections.map((s) => {
    const qEnd = qStart + s.questionCount - 1;
    const mcqEnd = s.assertionReasonCount > 0
      ? qEnd - s.assertionReasonCount
      : qEnd;
    const arStart = s.assertionReasonCount > 0 ? mcqEnd + 1 : 0;

    let desc = `${s.title} (${s.questionCount} × ${s.marksPerQuestion} = ${s.totalMarks} marks):\n`;
    if (s.letter === 'A' && s.assertionReasonCount > 0) {
      desc += `  - Questions ${qStart} to ${mcqEnd}: Multiple Choice Questions (MCQs), 1 mark each, 4 options (A)/(B)/(C)/(D)\n`;
      desc += `  - Questions ${arStart} to ${qEnd}: Assertion-Reason based, 1 mark each, 4 options\n`;
      desc += `    → Before Q${arStart}, include a "Direction" paragraph explaining the Assertion-Reason format\n`;
      desc += `    → Use EXACTLY these 4 options for ALL assertion-reason questions:\n`;
      desc += `      (A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).\n`;
      desc += `      (B) Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of Assertion (A).\n`;
      desc += `      (C) Assertion (A) is true, but Reason (R) is false.\n`;
      desc += `      (D) Assertion (A) is false, but Reason (R) is true.\n`;
    } else if (s.letter === 'E') {
      desc += `  - Questions ${qStart} to ${qEnd}: Case Study based, ${s.marksPerQuestion} marks each\n`;
      desc += `  - Each case study has a real-life scenario + sub-parts: (i) 1 mark, (ii) 1 mark, (iii) 2 marks\n`;
      desc += `  - Internal choice (OR) in the (iii) sub-part of ${s.internalChoiceCount} question(s)\n`;
      desc += `  - Put sub-parts in the question text using format: "(i) text [1]\\n(ii) text [1]\\n(iii) (a) text [2]\\nOR\\n(iii) (b) alt text [2]"\n`;
    } else {
      desc += `  - Questions ${qStart} to ${qEnd}: ${s.questionType}, ${s.marksPerQuestion} marks each\n`;
      if (s.internalChoiceCount > 0) {
        desc += `  - Internal choice (OR) in ${s.internalChoiceCount} question(s). Use "orText" field for OR alternative.\n`;
      }
    }
    qStart = qEnd + 1;
    return desc;
  });

  // Build the exact general instructions for this paper
  qStart = 1;
  const instructionLines: string[] = [
    `This Question paper contains ${totalQuestions} questions. All questions are compulsory.`,
    `Question paper is divided into FIVE Sections – Section A, B, C, D and E.`,
  ];
  let qCursor = 1;
  for (const s of sections) {
    const qEnd = qCursor + s.questionCount - 1;
    if (s.letter === 'A' && s.assertionReasonCount > 0) {
      const mcqEnd = qEnd - s.assertionReasonCount;
      instructionLines.push(
        `In Section A – Question Number ${qCursor} to ${mcqEnd} are Multiple Choice Questions (MCQs) and Question Number ${mcqEnd + 1} & ${qEnd} are Assertion-Reason based questions of ${s.marksPerQuestion} mark each.`
      );
    } else {
      const typeLabel =
        s.letter === 'B' ? 'Very Short Answer (VSA)' :
        s.letter === 'C' ? 'Short Answer (SA)' :
        s.letter === 'D' ? 'Long Answer (LA)' :
        'case study';
      instructionLines.push(
        `In Section ${s.letter} – Question Number ${qCursor} to ${qEnd} are ${typeLabel} type questions, carrying ${s.marksPerQuestion} marks each.`
      );
    }
    qCursor = qEnd + 1;
  }
  const choiceParts = sections
    .filter((s) => s.internalChoiceCount > 0)
    .map((s) => `${s.internalChoiceCount} questions in Section – ${s.letter}`);
  instructionLines.push(
    `There is no overall choice. However, an internal choice has been provided in ${choiceParts.join(', ')}.`
  );
  instructionLines.push('Use of calculator is NOT allowed.');

  return `
═══════════════════════════════════════════════════════════════
  CBSE MATHEMATICS QUESTION PAPER BLUEPRINT — CLASS ${grade} (2025-26)
  THESE ARE MANDATORY GUIDELINES. DO NOT DEVIATE.
═══════════════════════════════════════════════════════════════
${scalingNote}
UNIT-WISE MARKS DISTRIBUTION (Total: ${totalMarks} marks):
${unitTable}

COGNITIVE-LEVEL / BLOOM'S TAXONOMY DISTRIBUTION (Total: ${totalMarks} marks):
${bloomTable}

══════════════════════════════════════════════════════════════
  MANDATORY CBSE 5-SECTION PAPER STRUCTURE
  IMPORTANT: For this Mathematics paper, use this 5-section
  structure INSTEAD of any question distribution above.
══════════════════════════════════════════════════════════════

${sectionLines.join('\n')}

INTERNAL CHOICE FORMAT:
- For questions with OR alternatives in Sections B/C/D, include an "orText"
  field with the alternative question, and "orAnswer" for its answer.
- For case study sub-parts with OR, embed the OR in the question text.
- Questions WITHOUT internal choice should NOT have orText.

GENERAL INSTRUCTIONS — use these EXACT instructions in the "instructions" array:
${instructionLines.map((line, i) => `(${toRomanLower(i + 1)}) ${line}`).join('\n')}

SECTION JSON FORMAT — each section must have a "marksInfo" field:
  "marksInfo": "${sections[0].questionCount} × ${sections[0].marksPerQuestion} = ${sections[0].totalMarks}"

ASSERTION-REASON questions (last ${sections[0].assertionReasonCount} in Section A):
  - Each must have "type": "assertion_reasoning"
  - Format: "Assertion (A): [statement]\\nReason (R): [statement]"
  - Use EXACTLY 4 options as specified above

ADDITIONAL CBSE NOTES:
${scaled.notes.map((n, i) => `  ${i + 1}. ${n}`).join('\n')}
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
