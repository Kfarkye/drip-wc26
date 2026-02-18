import { useEffect } from 'react'

interface SchemaScriptProps {
    schema: string
}

export function SchemaScript({ schema }: SchemaScriptProps) {
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.textContent = schema
        script.id = 'drip-schema'
        document.head.appendChild(script)

        return () => {
            const existing = document.getElementById('drip-schema')
            if (existing) existing.remove()
        }
    }, [schema])

    return null
}
