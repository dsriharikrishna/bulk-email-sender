import { z } from 'zod'

export const contactSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().min(1, 'Company is required'),
    title: z.string().optional(),
    status: z.enum(['Pending', 'Sending', 'Sent', 'Failed']),
    sentTime: z.string().optional(),
    error: z.string().optional(),
})

export type Contact = z.infer<typeof contactSchema>

export type EmailTemplate = {
    subject: string
    body: string
    sendingMethod: 'gmail' | 'mailto'
    resumeUrl?: string
    portfolioUrl?: string
}
