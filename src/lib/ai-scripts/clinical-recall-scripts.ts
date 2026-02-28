/**
 * AI Call Scripts for Clinical Recall Categories
 *
 * These scripts are optimized for:
 * 1. GOC/FODO compliance (duty of care disclosure)
 * 2. Higher conversion rates (clinical urgency)
 * 3. Patient understanding (clear medical language)
 */

export type RiskCategory = 'standard' | 'glaucoma_suspect' | 'diabetic' | 'myopia_child' | 'other_clinical'

interface CallScript {
  opening: string
  callToAction: string
  keypadsOptions: string
  complianceDisclosure: string
}

export const clinicalRecallScripts: Record<RiskCategory, CallScript> = {
  glaucoma_suspect: {
    opening: `Hello, is that {firstName}? This is an automated message on behalf of {practiceName}.

We're calling about your glaucoma monitoring appointment. Our records show it's been 12 months since your last pressure check and visual field assessment.

As you have a family history of glaucoma or elevated eye pressure, regular monitoring is important to protect your vision. The College of Optometrists recommends annual checks for patients in your risk category.`,

    callToAction: `We'd like to book you in for your glaucoma monitoring appointment, which includes pressure measurement, visual field testing, and OCT scanning if needed.`,

    keypadsOptions: `
Please choose from the following options:
- Press 1 to book your glaucoma monitoring appointment now
- Press 2 to receive a text message with our booking link
- Press 3 if you'd like us to call back at a better time
- Press 9 to speak directly to our team
- Press 0 to opt out of future recall calls`,

    complianceDisclosure: `This call is for your clinical recall and may be recorded for quality and compliance purposes. This is an automated service, but you can press 9 at any time to speak to a team member.`
  },

  diabetic: {
    opening: `Hello, is that {firstName}? This is an automated message on behalf of {practiceName}.

We're calling about your diabetic eye health check. Our records show it's been 12 months since your last diabetic eye examination.

Regular eye examinations are especially important for people with diabetes, as diabetic retinopathy can develop without symptoms. Early detection and monitoring help protect your vision.`,

    callToAction: `We'd like to book you in for your diabetic eye screening, which includes retinal imaging, pressure checks, and a full health assessment of your eyes.`,

    keypadsOptions: `
Please choose from the following options:
- Press 1 to book your diabetic eye screening now
- Press 2 to receive a text message with our booking link
- Press 3 if you'd like us to call back later
- Press 9 to speak to our team about your appointment
- Press 0 to opt out of future recall calls`,

    complianceDisclosure: `This call is for your clinical recall and may be recorded for quality and compliance purposes. This is an automated service, but you can press 9 at any time to speak to a team member.`
  },

  myopia_child: {
    opening: `Hello, is this the parent or guardian of {firstName}? This is an automated message on behalf of {practiceName}.

We're calling about {firstName}'s myopia progression monitoring appointment. Our records show it's been 6 months since their last check.

Regular monitoring is important for children with myopia to track progression and discuss management options that may help slow down their prescription changes.`,

    callToAction: `We'd like to book {firstName} in for their myopia progression check, which includes a full eye examination and discussion of any management options if needed.`,

    keypadsOptions: `
Please choose from the following options:
- Press 1 to book the myopia monitoring appointment
- Press 2 to receive a text message with our booking link
- Press 3 if you'd like us to call back at a better time
- Press 9 to speak to our team
- Press 0 to opt out of future recall calls`,

    complianceDisclosure: `This call is for your child's clinical recall and may be recorded for quality and compliance purposes. This is an automated service, but you can press 9 at any time to speak to a team member.`
  },

  other_clinical: {
    opening: `Hello, is that {firstName}? This is an automated message on behalf of {practiceName}.

We're calling about your clinical eye health review. Our records show you're due for a follow-up examination based on our previous findings.

Regular monitoring is important to track any changes and ensure your eye health is being properly managed.`,

    callToAction: `We'd like to book you in for your clinical eye health review.`,

    keypadsOptions: `
Please choose from the following options:
- Press 1 to book your appointment now
- Press 2 to receive a text message with our booking link
- Press 3 if you'd like us to call back later
- Press 9 to speak to our team
- Press 0 to opt out of future recall calls`,

    complianceDisclosure: `This call is for your clinical recall and may be recorded for quality and compliance purposes. This is an automated service, but you can press 9 at any time to speak to a team member.`
  },

  standard: {
    opening: `Hello, is that {firstName}? This is an automated message on behalf of {practiceName}.

We're calling to let you know it's time for your routine eye examination. Regular eye tests are important to check your vision and the health of your eyes.`,

    callToAction: `We'd like to book you in for your eye examination at a time that suits you.`,

    keypadsOptions: `
Please choose from the following options:
- Press 1 to book your eye test now
- Press 2 to receive a text message with our booking link
- Press 3 if you'd like us to call back later
- Press 9 to speak to our team
- Press 0 to opt out of future recall calls`,

    complianceDisclosure: `This call may be recorded for quality purposes. This is an automated service, but you can press 9 at any time to speak to a team member.`
  }
}

/**
 * Generate the full AI script for Bland AI
 *
 * @param riskCategory - The patient's risk category
 * @param practiceName - Name of the optician practice
 * @param firstName - Patient's first name
 * @returns Complete script ready for Bland AI
 */
export function generateBlandAIScript(
  riskCategory: RiskCategory,
  practiceName: string,
  firstName: string
): string {
  const script = clinicalRecallScripts[riskCategory]

  // Replace placeholders
  const fullScript = `
${script.complianceDisclosure}

${script.opening}

${script.callToAction}

${script.keypadsOptions}

Thank you for your time. We look forward to seeing you soon.
  `.replace(/{practiceName}/g, practiceName)
    .replace(/{firstName}/g, firstName)
    .trim()

  return fullScript
}

/**
 * Get the recall reason text for compliance logging
 */
export function getRecallReason(riskCategory: RiskCategory): string {
  const reasons: Record<RiskCategory, string> = {
    glaucoma_suspect: 'Glaucoma annual monitoring review (COO guidelines - family history/OHT)',
    diabetic: 'Diabetic eye screening annual review (COO guidelines - diabetic patients)',
    myopia_child: 'Myopia progression monitoring (6-month review)',
    other_clinical: 'Clinical eye health review (practitioner-determined interval)',
    standard: 'Routine eye examination recall'
  }

  return reasons[riskCategory]
}

/**
 * Get recommended appointment value by risk category
 * Used for ROI calculations
 */
export function getRecommendedAppointmentValue(riskCategory: RiskCategory): number {
  const values: Record<RiskCategory, number> = {
    glaucoma_suspect: 95, // £95 (visual fields + OCT + pressure check)
    diabetic: 85, // £85 (retinal imaging + OCT + extended consultation)
    myopia_child: 65, // £65 (full exam + myopia management discussion)
    other_clinical: 75, // £75 (clinical exam with additional tests)
    standard: 20 // £20 (basic NHS sight test profit)
  }

  return values[riskCategory]
}
