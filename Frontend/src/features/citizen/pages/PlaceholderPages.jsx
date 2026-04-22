// src/features/citizen/pages/PlaceholderPages.jsx
// Temporary placeholder pages for routes not yet fully implemented

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="border-0 shadow-sm max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-3"><div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center"><Construction className="h-6 w-6 text-slate-500" /></div></div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent><p className="text-sm text-slate-500">This page is coming soon. The dashboard is ready!</p></CardContent>
      </Card>
    </div>
  )
}

export function FileFIRPage() { return <ComingSoon title="File FIR" /> }
export function MyFIRsPage() { return <ComingSoon title="My FIRs" /> }
export function FIRDetailPage() { return <ComingSoon title="FIR Details" /> }
export function LawyerRecommendations() { return <ComingSoon title="Lawyer Recommendations" /> }
export function ConsultationsPage() { return <ComingSoon title="Consultations" /> }
export function CitizenProfilePage() { return <ComingSoon title="My Profile" /> }
