import { useState } from 'react'
import { aiApi } from '@/api/aiApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, PageStack } from '@/components/common/PageShell'
import {
  Sparkles, Loader2, Scale, FileText, Clock, ShieldAlert,
  BookOpen, AlertCircle, Plus, X, BarChart3, Wand2
} from 'lucide-react'
import toast from 'react-hot-toast'

const CASE_TYPES = [
  { value: 'criminal', label: 'Criminal' },
  { value: 'civil', label: 'Civil' },
  { value: 'contract', label: 'Contract' },
  { value: 'family', label: 'Family' },
  { value: 'property', label: 'Property' },
  { value: 'consumer', label: 'Consumer' },
]

export default function CaseAnalyzer() {
  const [scenario, setScenario] = useState('')
  const [caseType, setCaseType] = useState('')
  const [evidenceItems, setEvidenceItems] = useState([''])
  const [analysisResult, setAnalysisResult] = useState(null)
  const [timelineResult, setTimelineResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')

  const addEvidence = () => setEvidenceItems((prev) => [...prev, ''])
  const removeEvidence = (i) => setEvidenceItems((prev) => prev.filter((_, idx) => idx !== i))
  const updateEvidence = (i, val) => setEvidenceItems((prev) => prev.map((v, idx) => idx === i ? val : v))

  const handleAnalyze = async () => {
    if (scenario.trim().length < 20) {
      toast.error('Please provide at least 20 characters of case detail.')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setTimelineResult(null)

    try {
      const evidence = evidenceItems.filter((e) => e.trim())
      const [analysis, timeline] = await Promise.all([
        aiApi.analyze(scenario, evidence, 'researcher'),
        aiApi.generateTimeline(scenario, caseType || null)
      ])

      setAnalysisResult(analysis)
      setTimelineResult(timeline)
      toast.success('Case analysis complete!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Analysis failed. Is the AI server running?')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <PageStack>
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_34%)]" />
        <div className="relative p-6 sm:p-8">
          <PageHeader
            eyebrow="AI Tool"
            title="Case Analyzer"
            description="Enter case facts and available evidence. The AI will surface likely legal provisions, reasoning, recommended actions, and a procedural timeline."
          />
        </div>
      </div>

      <Card className="rounded-[30px] border-slate-200 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Sparkles className="h-4 w-4 text-teal-600" /> Case Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700">Case Scenario / Facts</Label>
            <Textarea
              placeholder="Describe the case in detail — the parties involved, the facts, the dispute, and what happened chronologically..."
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              rows={6}
              className="resize-none rounded-2xl border-slate-200 bg-slate-50/60 focus-visible:ring-teal-500/20 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700">Case Type (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {CASE_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setCaseType(caseType === ct.value ? '' : ct.value)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    caseType === ct.value
                      ? 'border-teal-600 bg-teal-600 text-white shadow-[0_8px_18px_rgba(13,148,136,0.24)]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-slate-700">Available Evidence</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addEvidence} className="h-8 rounded-xl px-3 text-xs text-teal-700 hover:bg-teal-50 hover:text-teal-700">
                <Plus className="mr-1 h-3 w-3" /> Add Evidence
              </Button>
            </div>
            <div className="space-y-2">
              {evidenceItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="e.g. CCTV footage from nearby shop"
                    value={item}
                    onChange={(e) => updateEvidence(i, e.target.value)}
                    className="flex-1 h-11 rounded-xl border-slate-200 bg-slate-50/60"
                  />
                  {evidenceItems.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEvidence(i)} className="h-11 w-11 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Run AI case analysis</div>
              <div className="text-xs text-slate-500 mt-1">Best results come from detailed facts, chronology, and evidence context.</div>
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="rounded-2xl bg-teal-600 hover:bg-teal-700 min-w-[170px]">
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
              Analyze Case
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-[28px]" />
          <Skeleton className="h-36 rounded-[28px]" />
        </div>
      )}

      {(analysisResult || timelineResult) && !isAnalyzing && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white border border-slate-200 p-1 h-auto">
            <TabsTrigger value="analysis" className="flex items-center gap-1.5 rounded-xl py-2.5 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Scale className="h-3.5 w-3.5" /> Case Analysis
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1.5 rounded-xl py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Clock className="h-3.5 w-3.5" /> Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-5 mt-5">
            {analysisResult && (
              <>
                {analysisResult.summary && (
                  <Card className="rounded-[28px] border-teal-200 bg-teal-50/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base text-slate-900"><Wand2 className="h-4 w-4 text-teal-600" /> Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 whitespace-pre-wrap text-slate-700">{analysisResult.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {analysisResult.legal_provisions?.length > 0 && (
                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base text-slate-900"><BookOpen className="h-4 w-4 text-blue-600" /> Applicable Provisions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.legal_provisions.map((p, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.act && <Badge className="bg-blue-100 text-blue-800 border-0 rounded-full">{p.act}</Badge>}
                            {p.section && <Badge variant="outline" className="rounded-full border-slate-200">{p.section}</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 leading-7">{p.description || p.title || p.text || JSON.stringify(p)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {analysisResult.explanation && (
                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-slate-900"><FileText className="h-4 w-4 text-violet-600" /> Detailed Analysis</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">{analysisResult.explanation}</p>
                    </CardContent>
                  </Card>
                )}

                {analysisResult.recommended_actions?.length > 0 && (
                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-slate-900"><ShieldAlert className="h-4 w-4 text-amber-600" /> Recommended Actions</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.recommended_actions.map((a, i) => (
                          <li key={i} className="flex items-start gap-3 rounded-2xl bg-amber-50/50 p-3 text-sm text-slate-700 leading-7">
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">→</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-5 mt-5">
            {timelineResult && (
              <>
                {timelineResult.summary && (
                  <Card className="rounded-[28px] border-indigo-200 bg-indigo-50/60 shadow-sm">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base text-slate-900"><Clock className="h-4 w-4 text-indigo-600" /> Timeline Summary</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 whitespace-pre-wrap text-slate-700">{timelineResult.summary}</p>
                    </CardContent>
                  </Card>
                )}

                {timelineResult.explanation && (
                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                    <CardHeader><CardTitle className="text-base text-slate-900">Procedural Timeline</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">{timelineResult.explanation}</p>
                    </CardContent>
                  </Card>
                )}

                {timelineResult.legal_provisions?.length > 0 && (
                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                    <CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><Scale className="h-4 w-4 text-blue-600" /> Relevant Provisions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {timelineResult.legal_provisions.map((p, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.act && <Badge className="bg-blue-100 text-blue-800 border-0 rounded-full">{p.act}</Badge>}
                            {p.section && <Badge variant="outline" className="rounded-full border-slate-200">{p.section}</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 leading-7">{p.description || p.title || p.text || JSON.stringify(p)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {(analysisResult?.disclaimer || timelineResult?.disclaimer) && (
        <Card className="rounded-[24px] border-amber-200 bg-amber-50/60">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-6">{analysisResult?.disclaimer || timelineResult?.disclaimer}</p>
          </CardContent>
        </Card>
      )}
    </PageStack>
  )
}