import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMyChatRooms, useChatMessages, useSendMessage, useMarkRead, useChatRoomDetails } from '../api/chatApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import DocumentPreviewModal, { friendlyDocName } from '@/components/shared/DocumentPreviewModal'
import {
  MessageSquare, Send, ArrowLeft, Paperclip,
  Loader2, FileText, Eye, Search,
  Phone, MoreVertical, CheckCheck, User,
} from 'lucide-react'

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function getInitials(name) {
  return name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?'
}

function RoomsList({ rooms, activeRoomId, role }) {
  const basePath = role === 'lawyer' ? '/lawyer/chat' : '/citizen/chat'

  return (
    <div className="space-y-1.5 p-2">
      {rooms.map((room) => {
        const otherUser = room.otherParticipant
        const isActive = room._id === activeRoomId
        return (
          <Link key={room._id} to={`${basePath}/${room._id}`} className="block">
            <div className={`rounded-2xl px-3 py-3 transition-all duration-150 border ${
              isActive ? 'border-teal-200 bg-teal-50 shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-white'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isActive ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {getInitials(otherUser?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="font-semibold text-sm text-slate-900 truncate">{otherUser?.name || 'User'}</div>
                    <div className="text-[10px] text-slate-400 shrink-0">{room.lastMessageAt ? formatTime(room.lastMessageAt) : ''}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500 truncate flex-1">{room.latestMessage?.text || room.fir?.incident?.title || 'Case discussion'}</div>
                    {room.unreadCount > 0 && <div className="flex h-5 min-w-[20px] px-1 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-semibold text-white">{room.unreadCount}</div>}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function AttachmentPreview({ attachment, isMe, onClick, index, allAttachments }) {
  const displayName = friendlyDocName(null, attachment.filename, index) || 'Attachment'
  const url = attachment.signedUrl || '#'
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) || url.includes('/image/')

  if (isImage) {
    return (
      <button onClick={() => onClick(allAttachments, index)} className="mt-2 block text-left w-full">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white/10">
          <img src={url} alt={displayName} className="max-h-56 w-full rounded-2xl object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick(allAttachments, index)}
      className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs border transition-colors ${
        isMe ? 'border-white/20 bg-white/10 text-white hover:bg-white/15' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Paperclip className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{displayName}</span>
      <Eye className="h-3.5 w-3.5 shrink-0 opacity-70" />
    </button>
  )
}

function MessageBubble({ msg, isMe, onAttachmentClick }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[88%] sm:max-w-[72%] ${isMe ? 'order-2' : ''}`}>
        {!isMe && <div className="text-[11px] font-semibold text-teal-700 mb-1.5 px-1">{msg.senderId?.name}</div>}
        <div className={`rounded-3xl px-4 py-3 shadow-sm ${isMe ? 'rounded-br-lg bg-[#0f766e] text-white' : 'rounded-bl-lg bg-white border border-slate-200 text-slate-700'}`}>
          {msg.text && <p className="text-sm leading-7 whitespace-pre-wrap break-words">{msg.text}</p>}
          {msg.attachments?.length > 0 && (
            <div className="space-y-2">
              {msg.attachments.map((a, i) => (
                <AttachmentPreview key={i} attachment={a} index={i} allAttachments={msg.attachments} isMe={isMe} onClick={onAttachmentClick} />
              ))}
            </div>
          )}
          <div className={`mt-2 flex items-center gap-1 text-[10px] ${isMe ? 'justify-end text-white/75' : 'justify-end text-slate-400'}`}>
            <span>{formatTime(msg.createdAt)}</span>
            {isMe && <CheckCheck className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { roomId } = useParams()
  const { user } = useSelector((s) => s.auth)
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [previewDoc, setPreviewDoc] = useState(null)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const { data: roomsData, isLoading: roomsLoading } = useMyChatRooms()
  const { data: messagesData, isLoading: msgsLoading } = useChatMessages(roomId)
  const { data: roomDetail } = useChatRoomDetails(roomId)
  const sendMutation = useSendMessage(roomId)
  const markRead = useMarkRead(roomId)

  const rooms = roomsData?.rooms || []
  const messages = messagesData?.messages || []
  const room = roomDetail?.room

  useEffect(() => { if (roomId) markRead.mutate() }, [roomId])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const filteredRooms = rooms.filter((room) => {
    const name = room.otherParticipant?.name || ''
    const title = room.fir?.incident?.title || ''
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || title.toLowerCase().includes(q)
  })

  const handleSend = () => {
    if (!text.trim() && !files.length) return
    const fd = new FormData()
    if (text.trim()) fd.append('text', text.trim())
    files.forEach((f) => fd.append('attachments', f))
    sendMutation.mutate(fd, { onSuccess: () => { setText(''); setFiles([]) } })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachmentClick = (attachments, index) => {
    const docs = attachments.map((a) => ({
      url: a.signedUrl || '#',
      filename: a.filename,
      resourceType: a.signedUrl?.includes('/image/') || a.signedUrl?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? 'image' : a.signedUrl?.includes('/video/') ? 'video' : 'raw',
    }))
    setPreviewDoc({ docs, index })
  }

  const otherName = room ? (user?.role === 'citizen' ? room.lawyerUserId?.name : room.citizenId?.name) : ''

  return (
    <>
      <div className="w-full min-h-screen bg-[#f5f7fb] p-0 sm:p-4">
        <div className="mx-auto flex h-[100dvh] sm:h-[calc(100vh-2rem)] max-w-7xl overflow-hidden bg-white sm:rounded-[28px] shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-slate-200">
          <div className={`w-full lg:w-[360px] border-r border-slate-200 flex-col bg-[#fcfcfd] ${roomId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="border-b border-slate-200 p-4 space-y-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100"><MessageSquare className="h-5 w-5 text-teal-600" /></div>
                <div><h2 className="font-bold text-slate-900 text-base">Chats</h2><p className="text-xs text-slate-400">Conversations with lawyers and citizens</p></div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats..." className="pl-10 h-10 border-slate-200 focus:border-teal-400 focus:ring-teal-100" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {roomsLoading ? <div className="space-y-3 p-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div> : filteredRooms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6"><div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3"><MessageSquare className="h-6 w-6 text-slate-300" /></div><p className="text-sm font-semibold text-slate-600">No chats found</p><p className="text-xs text-slate-400 mt-1">Chat rooms appear when consultations are accepted.</p></div>
              ) : <RoomsList rooms={filteredRooms} activeRoomId={roomId} role={user?.role} />}
            </div>
          </div>

          <div className={`flex-1 flex-col min-w-0 ${!roomId ? 'hidden lg:flex' : 'flex'}`}>
            {!roomId ? (
              <div className="flex-1 flex items-center justify-center bg-[#f8fafc]"><div className="text-center px-6"><div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4"><MessageSquare className="h-7 w-7 text-teal-600" /></div><p className="text-lg font-bold text-slate-900">Select a conversation</p><p className="text-sm text-slate-400 mt-1">Choose a chat from the sidebar to start messaging.</p></div></div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
                  <Button variant="ghost" size="sm" className="lg:hidden h-9 w-9 p-0" asChild><Link to={`/${user?.role}/chat`}><ArrowLeft className="h-4 w-4" /></Link></Button>
                  {room && <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shrink-0">{getInitials(otherName)}</div>
                    <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900 truncate">{otherName}</div><div className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5"><FileText className="h-3 w-3 shrink-0" /><span className="truncate">{room.firId?.incident?.title}</span></div></div>
                    <div className="hidden sm:flex items-center gap-2"><Badge className={`${room.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'} capitalize`}>{room.status}</Badge><button className="h-9 w-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"><Phone className="h-4 w-4" /></button><button className="h-9 w-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"><MoreVertical className="h-4 w-4" /></button></div>
                  </>}
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 bg-[#efeae2]" style={{ backgroundImage: 'radial-gradient(rgba(15,118,110,0.03) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
                  {msgsLoading ? <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-52 rounded-2xl bg-white/70" />)}</div> : messages.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 py-12">No messages yet. Start the conversation.</div>
                  ) : <div className="max-w-4xl mx-auto space-y-1">
                    {messages.map((msg, idx) => {
                      const showDate = idx === 0 || formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt)
                      return (
                        <div key={msg._id}>
                          {showDate && <div className="flex justify-center my-4"><div className="rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-[10px] font-medium text-slate-500 shadow-sm">{formatDate(msg.createdAt)}</div></div>}
                          <MessageBubble msg={msg} isMe={String(msg.senderId?._id) === String(user?._id)} onAttachmentClick={handleAttachmentClick} />
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>}
                </div>

                {room?.status === 'active' && (
                  <div className="border-t border-slate-200 bg-white px-3 sm:px-4 py-3">
                    {files.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{files.map((f, i) => <Badge key={i} variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-600 h-6 px-2"><span className="max-w-[140px] truncate inline-block">{f.name}</span><button className="ml-1 text-slate-400 hover:text-slate-700" onClick={() => setFiles((fls) => fls.filter((_, j) => j !== i))}>✕</button></Badge>)}</div>}
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2">
                      <input type="file" ref={fileInputRef} multiple className="hidden" onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])} />
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:bg-white" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                      <Input placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-slate-700 placeholder:text-slate-400" />
                      <Button size="sm" onClick={handleSend} disabled={(!text.trim() && !files.length) || sendMutation.isPending} className="h-10 w-10 rounded-xl p-0 bg-teal-600 hover:bg-teal-700">{sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                    </div>
                  </div>
                )}

                {room?.status === 'closed' && <div className="p-4 bg-slate-50 border-t text-center text-sm text-slate-500">This chat room is closed.</div>}
              </>
            )}
          </div>
        </div>
      </div>

      <DocumentPreviewModal open={!!previewDoc} onClose={() => setPreviewDoc(null)} documents={previewDoc?.docs || []} initialIndex={previewDoc?.index || 0} title="Attachment Preview" />
    </>
  )
}