import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Lesson, Quiz } from "@/types/api"
import { normalizeScientificTextForPdf } from "./scientific-text"

// Format date for display: "2nd Dec'25"
function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return ""
  
  try {
    const date = new Date(dateString)
    const day = date.getDate()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear().toString().slice(-2)
    
    // Get ordinal suffix
    const ordinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"]
      const v = n % 100
      return n + (s[(v - 20) % 10] || s[v] || s[0])
    }
    
    return `${ordinal(day)} ${month}'${year}`
  } catch {
    return dateString
  }
}

/** Strip NEP/NCF citation parentheses from lesson plan text for PDF display only (e.g. "(NEP 2020, 4.4, p. 5)"). */
function stripNepNcfRefs(text: string): string {
  if (!text || typeof text !== "string") return text
  return text
    .replace(/\s*\(NEP[^)]*\)/g, "")
    .replace(/\s*\(NCF[^)]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

type ScientificTextToken = {
  text: string
  isSuperscript: boolean
  isWhitespace: boolean
}

const PDF_CARET_EXPONENT_PATTERN = /\^(\([0-9A-Za-z+\-=]+\)|[+\-]?[0-9A-Za-z]+)/g

function tokenizeScientificText(text: string): ScientificTextToken[] {
  const normalized = normalizeScientificTextForPdf(text)
  const tokens: ScientificTextToken[] = []
  let lastIndex = 0

  const pushPlainText = (value: string) => {
    for (const part of value.split(/(\s+)/)) {
      if (!part) continue
      tokens.push({
        text: part,
        isSuperscript: false,
        isWhitespace: /^\s+$/.test(part),
      })
    }
  }

  for (const match of normalized.matchAll(PDF_CARET_EXPONENT_PATTERN)) {
    const matchIndex = match.index ?? 0
    pushPlainText(normalized.slice(lastIndex, matchIndex))
    tokens.push({
      text: match[1] || "",
      isSuperscript: true,
      isWhitespace: false,
    })
    lastIndex = matchIndex + match[0].length
  }

  pushPlainText(normalized.slice(lastIndex))

  return tokens
}

function measurePdfTextWidth(doc: jsPDF, text: string, fontSize: number): number {
  const previousFontSize = doc.getFontSize()
  doc.setFontSize(fontSize)
  const width = doc.getTextWidth(text)
  doc.setFontSize(previousFontSize)
  return width
}

function wrapScientificText(doc: jsPDF, text: string, width: number, baseFontSize: number, superscriptFontSize: number) {
  const paragraphs = normalizeScientificTextForPdf(text).split(/\n/)
  const lines: ScientificTextToken[][] = []

  for (const paragraph of paragraphs) {
    const tokens = tokenizeScientificText(paragraph)
    let currentLine: ScientificTextToken[] = []
    let currentWidth = 0

    const commitLine = () => {
      if (currentLine.length === 0) {
        lines.push([])
        return
      }

      while (currentLine.length > 0 && currentLine[0].isWhitespace) {
        currentLine.shift()
      }
      while (currentLine.length > 0 && currentLine[currentLine.length - 1].isWhitespace) {
        currentLine.pop()
      }

      lines.push([...currentLine])
      currentLine = []
      currentWidth = 0
    }

    for (const token of tokens) {
      const tokenWidth = measurePdfTextWidth(
        doc,
        token.text,
        token.isSuperscript ? superscriptFontSize : baseFontSize
      )

      if (currentLine.length === 0 && token.isWhitespace) {
        continue
      }

      if (!token.isWhitespace && currentLine.length > 0 && currentWidth + tokenWidth > width) {
        commitLine()
      }

      if (currentLine.length === 0 && token.isWhitespace) {
        continue
      }

      currentLine.push(token)
      currentWidth += tokenWidth
    }

    commitLine()
  }

  return lines
}

function drawScientificText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  options?: {
    lineHeight?: number
    baseFontSize?: number
    superscriptFontSize?: number
    superscriptRise?: number
  }
) {
  const baseFontSize = options?.baseFontSize ?? doc.getFontSize()
  const superscriptFontSize = options?.superscriptFontSize ?? Math.max(6, baseFontSize - 2)
  const superscriptRise = options?.superscriptRise ?? 1.8
  const lineHeight = options?.lineHeight ?? baseFontSize * 0.45
  const lines = wrapScientificText(doc, text, width, baseFontSize, superscriptFontSize)
  const previousFontSize = doc.getFontSize()

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    let cursorX = x
    const lineY = y + lineIndex * lineHeight

    for (const token of line) {
      const tokenFontSize = token.isSuperscript ? superscriptFontSize : baseFontSize
      doc.setFontSize(tokenFontSize)
      doc.text(token.text, cursorX, token.isSuperscript ? lineY - superscriptRise : lineY)
      cursorX += doc.getTextWidth(token.text)
    }
  }

  doc.setFontSize(previousFontSize)

  return {
    lines,
    height: Math.max(lines.length, 1) * lineHeight,
  }
}

