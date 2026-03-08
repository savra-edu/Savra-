/**
 * Generates Word-compatible HTML (.doc) for download.
 * Word opens HTML files with .doc extension.
 */

import { Lesson, Quiz } from "@/types/api"
import { normalizeScientificText } from "./scientific-text"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>")
}

function triggerDownload(html: string, filename: string): void {
  const fullHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:word">
<head><meta charset="utf-8"><title>${filename.replace(/\.doc$/, "")}</title></head>
<body>${html}</body>
</html>`
  const blob = new Blob([fullHtml], { type: "application/msword" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".doc") ? filename : `${filename}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function downloadLessonPlanDoc(lesson: Lesson, teacherName: string): void {
  const subject = lesson.subject?.name || "Subject"
  const grade = lesson.class?.grade || ""
  const topic = lesson.topic || "-"
  const periods = lesson.periods || []

  const columns = [
    { width: "6%", header: "Period<br/>No" },
    { width: "12%", header: "Concept" },
    { width: "13%", header: "Learning<br/>Outcomes<br/>(Competency<br/>Based)" },
    { width: "14%", header: "Teacher-<br/>Learning<br/>Process" },
    { width: "11%", header: "Assessment" },
    { width: "10%", header: "Resources" },
    { width: "13%", header: "21st<br/>Century<br/>Skills/Value<br/>Education" },
    { width: "11%", header: "Real<br/>Life<br/>Application" },
    { width: "10%", header: "Reflection" },
  ]

  let periodsHtml = ""
  if (periods.length > 0) {
    const headerCells = columns
      .map((c) => `<th style="width:${c.width}">${c.header}</th>`)
      .join("")

    const rows = periods
      .map(
        (p) => `<tr>
          <td style="text-align:center">${p.periodNo}</td>
          <td>${escapeHtml(p.concept || "")}</td>
          <td>${escapeHtml(p.learningOutcomes || "")}</td>
          <td>${escapeHtml(p.teacherLearningProcess || "")}</td>
          <td>${escapeHtml(p.assessment || "")}</td>
          <td>${escapeHtml(p.resources || "")}</td>
          <td>${escapeHtml(p.centurySkillsValueEducation || "")}</td>
          <td>${escapeHtml(p.realLifeApplication || "")}</td>
          <td>${escapeHtml(p.reflection || "")}</td>
        </tr>`
      )
      .join("")

    periodsHtml = `
    <table class="periods">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  }

  const fullHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>LessonPlan-${subject}-Grade${grade}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page WordSection1 {
    size: 841.9pt 595.3pt;
    margin: 0.4in 0.4in 0.4in 0.4in;
    mso-page-orientation: landscape;
  }
  div.WordSection1 { page: WordSection1; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8pt;
    margin: 0;
    padding: 0;
  }
  p.doc-title { font-size: 14pt; font-weight: bold; text-align: center; margin: 4pt 0 2pt 0; }
  p.doc-subtitle { font-size: 11pt; font-weight: bold; text-align: center; margin: 2pt 0; }
  p.doc-grade { font-size: 10pt; font-weight: bold; text-align: center; margin: 2pt 0 8pt 0; }
  table.info {
    border-collapse: collapse;
    margin: 0 auto 10pt auto;
  }
  table.info td {
    border: 1pt solid #000;
    padding: 4pt 8pt;
    vertical-align: top;
    width: 180pt;
  }
  table.info .label { font-size: 7pt; color: #666; }
  table.info .value { font-size: 9pt; font-weight: bold; }
  table.periods {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
  }
  table.periods th,
  table.periods td {
    border: 1pt solid #000;
    padding: 2pt 3pt;
    font-size: 7pt;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  table.periods th {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
    vertical-align: middle;
  }
  table.periods td { line-height: 1.3; }
</style>
</head>
<body>
<div class="WordSection1">
  <p class="doc-title">${escapeHtml(subject)}</p>
  <p class="doc-subtitle">Lesson Plan</p>
  <p class="doc-grade">Grade ${grade}</p>
  <table class="info">
    <tr>
      <td><span class="label">Teacher Name</span><br/><span class="value">${escapeHtml(teacherName || "N/A")}</span></td>
      <td><span class="label">Topic:</span><br/><span class="value">${escapeHtml(topic)}</span></td>
      <td><span class="label">No of periods required:</span><br/><span class="value">${lesson.numberOfPeriods || "-"}</span></td>
    </tr>
  </table>
  ${periodsHtml}
</div>
</body>
</html>`

  const blob = new Blob([fullHtml], { type: "application/msword" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `LessonPlan-${subject}-Grade${grade}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

interface QuizForDoc {
  id: string
  title: string
  subject?: { name: string }
  class?: { grade: number; section: string }
  chapters?: Array<{ name: string }>
  timeLimit?: number | null
  totalQuestions?: number
  totalMarks?: number
  questions?: Array<{
    questionText: string
    questionType: string
    marks: number
    options?: Array<{ optionLabel: string; optionText: string }>
  }>
}

export function downloadQuizDoc(quiz: QuizForDoc, _teacherName: string): void {
  const subject = quiz.subject?.name || "Quiz"
  const grade = quiz.class ? `${quiz.class.grade}${quiz.class.section}` : ""
  const questions = quiz.questions || []
  const topics = quiz.chapters?.map((c) => c.name).join(", ") || ""

  const questionsHtml = questions
    .map(
      (q, i) => {
        const opts =
          q.options
            ?.map(
              (o) =>
                `<p style="margin:4px 0 4px 20px;">${o.optionLabel}. ${escapeHtml(o.optionText)}</p>`
            )
            .join("") || ""
        return `
      <div style="margin-bottom:16px;">
        <p><strong>Question ${i + 1}:</strong> ${escapeHtml(q.questionText)} [${q.marks} mark(s)]</p>
        ${opts}
      </div>`
      }
    )
    .join("")

  const html = `
    <h2>${escapeHtml(quiz.title || "Quiz")}</h2>
    <p><strong>Subject:</strong> ${escapeHtml(subject)} | <strong>Class:</strong> ${grade} | <strong>Topics:</strong> ${escapeHtml(topics)}</p>
    <p><strong>Time:</strong> ${quiz.timeLimit ? `${quiz.timeLimit} mins` : "-"} | <strong>Total Questions:</strong> ${quiz.totalQuestions ?? questions.length} | <strong>Total Marks:</strong> ${quiz.totalMarks ?? questions.length}</p>
    <hr/>
    <h3>Instructions</h3>
    <ul>
      <li>Attempt all questions.</li>
      <li>Each question carries 1 mark.</li>
      <li>Choose the most appropriate answer.</li>
    </ul>
    <hr/>
    <h3>Questions</h3>
    ${questionsHtml}
  `
  triggerDownload(html, `Quiz-${subject}-Grade${grade}.doc`)
}

interface AssessmentForDoc {
  title: string
  subject?: { name: string }
  class?: { grade: number; section: string }
  chapters?: Array<{ name: string }>
  totalMarks?: number
  questionPaper?: {
    instructions?: string[]
    sections?: Array<{
      title?: string
      name?: string
      instructions?: string
      questions: Array<{ number?: number; text: string; options?: string[]; marks?: number }>
    }>
    questions?: Array<{ number?: number; text: string; options?: string[]; marks?: number }>
  } | null
}

export function downloadAssessmentDoc(assessment: AssessmentForDoc, _teacherName: string): void {
  const subject = assessment.subject?.name || "QuestionPaper"
  const grade = assessment.class ? `${assessment.class.grade}-${assessment.class.section}` : ""
  const chapter = assessment.chapters?.map((c) => c.name).join(", ") || ""
  const qp = assessment.questionPaper
  const instructions = qp?.instructions || [
    "All questions are compulsory.",
    "Show necessary steps for full marks.",
  ]
  const sections = qp?.sections
  const flatQuestions = qp?.questions || (sections ? sections.flatMap((s) => s.questions || []) : [])

  let questionsHtml = ""
  if (sections && sections.length > 0) {
    questionsHtml = sections
      .map(
        (sec, si) => `
      <h4>${escapeHtml(sec.title || sec.name || `Section ${String.fromCharCode(65 + si)}`)}</h4>
      ${sec.instructions ? `<p><em>${escapeHtml(sec.instructions)}</em></p>` : ""}
      ${(sec.questions || [])
        .map(
          (q, i) => `
        <p><strong>Q${q.number ?? i + 1}:</strong> ${escapeHtml(normalizeScientificText(q.text))}${q.marks != null ? ` (${q.marks} marks)` : ""}</p>
        ${(q.options || []).map((o, j) => `<p style="margin-left:20px;">${String.fromCharCode(97 + j)}) ${escapeHtml(normalizeScientificText(o))}</p>`).join("")}
      `
        )
        .join("")}
    `
      )
      .join("")
  } else {
    questionsHtml = flatQuestions
      .map(
        (q, i) => `
      <p><strong>Q${q.number ?? i + 1}:</strong> ${escapeHtml(normalizeScientificText(q.text))}${q.marks != null ? ` (${q.marks} marks)` : ""}</p>
      ${(q.options || []).map((o, j) => `<p style="margin-left:20px;">${String.fromCharCode(97 + j)}) ${escapeHtml(normalizeScientificText(o))}</p>`).join("")}
    `
      )
      .join("")
  }

  const html = `
    <h2>SAVRA - Question Paper</h2>
    <p><strong>Subject:</strong> ${escapeHtml(subject)} | <strong>Class:</strong> ${grade} | <strong>Chapter:</strong> ${escapeHtml(chapter)}</p>
    <p><strong>Maximum Marks:</strong> ${assessment.totalMarks ?? 100} | <strong>Time:</strong> 60 mins</p>
    <h3>General Instructions</h3>
    <ol>${instructions.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ol>
    <hr/>
    ${questionsHtml}
  `
  triggerDownload(html, `QuestionPaper-${subject}-Grade${grade}.doc`)
}
