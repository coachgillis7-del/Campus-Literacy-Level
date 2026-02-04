
export enum Tier {
  WELL_BELOW = 'Well Below',
  BELOW = 'Below',
  AT = 'At',
  ABOVE = 'Above'
}

export enum InterventionGroup {
  FOUNDATIONAL = 'Group 1: Foundational (Phonemic Awareness/PSF)',
  DECODING = 'Group 2: Decoding (Blending/NWF)',
  FLUENCY = 'Group 3: Fluency (Rate and Accuracy/ORF)',
  ADVANCED = 'Group 4: Advanced (Comprehension/Vocabulary)'
}

export interface FormativeAssessment {
  id: string;
  date: string;
  type: 'Exit Ticket' | 'Weekly Quiz' | 'Scanned Sample';
  score: number; // 0-100 or specific metric
  skill: string;
  notes?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  psf: number | null;
  nwfCls: number | null;
  nwfWrc: number | null;
  wrf: number | null;
  orf: number | null;
  orfAccuracy: number | null;
  metAimLineWeeks: number;
  formativeAssessments: FormativeAssessment[];
}

export interface LessonPlan {
  title: string;
  warmUp: string;
  explicitModel: string;
  guidedPractice: string;
  checkUnderstaning: string;
}

export interface GroupAnalysis {
  groupId: InterventionGroup;
  students: string[];
  lessons: LessonPlan[];
  teacherAction: string;
}

export interface ClassHealth {
  wellBelow: number;
  below: number;
  at: number;
  above: number;
}

export interface MovementRecord {
  student: string;
  previousGroup: string;
  newGroup: string;
  reason: string;
}

export interface LiteracyAnalysisReport {
  classHealth: ClassHealth;
  groupings: GroupAnalysis[];
  movementReport: MovementRecord[];
  missingDataStudents: string[];
}
