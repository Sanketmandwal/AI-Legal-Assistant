// src/features/citizen/pages/FIRDetailPage.jsx
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFIRDetail, useAddEvidence } from '../api/firApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import TimelineView from '@/components/shared/TimelineView'
import FileUpload from '@/components/shared/FileUpload'
import { useState } from 'react'
import { ArrowLeft, MapPin, Calendar, FileText, Shield, Upload, Users, Clock, Loader2, Image, ExternalLink, File, Video, Eye } from 'lucide-react'

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

const RESOURCE_ICONS = { image: Image, video: Video, raw: File }

function EvidenceGallery({ timeline }) {
  const evidenceEvents = (timeline || []).filter(e => e.type === 'evidence_added' && e.attachments?.length > 0)
  const allFiles = evidenceEvents.flatMap(e => e.attachments.map(a => ({ ...a, uploadedBy: e.byUserId?.name || e.byRole, date: e.createdAt })))

  if (!allFiles.length) return <p className="text-sm text-slate-500 text-center py-4">No evidence files uploaded yet.</p>

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {allFiles.map((file, i) => {
        const ResIcon = RESOURCE_ICONS[file.resourceType] || File
        const isImage = file.resourceType === 'image'
        const url = file.signedUrl || file.url
        return (
          <div key={i} className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-primary/30 transition-all">
            {isImage && url ? (
              <div className="relative"><img src={url} alt={file.filename} className="w-full h-32 object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <a href={url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="secondary" ><Eye className="mr-1.5 h-3.5 w-3.5" /> View Full</Button></a>
                </div>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center bg-slate-50">
                <ResIcon className="h-8 w-8 text-slate-300" />
                <span className="text-[10px] text-slate-400 capitalize mt-1">{file.resourceType}</span>
              </div>
            )}
            <div className="p-2.5">
              <div className="text-xs font-medium text-slate-800 truncate">{file.filename}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">by {file.uploadedBy}</span>
                {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink className="h-3.5 w-3.5" /></a>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
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
  if (isLoading) return <div className="space-y-4 max-w-4xl mx-auto">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
  if (!fir) return <div className="text-center py-20 text-slate-500">FIR not found</div>

  const handleAddEvidence = () => {
    if (!newEvidence.length) return
    const fd = new FormData()
    newEvidence.forEach(f => fd.append('evidenceFiles', f))
    addEvidenceMutation.mutate(fd, { onSuccess: () => { setNewEvidence([]); setShowUpload(false) } })
  }

  const statusSteps = ['submitted', 'accepted', 'investigating', 'resolved', 'closed']
  const currentStepIdx = statusSteps.indexOf(fir.status)
  const evidenceCount = (fir.timeline || []).filter(e => e.type === 'evidence_added').reduce((sum, e) => sum + (e.attachments?.length || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-slate-500 hover:text-slate-900">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to My FIRs
      </Button>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {fir.firNumber && <Badge className="bg-white/20 text-white border-0 font-mono text-xs">#{fir.firNumber}</Badge>}
                <Badge className="bg-white/20 text-white border-0 capitalize text-xs">{fir.incident?.category}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{fir.incident?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-blue-100 text-sm">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(fir.createdAt)}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{fir.incident?.address}</span>
              </div>
            </div>
            <StatusBadge status={fir.status} className="text-sm px-4 py-1.5 bg-white/20 border-white/30 text-white" />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {fir.status !== 'rejected' && (
        <Card className=" overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i <= currentStepIdx ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                    <span className={`text-[10px] mt-1.5 capitalize font-semibold ${i <= currentStepIdx ? 'text-blue-700' : 'text-slate-400'}`}>{step}</span>
                  </div>
                  {i < statusSteps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${i < currentStepIdx ? 'bg-primary' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Incident Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{fir.incident?.description}</p></CardContent>
          </Card>

          {/* Tab Switcher: Timeline / Evidence */}
          <div className="flex gap-2 bg-slate-100/70 rounded-xl p-1">
            <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'timeline' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>
              <Clock className="h-4 w-4 inline mr-1.5 -mt-0.5" />Timeline ({(fir.timeline || []).length})
            </button>
            <button onClick={() => setActiveTab('evidence')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'evidence' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
              <Image className="h-4 w-4 inline mr-1.5 -mt-0.5" />Evidence ({evidenceCount})
            </button>
          </div>

          <Card className="">
            <CardContent className="p-5">
              <div className="max-h-[500px] overflow-y-auto pr-2">
                {activeTab === 'timeline' ? (
                  <TimelineView events={fir.timeline || []} />
                ) : (
                  <EvidenceGallery timeline={fir.timeline || []} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Station Info */}
          <Card className="">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-rose-600" /> Assigned Station</CardTitle></CardHeader>
            <CardContent>
              <div className="p-3 bg-rose-50 rounded-xl">
                <p className="font-semibold text-sm text-slate-900">{fir.stationId?.stationName || 'Police Station'}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{fir.stationId?.stationAddress || fir.stationId?.district}</p>
              </div>
            </CardContent>
          </Card>

          {/* Lawyer Recommendation CTA — Location-based matching */}
          {['accepted', 'investigating'].includes(fir.status) && (
            <Card className=" bg-card">
              <CardContent className="p-5 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 ">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Find a Lawyer Near You</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Our AI matches you with verified lawyers <strong>within 30 km</strong> of your incident location, sorted by specialization, rating & distance.
                </p>
                <Button asChild className="w-full mt-4  h-11 text-sm font-semibold">
                  <Link to={`/citizen/fir/${id}/lawyers`}><MapPin className="mr-2 h-4 w-4" /> Find Nearby Lawyers</Link>
                </Button>
                <p className="text-[10px] text-slate-400 mt-2">Based on your FIR's incident location coordinates</p>
              </CardContent>
            </Card>
          )}

          {/* Add Evidence */}
          <Card className="">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Upload className="h-4 w-4 text-amber-600" /> Upload Evidence</CardTitle><CardDescription className="text-xs">Add photos, videos or documents</CardDescription></CardHeader>
            <CardContent>
              {!showUpload ? (
                <Button variant="outline" size="sm" className="w-full h-10 border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50" onClick={() => setShowUpload(true)}>
                  <Upload className="mr-1.5 h-4 w-4" /> Upload New Evidence
                </Button>
              ) : (
                <div className="space-y-3">
                  <FileUpload files={newEvidence} onChange={setNewEvidence} maxFiles={5} label="Drop evidence files here" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowUpload(false); setNewEvidence([]) }}>Cancel</Button>
                    <Button size="sm" className="" onClick={handleAddEvidence} disabled={!newEvidence.length || addEvidenceMutation.isPending}>
                      {addEvidenceMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />} Submit Evidence
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
