// src/components/shared/AILegalResearch.jsx
// Shared page available to both Citizens and Lawyers
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { aiApi } from '@/api/aiApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader, PageStack } from '@/components/common/PageShell'
import {
  Search, Loader2, BookOpen, Scale, FileText, AlertCircle,
  ChevronDown, ChevronUp, Sparkles, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const ACT_FILTERS = [
  { value: '', label: 'All Acts' },
  { value: 'BNS', label: 'Bharatiya Nyaya Sanhita (BNS)' },
  { value: 'BNSS', label: 'Bharatiya Nagarik Suraksha Sanhita (BNSS)' },
  { value: 'BSA', label: 'Bharatiya Sakshya Adhiniyam (BSA)' },
  { value: 'Constitution', label: 'Constitution of India' },
  { value: 'Contract', label: 'Indian Contract Act' },
]

export default function AILegalResearch() {
  const { user } = useSelector((s) => s.auth)
  const [query, setQuery] = useState('')
  const [filterAct, setFilterAct] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSources, setShowSources] = useState(false)

  const role = user?.role === 'lawyer' ? 'researcher' : 'advisor'

  const handleSearch = async () => {
    if (query.trim().length < 5) {
      toast.error('Query must be at least 5 characters.')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await aiApi.query(query, role, null)
      setResult(response)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to connect to AI engine.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <PageStack>
      <PageHeader
        eyebrow="AI Research"
        title="Legal Research"
        description="Search Indian law — BNS, BNSS, BSA, Constitution, and Contract Act. Get structured analysis with exact sections and provisions."
      />

      {/* Search Card */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Legal Query</Label>
            <Textarea
              placeholder="e.g. What are the legal provisions for cyberbullying in India? What sections apply for online harassment?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block"><Filter className="inline h-3 w-3 mr-1" />Filter by Act (Optional)</Label>
              <select
                value={filterAct}
                onChange={(e) => setFilterAct(e.target.value)}
                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {ACT_FILTERS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 self-end h-10 px-6">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Research
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-teal-200 bg-teal-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-teal-600" /> AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {result.summary || 'No summary available.'}
              </p>
            </CardContent>
          </Card>

          {/* Legal Provisions */}
          {result.legal_provisions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-4 w-4 text-blue-600" /> Legal Provisions ({result.legal_provisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.legal_provisions.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.act && <Badge className="bg-blue-100 text-blue-800 border-0">{p.act}</Badge>}
                      {p.section && <Badge variant="outline">{p.section}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.description || p.title || p.text || JSON.stringify(p)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Detailed Explanation */}
          {result.explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-purple-600" /> Detailed Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          {result.recommended_actions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-amber-600" /> Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommended_actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-teal-500 font-bold mt-0.5">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Retrieved Sources */}
          {result.retrieved_sources?.length > 0 && (
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowSources(!showSources)}>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-500" /> Retrieved Sources ({result.retrieved_sources.length})
                  </span>
                  {showSources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {showSources && (
                <CardContent className="pt-0">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {result.retrieved_sources.map((s, i) => (
                      <div key={i} className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-[10px]">{s.act}</Badge>
                          <span className="text-muted-foreground">Score: {s.score}</span>
                        </div>
                        {s.section && <div className="font-medium">{s.section}</div>}
                        {s.title && <div className="text-muted-foreground">{s.title}</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Confidence & Disclaimer */}
          <div className="flex flex-col sm:flex-row gap-4">
            {result.confidence && (
              <Card className="flex-1">
                <CardContent className="p-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confidence</div>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${
                      (result.confidence.score || 0) > 0.7 ? 'text-emerald-600' :
                      (result.confidence.score || 0) > 0.4 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {((result.confidence.score || 0) * 100).toFixed(0)}%
                    </div>
                    {result.confidence.level && (
                      <Badge variant="outline" className="capitalize">{result.confidence.level}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {result.disclaimer && (
              <Card className="flex-1 border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">{result.disclaimer}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageStack>
  )
}
