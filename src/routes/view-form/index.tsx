import viewForm from '@/components/viewForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view-form/')({
    component: viewForm,
})