export function generateLessonPlanPDF(lesson: Lesson, teacherName: string): { url: string; filename: string } {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  // Set font
  doc.setFont("helvetica")

  let yPos = 15

  // Header Section - Centered Title Block
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(lesson.subject?.name || "Subject", 148, yPos, { align: "center" })
  yPos += 7
  doc.text("Lesson Plan", 148, yPos, { align: "center" })
  yPos += 7
  doc.text(`Grade ${lesson.class?.grade || ""}`, 148, yPos, { align: "center" })
  yPos += 10

  // Skip date range - removed per requirements
  // yPos remains at current position

  // Three Input Boxes - Connected 1x3 Matrix, Centered
  const boxWidth = 60
  const boxHeight = 15
  const totalWidth = boxWidth * 3 // No spacing, boxes are connected
  const pageWidth = 297 // A4 landscape width in mm
  const startX = (pageWidth - totalWidth) / 2 // Center the boxes
  const boxY = yPos

  // Draw the connected boxes as one rectangle with internal dividers
  doc.setDrawColor(0, 0, 0)
  // Draw outer rectangle
  doc.rect(startX, boxY, totalWidth, boxHeight)
  // Draw vertical dividers (no spacing, just lines)
  doc.line(startX + boxWidth, boxY, startX + boxWidth, boxY + boxHeight)
  doc.line(startX + boxWidth * 2, boxY, startX + boxWidth * 2, boxY + boxHeight)

  // Box 1: Teacher Name
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("Teacher Name", startX + 2, boxY + 5)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text(teacherName || "N/A", startX + 2, boxY + 10)

  // Box 2: Topic
  const box2X = startX + boxWidth
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("Topic:", box2X + 2, boxY + 5)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  const topicText = lesson.topic || "-"
  doc.text(topicText.length > 25 ? topicText.substring(0, 22) + "..." : topicText, box2X + 2, boxY + 10)

  // Box 3: No of periods required
  const box3X = startX + boxWidth * 2
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("No of periods required:", box3X + 2, boxY + 5)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text(String(lesson.numberOfPeriods || "-"), box3X + 2, boxY + 10)

  yPos = boxY + boxHeight + 10

  // Period Table
  if (lesson.periods && lesson.periods.length > 0) {
    // Filter out periods that have no content (all fields empty)
    const validPeriods = lesson.periods.filter(period => {
      return period.concept || 
             period.learningOutcomes || 
             period.teacherLearningProcess || 
             period.assessment || 
             period.resources || 
             period.centurySkillsValueEducation || 
             period.realLifeApplication || 
             period.reflection
    })
    
    // Only generate table if we have valid periods with content
    if (validPeriods.length === 0) {
      console.warn('No periods with content found, generating empty table')
    }
    
    // Respect hiddenColumns: only include columns not removed by the user
    const hiddenSet = new Set(Array.isArray(lesson.hiddenColumns) ? lesson.hiddenColumns : [])
    const periodCols = [
      { key: "periodNo" as const, header: "Period\nNo", width: 18 },
      { key: "concept" as const, header: "Concept", width: 32 },
      { key: "learningOutcomes" as const, header: "Learning\nOutcomes\n(Competency\nBased)", width: 36 },
      { key: "teacherLearningProcess" as const, header: "Teacher-\nLearning\nProcess", width: 36 },
      { key: "assessment" as const, header: "Assessment", width: 28 },
      { key: "resources" as const, header: "Resources", width: 28 },
      { key: "centurySkillsValueEducation" as const, header: "21st\nCentury\nSkills/Value\nEducation", width: 36 },
      { key: "realLifeApplication" as const, header: "Real\nLife\nApplication", width: 28 },
      { key: "reflection" as const, header: "Reflection", width: 28 },
    ]
    const visibleCols = periodCols.filter((c) => c.key === "periodNo" || !hiddenSet.has(c.key))

    const tableData = lesson.periods.map((period) =>
      visibleCols.map((col) =>
        col.key === "periodNo" ? String(period.periodNo) : stripNepNcfRefs((period[col.key] as string) || "")
      )
    )
    const headers = visibleCols.map((c) => c.header)

    // Scale column widths to use full page width so table never overflows or looks cut off (A4 landscape - margins)
    const TABLE_AVAILABLE_WIDTH_MM = 277
    const totalRelativeWidth = visibleCols.reduce((sum, c) => sum + c.width, 0)
    const columnStyles: Record<number, { cellWidth: number; halign?: "left" | "center" | "right" }> = {}
    visibleCols.forEach((c, i) => {
      const cellWidth = Math.round((c.width / totalRelativeWidth) * TABLE_AVAILABLE_WIDTH_MM)
      columnStyles[i] = c.key === "periodNo" ? { cellWidth, halign: "center" } : { cellWidth }
    })

    console.log('Generating PDF with', lesson.periods.length, 'periods,', validPeriods.length, 'with content,', visibleCols.length, 'columns')

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPos,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 7,
        halign: "center",
        valign: "middle",
        cellPadding: 2,
        lineWidth: 0.1,
        minCellHeight: 15,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 7,
        halign: "left",
        valign: "top",
        fillColor: false,
      },
      columnStyles,
      // Override styles for header cells to ensure grey background
      didParseCell: function (data: any) {
        if (data.section === 'head') {
          // Ensure all header cells have the grey background
          data.cell.styles.fillColor = [245, 245, 245];
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        } else {
          // Ensure body cells have no background
          data.cell.styles.fillColor = false;
        }
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
    })
  }

  // Generate filename (without date)
  const subjectName = lesson.subject?.name || "Lesson"
  const grade = lesson.class?.grade || ""
  const filename = `LessonPlan-${subjectName}-Grade${grade}.pdf`

  // Return blob URL for display instead of saving
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  
  return { url: pdfUrl, filename }
}

