
import { GoogleGenAI, Type } from "@google/genai";
import { LiteracyAnalysisReport, StudentRecord, FormativeAssessment } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeLiteracyData = async (students: StudentRecord[]): Promise<LiteracyAnalysisReport> => {
  const prompt = `
    You are the "Campus Literacy Lead AI." Analyze the following 1st Grade DIBELS 8th data and Formative Assessment profiles.
    
    1ST GRADE BENCHMARKS (EOY TARGETS):
    - Composite: 441
    - LNF: 59
    - PSF: 45
    - NWF-CLS: 55
    - NWF-WRC: 15
    - WRF: 25
    - ORF: 39 (with 91%+ accuracy)

    CONSIDER:
    - Weigh formative assessments (exit tickets, quizzes) alongside DIBELS scores. 
    - If formative scores show >85% for 3 days, consider it strong evidence for group movement even if DIBELS is slightly below.
    - If DIBELS is 'At' but formative scores are dropping (<60%), flag for regression.
    - Use Composite score as a primary indicator of overall literacy health.
    - LNF and PSF are foundational; NWF is decoding; WRF and ORF are fluency.

    TASKS:
    1. Tier students (Well Below, Below, At, Above) based on Composite and component scores.
    2. Group them into 4 intervention groups:
       - Group 1: Foundational (PSF/LNF focus)
       - Group 2: Decoding (NWF focus)
       - Group 3: Fluency (WRF/ORF focus)
       - Group 4: Advanced (Comprehension/Vocabulary)
    3. Suggest movement based on 'metAimLineWeeks' >= 3 OR strong formative trends.
    4. Create three 15-minute lessons for each group.
    5. FERPA: Use First Name + Last Initial only.
    6. Flag missing data.

    STUDENT DATA (INCLUDING FORMATIVE):
    ${JSON.stringify(students)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          classHealth: {
            type: Type.OBJECT,
            properties: {
              wellBelow: { type: Type.NUMBER },
              below: { type: Type.NUMBER },
              at: { type: Type.NUMBER },
              above: { type: Type.NUMBER }
            },
            required: ['wellBelow', 'below', 'at', 'above']
          },
          groupings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                groupId: { type: Type.STRING },
                students: { type: Type.ARRAY, items: { type: Type.STRING } },
                lessons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      warmUp: { type: Type.STRING },
                      explicitModel: { type: Type.STRING },
                      guidedPractice: { type: Type.STRING },
                      checkUnderstaning: { type: Type.STRING }
                    },
                    required: ['title', 'warmUp', 'explicitModel', 'guidedPractice', 'checkUnderstaning']
                  }
                },
                teacherAction: { type: Type.STRING }
              },
              required: ['groupId', 'students', 'lessons', 'teacherAction']
            }
          },
          movementReport: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                student: { type: Type.STRING },
                previousGroup: { type: Type.STRING },
                newGroup: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['student', 'previousGroup', 'newGroup', 'reason']
            }
          },
          missingDataStudents: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['classHealth', 'groupings', 'movementReport', 'missingDataStudents']
      }
    }
  });

  return JSON.parse(response.text);
};

export const extractFormativeData = async (base64Data: string, mimeType: string): Promise<{ studentName: string; assessment: Partial<FormativeAssessment> }> => {
  const prompt = `
    Extract literacy assessment data from this scanned student sample or document. 
    Identify:
    - Student Name
    - Date of assessment
    - Type of assessment (Exit Ticket, Quiz, etc.)
    - Score (usually a fraction like 4/5 or a percentage)
    - Targeted Skill (e.g., Short vowels, Blending, Digraphs)
    - Brief observation or notes on their handwriting/errors.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          studentName: { type: Type.STRING },
          assessment: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              type: { type: Type.STRING },
              score: { type: Type.NUMBER },
              skill: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ['score', 'skill']
          }
        },
        required: ['studentName', 'assessment']
      }
    }
  });

  return JSON.parse(response.text);
};

export const parseRosterFromMedia = async (base64Data: string, mimeType: string): Promise<Partial<StudentRecord>[]> => {
  const prompt = `
    You are an expert at reading DIBELS 8th Edition / mCLASS Summary reports.
    This document contains 19 pages. Each page is a summary for a DIFFERENT student.
    
    TASK:
    Extract data for EVERY student found in the document. You MUST process all 19 pages.
    
    FOR EACH STUDENT:
    1. Extract the Full Name from the top (e.g., "Ariel Ayers Summary" -> "Ariel Ayers"). Strip the word "Summary".
    2. Locate the "Grade 1 (2025 - 2026)" table.
    3. Find the "MOY" (Middle of Year) column.
    4. For each metric, extract the value from the "Score" row (NOT the "Goal" row).
    
    METRIC MAPPING:
    - "Composite" Score -> composite
    - "LNF" (Letter Names) Score -> lnf
    - "PSF" (Phonemic Awareness) Score -> psf
    - "NWF-CLS" (Letter Sounds) Score -> nwfCls
    - "NWF-WRC" (Decoding) Score -> nwfWrc
    - "WRF" (Word Reading) Score -> wrf
    - "ORF-Accu" (Reading Accuracy) Score -> orfAccuracy (e.g., "87%" -> 87, "0%" -> 0)
    - "ORF" (Reading Fluency) Score -> orf
    
    IMPORTANT:
    - If a score is "Discont'd", "—", or blank, set it to null.
    - Do NOT stop after the first page. Process the entire document.
    - Return a JSON array of objects.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            composite: { type: Type.NUMBER, nullable: true },
            lnf: { type: Type.NUMBER, nullable: true },
            psf: { type: Type.NUMBER, nullable: true },
            nwfCls: { type: Type.NUMBER, nullable: true },
            nwfWrc: { type: Type.NUMBER, nullable: true },
            wrf: { type: Type.NUMBER, nullable: true },
            orf: { type: Type.NUMBER, nullable: true },
            orfAccuracy: { type: Type.NUMBER, nullable: true }
          },
          required: ['name']
        }
      }
    }
  });

  return JSON.parse(response.text);
};
