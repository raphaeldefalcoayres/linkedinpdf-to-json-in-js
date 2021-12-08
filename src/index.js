const { monthsToYears } = require('date-fns')
const fs = require('fs')
const path = require('path')
const pathToPdf = path.join('Profile.pdf')
const pdf = require('pdf-parse')

const stringContainsNumber = string => {
  let matchPattern = string.match(/\d+/g)
  return matchPattern != null ? true : false
}

const convertStringToNumber = string => {
  return parseInt(string.replace(/\D/g, ""))
}

const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

const linkedinPdfToJson = async () => {
  const buffer = fs.readFileSync(pathToPdf)

  const { text: pdfText } = await pdf(buffer)

  const pdfTextToArray = pdfText.split("\n")

  const pdfTextToArraySanitize = pdfTextToArray.map(item => {
    if(!item.includes('Page')) return item.trim()
  }).filter(item => item !== undefined && item !== "")

  const resumePosition = pdfTextToArraySanitize.indexOf('Resumo') + 1
  const experiencePosition = pdfTextToArraySanitize.indexOf('Experiência') + 1
  const academicPosition = pdfTextToArraySanitize.indexOf('Formação acadêmica') + 1

  const resume = pdfTextToArraySanitize.slice(resumePosition, experiencePosition)
  const experience = pdfTextToArraySanitize.slice(experiencePosition, academicPosition)
  const academic = pdfTextToArraySanitize.slice(academicPosition, pdfTextToArray.length)
  const arrayYearsOfExperience = experience.filter(item => stringContainsNumber(item) && months.includes(item.split(" ")[0]))
  const monthsOfExperience = arrayYearsOfExperience.reduce((result, part) => {
    const stringTime = part.split("(")[1].replace(")", "")

    const isYears = (stringTime.endsWith("ano") || stringTime.endsWith("anos")) && (!stringTime.includes("mês") && !stringTime.includes("meses"))
    const isMonths = (stringTime.endsWith("mês") || stringTime.endsWith("meses")) && (!stringTime.includes("ano") && !stringTime.includes("anos"))
    const isYearsAndMonths = !isYears && !isMonths

    if(isMonths) {
      return result + convertStringToNumber(stringTime)
    } else if(isYears) {
      const yearsToMonths = parseInt(convertStringToNumber(stringTime)) * 12
      return result + yearsToMonths
    } else if (isYearsAndMonths) {
      const parts = stringTime.split(" ")
      return result + parseInt(parts[0]) * 12 + parseInt(parts[2])
    }
  }, 0)

  const yearsOfExperience = monthsToYears(monthsOfExperience)
  const supposedWorkingDaysPerYear = 240
  const supposedAverageHoursWorkedPerDay = 8
  const supposedHoursOfExperience = yearsOfExperience * supposedWorkingDaysPerYear * supposedAverageHoursWorkedPerDay

  console.log({
    resume, experience, academic, yearsOfExperience, supposedHoursOfExperience
  })

  return {
    resume, experience, academic, yearsOfExperience, supposedHoursOfExperience
  }
}


linkedinPdfToJson()