// Generate and display PDF in iframe
export function generateAndDisplayLessonPlanPDF(lesson: Lesson, teacherName: string): string {
  const { url } = generateLessonPlanPDF(lesson, teacherName)
  return url
}

// Generate Quiz PDF
export function generateQuizPDF(quiz: Quiz, teacherName: string, includeAnswerKey = false): { url: string; filename: string } {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set font
  doc.setFont("helvetica")

  let yPos = 15
  const pageWidth = 210 // A4 portrait width
  const margin = 15
  const contentWidth = pageWidth - margin * 2

  // Header Section
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(quiz.title || "Quiz", pageWidth / 2, yPos, { align: "center" })
  yPos += 8

  // Subject and Class
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  const subjectText = `${quiz.subject?.name || "Subject"} - Grade ${quiz.class?.grade || ""}`
  doc.text(subjectText, pageWidth / 2, yPos, { align: "center" })
  yPos += 10

  // Quiz info box
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(248, 248, 248)
  doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, "FD")

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  const infoY = yPos + 8

  // Time limit
  doc.text(`Time: ${quiz.timeLimit ? `${quiz.timeLimit} mins` : "N/A"}`, margin + 5, infoY)

  // Total marks
  doc.text(`Total Marks: ${quiz.totalMarks || 0}`, margin + 50, infoY)

  // Total questions
  doc.text(`Questions: ${quiz.totalQuestions || quiz.questions?.length || 0}`, margin + 100, infoY)

  // Difficulty
  doc.text(`Level: ${quiz.difficultyLevel || "medium"}`, margin + 145, infoY)

  yPos += 25

  // Teacher name
  doc.setFontSize(10)
  doc.text(`Teacher: ${teacherName || "N/A"}`, margin, yPos)
  yPos += 8

  // Chapters (if available)
  if (quiz.chapters && quiz.chapters.length > 0) {
    const chapterNames = quiz.chapters.map(c => c.name).join(", ")
    doc.setFontSize(9)
    doc.text(`Chapters: ${chapterNames}`, margin, yPos)
    yPos += 8
  }

  // Divider line
  doc.setDrawColor(150, 150, 150)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // Questions
  if (quiz.questions && quiz.questions.length > 0) {
    doc.setFontSize(10)

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i]

      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage()
        yPos = 15
      }

      // Question number and text
      doc.setFont("helvetica", "bold")
      const questionNum = `Q${i + 1}.`
      doc.text(questionNum, margin, yPos)

      doc.setFont("helvetica", "normal")
      const questionTextX = margin + 10
      const maxWidth = contentWidth - 20

      // Wrap question text
      const questionLines = doc.splitTextToSize(question.questionText || "", maxWidth)
      doc.text(questionLines, questionTextX, yPos)
      yPos += questionLines.length * 5 + 2

      // Marks
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`[${question.marks || 1} mark${(question.marks || 1) > 1 ? "s" : ""}]`, pageWidth - margin - 15, yPos - questionLines.length * 5)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)

      // Options (for MCQ)
      if (question.options && question.options.length > 0) {
        const optionLabels = ["A", "B", "C", "D"]

        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j]

          // Check if we need a new page
          if (yPos > 275) {
            doc.addPage()
            yPos = 15
          }

          doc.setFont("helvetica", "normal")
          const optionText = `(${optionLabels[j] || option.optionLabel}) ${option.optionText || ""}`
          const optionLines = doc.splitTextToSize(optionText, maxWidth - 5)
          doc.text(optionLines, margin + 10, yPos)
          yPos += optionLines.length * 5 + 1
        }
      }

      yPos += 5 // Space between questions
    }
  } else {
    doc.setFontSize(10)
    doc.text("No questions available.", margin, yPos)
  }

  if (includeAnswerKey && quiz.questions && quiz.questions.length > 0) {
    doc.addPage()
    yPos = 15

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Answer Key", pageWidth / 2, yPos, { align: "center" })
    yPos += 10

    doc.setDrawColor(150, 150, 150)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i]
      if (yPos > 275) {
        doc.addPage()
        yPos = 15
      }

      const correctOpt = question.options?.find(o => o.isCorrect)
      const answerText = correctOpt
        ? `(${correctOpt.optionLabel}) ${correctOpt.optionText}`
        : "N/A"

      doc.setFont("helvetica", "bold")
      doc.text(`Q${i + 1}.`, margin, yPos)
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(answerText, contentWidth - 20)
      doc.text(lines, margin + 10, yPos)
      yPos += lines.length * 5 + 3
    }
  }

  // Generate filename
  const subjectName = quiz.subject?.name || "Quiz"
  const grade = quiz.class?.grade || ""
  const filename = `Quiz-${subjectName}-Grade${grade}${includeAnswerKey ? "-AnswerKey" : ""}.pdf`

  // Return blob URL for download
  const pdfBlob = doc.output("blob")
  const pdfUrl = URL.createObjectURL(pdfBlob)

  return { url: pdfUrl, filename }
}

