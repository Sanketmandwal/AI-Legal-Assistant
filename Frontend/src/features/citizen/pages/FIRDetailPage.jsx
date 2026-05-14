import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFIRDetail, useAddEvidence } from '../api/firApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import TimelineView from '@/components/shared/TimelineView'
import FileUpload from '@/components/shared/FileUpload'
import DocumentPreviewModal, { friendlyDocName } from '@/components/shared/DocumentPreviewModal'
import { useState } from 'react'
import {
  ArrowLeft, MapPin, Calendar, FileText, Shield, Upload,
  Users, Clock, Loader2, Image, File, Video, Eye, CheckCircle,
} from 'lucide-react'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const RESOURCE_ICONS = { image: Image, video: Video, raw: File }

function EvidenceGallery({ timeline }) {
  const [previewDoc, setPreviewDoc] = useState(null)
  const evidenceEvents = (timeline || []).filter((e) => e.type === 'evidence_added' && e.attachments?.length > 0)
  const allFiles = evidenceEvents.flatMap((e) =>
    e.attachments.map((a) => ({ ...a, uploadedBy: e.byUserId?.name || e.byRole, date: e.createdAt }))
  )

  if (!allFiles.length) {
    return <p className="text-sm text-slate-500 text-center py-8">No evidence files uploaded yet.</p>
  }

  const previewDocs = allFiles.map((file, i) => ({
    url: file.signedUrl || file.url,
    publicId: file.publicId,
    filename: file.filename,
    resourceType: file.resourceType,
  }))

  const handlePreview = (index) => setPreviewDoc({ docs: previewDocs, index })

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allFiles.map((file, i) => {
          const ResIcon = RESOURCE_ICONS[file.resourceType] || File
          const isImage = file.resourceType === 'image'
          const url = file.signedUrl || file.url
          const displayName = friendlyDocName(file.publicId, file.filename, i)
          return (
            <div
              key={i}
              className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-teal-300 transition-all cursor-pointer shadow-sm"
              onClick={() => handlePreview(i)}
            >
              {isImage && url ? (
                <div className="relative">
                  <img src={url} alt={displayName} className="w-full h-32 object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="secondary" className="h-8 text-xs">
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center bg-slate-50">
                  <ResIcon className="h-8 w-8 text-slate-300" />
                  <span className="text-[10px] text-slate-400 capitalize mt-1">{file.resourceType}</span>
                </div>
              )}
              <div className="p-2.5">
                <div className="text-xs font-semibold text-slate-800 truncate">{displayName}</div>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <span className="text-[10px] text-slate-400 truncate">by {file.uploadedBy}</span>
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-5 w-5 rounded bg-teal-50 flex items-center justify-center">
                      <Eye className="h-3 w-3 text-teal-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <DocumentPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documents={previewDoc?.docs || []}
        initialIndex={previewDoc?.index || 0}
        title="Evidence Preview"
      />
    </>
  )
}

export default function FIRDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useFIRDetail(id)
  const addEvidenceMutation = useAddEvidence(id)
  const [newEvidence, setNewEvidence] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('timeline')

  const fir = data?.fir || data
  if (isLoading) return <div className="space-y-4 max-w-5xl mx-auto">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  if (!fir) return <div className="text-center py-20 text-slate-500">FIR not found</div>

  const handleAddEvidence = () => {
    if (!newEvidence.length) return
    const fd = new FormData()
    newEvidence.forEach((f) => fd.append('evidenceFiles', f))
    addEvidenceMutation.mutate(fd, { onSuccess: () => { setNewEvidence([]); setShowUpload(false) } })
  }

  const statusSteps = ['submitted', 'accepted', 'investigating', 'resolved', 'closed']
  const currentStepIdx = statusSteps.indexOf(fir.status)
  const evidenceCount = (fir.timeline || [])
    .filter((e) => e.type === 'evidence_added')
    .reduce((sum, e) => sum + (e.attachments?.length || 0), 0)

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="px-5 sm:px-8 pt-5">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-3 -ml-2 text-slate-500 hover:text-slate-900 h-8">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to My FIRs
        </Button>
      </div>

      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />

        <div className="relative z-10 px-5 sm:px-8 pt-6 pb-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {fir.firNumber && <Badge className="bg-white/20 text-white border-0 font-mono text-xs">#{fir.firNumber}</Badge>}
                <Badge className="bg-white/20 text-white border-0 capitalize text-xs">{fir.incident?.category}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white break-words">{fir.incident?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-white/75 text-sm">
                <span className="flex items-center gap-1.5 min-w-0"><Calendar className="h-4 w-4 shrink-0" />{formatDate(fir.createdAt)}</span>
                <span className="flex items-center gap-1.5 min-w-0"><MapPin className="h-4 w-4 shrink-0" />{fir.incident?.address}</span>
              </div>
            </div>
            <StatusBadge status={fir.status} className="text-sm px-4 py-1.5 bg-white/20 border-white/30 text-white" />
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 -mt-8 pb-12 relative z-10 space-y-5">
        {fir.status !== 'rejected' && (
          <Card className="rounded-xl border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5 sm:p-6 overflow-x-auto">
              <div className="flex items-start justify-between gap-2 min-w-[620px] lg:min-w-0">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-initial min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i <= currentStepIdx ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {i < currentStepIdx ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-[10px] mt-1.5 capitalize font-semibold whitespace-nowrap ${i <= currentStepIdx ? 'text-teal-700' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${i < currentStepIdx ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5 min-w-0">
            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  Incident Description
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap break-words">{fir.incident?.description}</p>
              </CardContent>
            </Card>

            <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center gap-1.5 ${activeTab === 'timeline' ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Clock className="h-4 w-4" /> Timeline ({(fir.timeline || []).length})
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center gap-1.5 ${activeTab === 'evidence' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <Image className="h-4 w-4" /> Evidence ({evidenceCount})
              </button>
            </div>

            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="max-h-[520px] overflow-y-auto pr-1">
                  {activeTab === 'timeline'
                    ? <TimelineView events={fir.timeline || []} />
                    : <EvidenceGallery timeline={fir.timeline || []} />}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardHeader className="px-5 py-4 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-rose-50 rounded-md flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-rose-600" />
                  </div>
                  Assigned Station
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="p-3.5 bg-rose-50 rounded-xl">
                  <p className="font-semibold text-sm text-slate-900 break-words">{fir.stationId?.stationName || 'Police Station'}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{fir.stationId?.stationAddress || fir.stationId?.district}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {['accepted', 'investigating'].includes(fir.status) && (
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-5 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Find a Lawyer Near You</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Our AI matches you with verified lawyers within 30 km of your incident location, sorted by specialization, rating, and distance.
                  </p>
                  <Button asChild className="w-full mt-4 h-10 text-sm font-semibold bg-teal-600 hover:bg-teal-700">
                    <Link to={`/citizen/fir/${id}/lawyers`} className="inline-flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" /> Find Nearby Lawyers
                    </Link>
                  </Button>
                  <p className="text-[10px] text-slate-400 mt-2">Based on your FIR incident coordinates</p>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardHeader className="px-5 py-4 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-50 rounded-md flex items-center justify-center">
                    <Upload className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  Upload Evidence
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">Add photos, videos, or documents</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {!showUpload ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 border-dashed border-2 border-slate-300 hover:border-teal-300 hover:bg-teal-50 text-sm"
                    onClick={() => setShowUpload(true)}
                  >
                    <Upload className="mr-1.5 h-4 w-4" /> Upload New Evidence
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <FileUpload files={newEvidence} onChange={setNewEvidence} maxFiles={5} label="Drop evidence files here" />
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => { setShowUpload(false); setNewEvidence([]) }} className="h-8 text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700" onClick={handleAddEvidence} disabled={!newEvidence.length || addEvidenceMutation.isPending}>
                        {addEvidenceMutation.isPending
                          ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                        Submit Evidence
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}