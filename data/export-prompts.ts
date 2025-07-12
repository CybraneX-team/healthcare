import { flattenAndFilter } from '@/app/api/generate-summary/route'

export function getPromptClinicalAndSalesScript(
  type: string,
  data: any,
): string {
  const flattened = flattenAndFilter(data)
  return `

          You are a medical assistant. Based on the following medical data, generate a concise ${
          type === 'summary'
            ? 'clinical summary with key findings and recommended action items'
            : 'personalized sales script for a sales rep to speak with the patient about their report'
        }.
        Data:
        ${JSON.stringify(flattened, null, 2)}

  Your response should be plain text, easy to read, and tailored to the user's context.
        `
}