// Download quiz PDF directly
export function downloadQuizPDF(quiz: Quiz, teacherName: string): void {
  const { url, filename } = generateQuizPDF(quiz, teacherName)

  // Create a temporary link and trigger download
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Revoke the object URL after download
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function downloadQuizAnswerKeyPDF(quiz: Quiz, teacherName: string): void {
  const { url, filename } = generateQuizPDF(quiz, teacherName, true)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

// Assessment/Question Paper types
interface AssessmentQuestion {
  number: number
  text: string
  options?: string[]
  type?: string
  marks?: number
  answer?: string
  orText?: string
  orAnswer?: string
}

interface AssessmentSection {
  name?: string
  title?: string
  instructions?: string
  marksInfo?: string
  questions: AssessmentQuestion[]
}

interface AssessmentQuestionPaper {
  title?: string
  instructions?: string[]
  sections?: AssessmentSection[]
  questions?: AssessmentQuestion[]
}

interface Assessment {
  id: string
  title: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string; grade: number; section: string }
  chapters?: Array<{ id: string; name: string }>
  totalMarks?: number
  difficultyLevel?: string
  questionPaper?: AssessmentQuestionPaper | null
}

// Generate Assessment/Question Paper PDF
export function generateAssessmentPDF(assessment: Assessment, teacherName: string, includeAnswerKey = false): { url: string; filename: string } {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  doc.setFont("helvetica")

  let yPos = 15
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2

  // Header - School/Title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("SAVRA - Question Paper", pageWidth / 2, yPos, { align: "center" })
  yPos += 10

  // Subject and Class info
  const subject = assessment.subject?.name || "Subject"
  const grade = assessment.class ? `${assessment.class.grade}-${assessment.class.section}` : ""
  const gradeNumber = assessment.class?.grade
  const chapter = assessment.chapters?.map(c => c.name).join(", ") || ""
  const totalMarks = assessment.totalMarks || 100
  const isMathSubject = ["mathematics", "maths"].includes(subject.trim().toLowerCase())
  const isCbseMathPaper = isMathSubject && (gradeNumber === 11 || gradeNumber === 12)
  const isPhysicsSubject = subject.trim().toLowerCase() === "physics"
  const isCbsePhysicsPaper = isPhysicsSubject && (gradeNumber === 11 || gradeNumber === 12)
  const isStructuredCbsePaper = isCbseMathPaper || isCbsePhysicsPaper
  const timeLabel = isCbsePhysicsPaper
    ? (totalMarks >= 70 ? "3 Hours" : totalMarks >= 40 ? "2 Hours" : "1 Hour")
    : isCbseMathPaper
      ? (totalMarks >= 80 ? "3 Hours" : totalMarks >= 40 ? "2 Hours" : "1 Hour")
      : "1 Hour"

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(`Subject: ${subject}`, margin, yPos)
  doc.text(`Maximum Marks: ${totalMarks}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 6

  doc.setFont("helvetica", "normal")
  doc.text(`Class: ${grade}`, margin, yPos)
  doc.text(`Time: ${timeLabel}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 6

  if (chapter) {
    doc.text(`Chapter: ${chapter}`, margin, yPos)
    yPos += 6
  }

  if (teacherName) {
    doc.text(`Teacher: ${teacherName}`, margin, yPos)
    yPos += 6
  }

  yPos += 4

  // Divider
  doc.setDrawColor(150, 150, 150)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // Instructions
  const questionPaper = assessment.questionPaper
  const instructions = questionPaper?.instructions || [
    "All questions are compulsory.",
    "Show necessary steps for full marks.",
  ]
  const sections = questionPaper?.sections || []
  const questions = questionPaper?.questions || sections.flatMap(s => s.questions) || []

  const ensurePageSpace = (neededHeight = 12) => {
    if (yPos + neededHeight > 280) {
      doc.addPage()
      yPos = 15
    }
  }

  const drawWrappedText = (
    text: string,
    x: number,
    width: number,
    lineHeight: number,
    options?: { align?: "left" | "center" | "right" }
  ) => {
    const lines = doc.splitTextToSize(normalizeScientificTextForPdf(text), width)
    doc.text(lines, x, yPos, options)
    yPos += lines.length * lineHeight
    return lines
  }

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("General Instructions:", margin, yPos)
  yPos += 5

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  for (let i = 0; i < instructions.length; i++) {
    const instText = normalizeScientificTextForPdf(String(instructions[i]))
    const lines = doc.splitTextToSize(`${i + 1}. ${instText}`, contentWidth - 5)
    doc.text(lines, margin + 3, yPos)
    yPos += lines.length * 5 + 1
  }

  yPos += 5

  // Divider
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // Questions
  doc.setFontSize(10)

  if (isStructuredCbsePaper && sections.length > 0) {
    for (const section of sections) {
      ensurePageSpace(18)

      const sectionTitle = section.title || section.name || "Section"
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(sectionTitle, pageWidth / 2, yPos, { align: "center" })
      if (section.marksInfo) {
        doc.setFontSize(10)
        doc.text(section.marksInfo, pageWidth - margin, yPos, { align: "right" })
      }
      yPos += 6

      if (section.instructions) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        drawWrappedText(section.instructions, margin, contentWidth - 20, 4.5)
        yPos += 2
      }

      let arDirectionShown = false
      for (const question of section.questions) {
        const isAssertionReasoning = question.type === "assertion_reasoning"

        if (isAssertionReasoning && !arDirectionShown) {
          ensurePageSpace(30)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          doc.text("Assertion - Reason Based Questions", pageWidth / 2, yPos, { align: "center" })
          yPos += 5

          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          drawWrappedText(
            "Direction : Two statements are given, one labelled Assertion (A) and one labelled Reason (R). Select the correct answer from the options (A), (B), (C) and (D) as given below.",
            margin,
            contentWidth,
            4.2
          )
          ;[
            "(A) Both Assertion (A) and Reason (R) are true and the Reason (R) is the correct explanation of the Assertion (A).",
            "(B) Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of the Assertion (A).",
            "(C) Assertion (A) is true, but Reason (R) is false.",
            "(D) Assertion (A) is false, but Reason (R) is true.",
          ].forEach((line) => {
            drawWrappedText(line, margin + 3, contentWidth - 3, 4.2)
          })
          yPos += 2
          arDirectionShown = true
        }

        ensurePageSpace(18)
        const qNum = `${question.number || 1}.`
        const qTextX = margin + 10

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text(qNum, margin, yPos)
        doc.setFont("helvetica", "normal")
        const marksLabel =
          question.marks != null ? `[${question.marks} mark${question.marks > 1 ? "s" : ""}]` : ""
        const questionBlock = drawScientificText(doc, question.text || "", qTextX, yPos, contentWidth - 22 - (marksLabel ? 18 : 0), {
          lineHeight: 4.5,
          baseFontSize: 10,
          superscriptFontSize: 7.5,
          superscriptRise: 1.6,
        })

        if (question.marks != null) {
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.text(marksLabel, pageWidth - margin, yPos, { align: "right" })
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(10)
        }

        yPos += questionBlock.height + 1

        if (question.options && question.options.length > 0) {
          const optionLabels = ["A", "B", "C", "D", "E", "F"]
          for (let j = 0; j < question.options.length; j++) {
            ensurePageSpace(8)
            const optText = `(${optionLabels[j]}) ${question.options[j] || ""}`
            const optionBlock = drawScientificText(doc, optText, qTextX, yPos, contentWidth - 18, {
              lineHeight: 4,
              baseFontSize: 10,
              superscriptFontSize: 7.5,
              superscriptRise: 1.6,
            })
            yPos += optionBlock.height + 0.8
          }
        }

        if (question.orText) {
          ensurePageSpace(12)
          doc.setFont("helvetica", "bold")
          doc.text("OR", pageWidth / 2, yPos, { align: "center" })
          yPos += 4.5
          doc.setFont("helvetica", "normal")
          const orBlock = drawScientificText(doc, question.orText, qTextX, yPos, contentWidth - 22, {
            lineHeight: 4.5,
            baseFontSize: 10,
            superscriptFontSize: 7.5,
            superscriptRise: 1.6,
          })
          yPos += orBlock.height + 1
        }

        yPos += 4
      }

      yPos += 3
    }
  } else if (sections.length > 0) {
    for (const section of sections) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 15
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text(section.title || section.name || "Section", margin, yPos)
      yPos += 5

      if (section.instructions) {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(9)
        const instText = normalizeScientificTextForPdf(section.instructions)
        const instLines = doc.splitTextToSize(instText, contentWidth)
        doc.text(instLines, margin, yPos)
        yPos += instLines.length * 5 + 3
      }

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      for (const question of section.questions) {
        if (yPos > 270) {
          doc.addPage()
          yPos = 15
        }

        doc.setFont("helvetica", "bold")
        const qNum = `Q${question.number || 1}.`
        doc.text(qNum, margin, yPos)

        doc.setFont("helvetica", "normal")
        const qTextX = margin + 10
        const marksLabel = question.marks ? `[${question.marks} marks]` : ""
        const questionBlock = drawScientificText(doc, question.text || "", qTextX, yPos, contentWidth - 20 - (marksLabel ? 18 : 0), {
          lineHeight: 5,
          baseFontSize: 10,
          superscriptFontSize: 7.5,
          superscriptRise: 1.6,
        })

        if (question.marks) {
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.text(marksLabel, pageWidth - margin, yPos, { align: "right" })
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(10)
        }

        yPos += questionBlock.height + 2

        if (question.options && question.options.length > 0) {
          const optionLabels = ["a", "b", "c", "d", "e", "f"]
          for (let j = 0; j < question.options.length; j++) {
            if (yPos > 275) {
              doc.addPage()
              yPos = 15
            }
            const optText = `${optionLabels[j]}) ${question.options[j] || ""}`
            const optionBlock = drawScientificText(doc, optText, margin + 10, yPos, contentWidth - 15, {
              lineHeight: 4,
              baseFontSize: 10,
              superscriptFontSize: 7.5,
              superscriptRise: 1.6,
            })
            yPos += optionBlock.height + 1
          }
        }

        yPos += 4
      }

      yPos += 5
    }
  } else {
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]

      if (yPos > 270) {
        doc.addPage()
        yPos = 15
      }

      doc.setFont("helvetica", "bold")
      const qNum = `Q${question.number || i + 1}.`
      doc.text(qNum, margin, yPos)

      doc.setFont("helvetica", "normal")
      const qTextX = margin + 10
      const marksLabel = question.marks ? `[${question.marks} marks]` : ""
      const questionBlock = drawScientificText(doc, question.text || "", qTextX, yPos, contentWidth - 20 - (marksLabel ? 18 : 0), {
        lineHeight: 5,
        baseFontSize: 10,
        superscriptFontSize: 7.5,
        superscriptRise: 1.6,
      })

      if (question.marks) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(marksLabel, pageWidth - margin, yPos, { align: "right" })
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
      }

      yPos += questionBlock.height + 2

      if (question.options && question.options.length > 0) {
        const optionLabels = ["a", "b", "c", "d", "e", "f"]
        for (let j = 0; j < question.options.length; j++) {
          if (yPos > 275) {
            doc.addPage()
            yPos = 15
          }
          const optText = `${optionLabels[j]}) ${question.options[j] || ""}`
          const optionBlock = drawScientificText(doc, optText, margin + 10, yPos, contentWidth - 15, {
            lineHeight: 4,
            baseFontSize: 10,
            superscriptFontSize: 7.5,
            superscriptRise: 1.6,
          })
          yPos += optionBlock.height + 1
        }
      }

      yPos += 4
    }
  }

  if (includeAnswerKey) {
    const allQuestions = questionPaper?.sections
      ? questionPaper.sections.flatMap(s => s.questions)
      : questions

    if (allQuestions.length > 0) {
      doc.addPage()
      yPos = 15

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Answer Key", pageWidth / 2, yPos, { align: "center" })
      yPos += 10

      doc.setDrawColor(150, 150, 150)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8

      doc.setFontSize(10)
      for (const question of allQuestions) {
        if (yPos > 270) {
          doc.addPage()
          yPos = 15
        }

        const answerText = normalizeScientificTextForPdf(question.answer || "N/A")
        const orAnswerText = question.orAnswer
          ? normalizeScientificTextForPdf(`OR: ${question.orAnswer}`)
          : ""

        doc.setFont("helvetica", "bold")
        doc.text(`Q${question.number || 1}.`, margin, yPos)
        doc.setFont("helvetica", "normal")
        const answerBlock = orAnswerText ? `${answerText}\n${orAnswerText}` : answerText
        const lines = doc.splitTextToSize(answerBlock, contentWidth - 20)
        doc.text(lines, margin + 10, yPos)
        yPos += lines.length * 5 + 3
      }
    }
  }

  // Generate filename
  const subjectName = assessment.subject?.name || "QuestionPaper"
  const gradeNum = assessment.class?.grade || ""
  const filename = `QuestionPaper-${subjectName}-Grade${gradeNum}${includeAnswerKey ? "-AnswerKey" : ""}.pdf`

  const pdfBlob = doc.output("blob")
  const pdfUrl = URL.createObjectURL(pdfBlob)

  return { url: pdfUrl, filename }
}

// Download assessment PDF directly
export function downloadAssessmentPDF(assessment: Assessment, teacherName: string): void {
  const { url, filename } = generateAssessmentPDF(assessment, teacherName)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function downloadAssessmentAnswerKeyPDF(assessment: Assessment, teacherName: string): void {
  const { url, filename } = generateAssessmentPDF(assessment, teacherName, true)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
