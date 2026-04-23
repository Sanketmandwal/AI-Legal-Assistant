// src/features/chat/pages/ChatPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMyChatRooms, useChatMessages, useSendMessage, useMarkRead, useChatRoomDetails } from '../api/chatApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import EmptyState from '@/components/common/EmptyState'
import { MessageSquare, Send, ArrowLeft, User, Paperclip, Loader2, FileText } from 'lucide-react'

function formatTime(d) { return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }

function RoomsList({ rooms, activeRoomId, role }) {
  const basePath = role === 'lawyer' ? '/lawyer/chat' : '/citizen/chat'
  return (
    <div className="space-y-1.5">
      {rooms.map((room) => {
        const otherUser = room.otherParticipant
        const isActive = room._id === activeRoomId
        return (
          <Link key={room._id} to={`${basePath}/${room._id}`}>
            <div className={`p-3 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{otherUser?.name?.[0] || '?'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="font-semibold text-sm text-slate-900 truncate">{otherUser?.name || 'User'}</div>
                    <div className="text-[10px] text-slate-400 shrink-0">{room.lastMessageAt ? formatTime(room.lastMessageAt) : ''}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500 truncate flex-1 pr-2">{room.latestMessage?.text || room.fir?.incident?.title || 'Case discussion'}</div>
                    {room.unreadCount > 0 && <Badge className="bg-blue-600 text-white rounded-full h-5 w-5 p-0 flex items-center justify-center shrink-0 border-0">{room.unreadCount}</Badge>}
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

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md' : 'bg-white shadow-sm border border-slate-100 text-slate-800 rounded-bl-md'}`}>
          {!isMe && <div className="text-xs font-semibold mb-1 text-blue-600">{msg.senderId?.name}</div>}
          {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
          {msg.attachments?.length > 0 && (
            <div className="mt-2 space-y-1">{msg.attachments.map((a, i) => (
              <a key={i} href={a.signedUrl || '#'} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-xs underline ${isMe ? 'text-blue-100' : 'text-blue-600'}`}><Paperclip className="h-3 w-3" />{a.filename || 'Attachment'}</a>
            ))}</div>
          )}
        </div>
        <div className={`text-[10px] mt-1 px-1 ${isMe ? 'text-right text-slate-400' : 'text-slate-400'}`}>{formatTime(msg.createdAt)}</div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { roomId } = useParams()
  const { user } = useSelector((s) => s.auth)
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
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

  const handleSend = () => {
    if (!text.trim() && !files.length) return
    const fd = new FormData()
    if (text.trim()) fd.append('text', text.trim())
    files.forEach(f => fd.append('attachments', f))
    sendMutation.mutate(fd, { onSuccess: () => { setText(''); setFiles([]) } })
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
      {/* Sidebar */}
      <div className={`w-80 border-r border-slate-200 flex flex-col bg-white ${roomId ? 'hidden lg:flex' : 'flex w-full lg:w-80'}`}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-600" /> Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {roomsLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> : rooms.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No chats" description="Chat rooms are created when consultations are accepted." />
          ) : <RoomsList rooms={rooms} activeRoomId={roomId} role={user?.role} />}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!roomId ? 'hidden lg:flex' : 'flex'}`}>
        {!roomId ? (
          <div className="flex-1 flex items-center justify-center"><EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a chat from the sidebar to start messaging." /></div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-blue-50">
              <Button variant="ghost" size="sm" className="lg:hidden" asChild><Link to={`/${user?.role}/chat`}><ArrowLeft className="h-4 w-4" /></Link></Button>
              {room && (<>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{(user?.role === 'citizen' ? room.lawyerUserId?.name : room.citizenId?.name)?.[0] || '?'}</div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{user?.role === 'citizen' ? room.lawyerUserId?.name : room.citizenId?.name}</div><div className="text-xs text-slate-500 truncate flex items-center gap-1"><FileText className="h-3 w-3" />{room.firId?.incident?.title}</div></div>
                <Badge variant={room.status === 'active' ? 'default' : 'secondary'} className="text-xs">{room.status}</Badge>
              </>)}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white">
              {msgsLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-48 rounded-xl" />)}</div> : messages.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-10">No messages yet. Start the conversation!</div>
              ) : messages.map((msg) => <MessageBubble key={msg._id} msg={msg} isMe={String(msg.senderId?._id) === String(user?._id)} />)}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {room?.status === 'active' && (
              <div className="p-3 border-t border-slate-100 bg-white">
                {files.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2">{files.map((f, i) => <Badge key={i} variant="outline" className="text-[10px]">{f.name}<button className="ml-1" onClick={() => setFiles(fls => fls.filter((_, j) => j !== i))}>✕</button></Badge>)}</div>}
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} multiple className="hidden" onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                  <Input placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} className="flex-1" />
                  <Button size="sm" onClick={handleSend} disabled={(!text.trim() && !files.length) || sendMutation.isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            {room?.status === 'closed' && <div className="p-4 bg-slate-50 border-t text-center text-sm text-slate-500">This chat room is closed.</div>}
          </>
        )}
      </div>
    </div>
  )
}
