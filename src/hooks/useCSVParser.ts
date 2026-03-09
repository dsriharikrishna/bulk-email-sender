import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Contact, contactSchema } from '../types/contact'

export const useCSVParser = () => {
    const [data, setData] = useState<Contact[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isParsing, setIsParsing] = useState(false)

    const parseFile = useCallback((file: File) => {
        setIsParsing(true)
        setError(null)

        // console.log(`Sending to ${queue[currentIndex].name}`)
        const extension = file.name.split('.').pop()?.toLowerCase()

        if (extension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processParsedData(results.data)
                    setIsParsing(false)
                },
                error: (err) => {
                    setError(`CSV Parsing Error: ${err.message}`)
                    setIsParsing(false)
                },
            })
        } else if (extension === 'xlsx' || extension === 'xls') {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const bstr = e.target?.result
                    const wb = XLSX.read(bstr, { type: 'binary' })
                    const wsname = wb.SheetNames[0]
                    const ws = wb.Sheets[wsname]
                    const jsonData = XLSX.utils.sheet_to_json(ws)
                    processParsedData(jsonData)
                    setIsParsing(false)
                } catch (err: any) {
                    setError(`Excel Parsing Error: ${err.message}`)
                    setIsParsing(false)
                }
            }
            reader.onerror = () => {
                setError('File reading error')
                setIsParsing(false)
            }
            reader.readAsBinaryString(file)
        } else {
            setError('Unsupported file format. Please upload .csv or .xlsx')
            setIsParsing(false)
        }
    }, [])

    const processParsedData = (rawItems: any[]) => {
        const formattedData: Contact[] = rawItems.map((item, index) => {
            // Automatic column mapping logic
            const mappedItem = {
                id: `contact-${index}-${Date.now()}`,
                name: item.Name || item.name || item['Contact Name'] || '',
                email: item.Email || item.email || item['Email Address'] || '',
                company: item.Company || item.company || item.Organization || '',
                title: item.Title || item.title || item.Role || item.Position || '',
                status: 'Pending' as const,
            }

            const validation = contactSchema.safeParse(mappedItem)
            if (!validation.success) {
                return {
                    ...mappedItem,
                    status: 'Failed' as const,
                    error: validation.error.issues[0].message,
                }
            }

            return validation.data as Contact
        })

        setData(formattedData)
    }

    const clearData = () => {
        setData([])
        setError(null)
    }

    return { data, error, isParsing, parseFile, clearData }
}
