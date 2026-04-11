import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Trash2, X } from 'lucide-react';
import { authAPI, chatAPI, mentorAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessageItem {
  _id: string;
  studentId: string;
  mentorId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface ChatTarget {
  id: string;
  name: string;
  email?: string;
}

interface MentorStudentOption {
  _id: string;
  name: string;
  email: string;
}

const formatTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState('');
  const [error, setError] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  const [target, setTarget] = useState<ChatTarget | null>(null);
  const [mentorStudents, setMentorStudents] = useState<MentorStudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const listRef = useRef<HTMLDivElement | null>(null);

  const isStudent = user?.role === 'student';
  const isMentor = user?.role === 'mentor';

  const selectedPartnerId = useMemo(() => {
    if (isStudent) {
      return undefined;
    }

    return selectedStudentId || undefined;
  }, [isStudent, selectedStudentId]);

  const fetchMessages = useCallback(async (partnerStudentId?: string) => {
    const response = await chatAPI.getMessages(partnerStudentId);
    setMessages(response.data.messages || []);
  }, []);

  const bootstrapChat = useCallback(async () => {
    if (!isStudent && !isMentor) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isStudent) {
        const meResponse = await authAPI.getCurrentUser();
        const mentor = meResponse.data?.user?.mentorId;

        if (!mentor || typeof mentor !== 'object') {
          setTarget(null);
          setMessages([]);
          setError('No assigned mentor yet.');
          return;
        }

        setTarget({
          id: mentor._id,
          name: mentor.name,
          email: mentor.email
        });

        await fetchMessages();
        return;
      }

      const studentsResponse = await mentorAPI.getAssignedStudents();
      const students: MentorStudentOption[] = studentsResponse.data?.students || [];
      setMentorStudents(students);

      if (students.length === 0) {
        setTarget(null);
        setSelectedStudentId('');
        setMessages([]);
        setError('No assigned students yet.');
        return;
      }

      const nextStudentId = selectedStudentId && students.some((item) => item._id === selectedStudentId)
        ? selectedStudentId
        : students[0]._id;

      setSelectedStudentId(nextStudentId);

      const selectedStudent = students.find((item) => item._id === nextStudentId) || students[0];
      setTarget({
        id: selectedStudent._id,
        name: selectedStudent.name,
        email: selectedStudent.email
      });

      await fetchMessages(nextStudentId);
    } catch {
      setError('Unable to load chat right now.');
    } finally {
      setLoading(false);
    }
  }, [fetchMessages, isMentor, isStudent, selectedStudentId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    bootstrapChat();
  }, [bootstrapChat, isOpen]);

  useEffect(() => {
    if (!isOpen || !isMentor || !selectedStudentId) {
      return;
    }

    const selectedStudent = mentorStudents.find((item) => item._id === selectedStudentId);
    if (!selectedStudent) {
      return;
    }

    setTarget({
      id: selectedStudent._id,
      name: selectedStudent.name,
      email: selectedStudent.email
    });

    const refreshForSelection = async () => {
      try {
        setError('');
        await fetchMessages(selectedStudentId);
      } catch {
        setError('Unable to refresh conversation.');
      }
    };

    refreshForSelection();
  }, [fetchMessages, isOpen, isMentor, mentorStudents, selectedStudentId]);

  useEffect(() => {
    if (!isOpen || !target) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        await fetchMessages(selectedPartnerId);
      } catch {
        // Keep polling resilient without interrupting user input.
      }
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchMessages, isOpen, selectedPartnerId, target]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = listRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isOpen]);

  const onSendMessage = async () => {
    const trimmed = messageInput.trim();

    if (!trimmed || sending || (!isStudent && !selectedStudentId)) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await chatAPI.sendMessage(trimmed, selectedPartnerId);
      const createdMessage = response.data?.message as ChatMessageItem;

      setMessages((previous) => [...previous, createdMessage]);
      setMessageInput('');
    } catch {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const onDeleteMessage = async (messageId: string) => {
    if (deletingMessageId) {
      return;
    }

    setDeletingMessageId(messageId);
    setError('');

    try {
      await chatAPI.deleteMessage(messageId, selectedPartnerId);
      setMessages((previous) => previous.filter((item) => item._id !== messageId));
    } catch {
      setError('Failed to delete message.');
    } finally {
      setDeletingMessageId('');
    }
  };

  if (!isStudent && !isMentor) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-label="Open chat"
        title="Chat"
      >
        <span className="sr-only">Open chat</span>
        <MessageCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <section className="absolute right-0 top-12 z-40 flex h-[460px] w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chat 💬</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {target ? target.name : 'No active chat'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {isMentor && mentorStudents.length > 0 && (
            <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400" htmlFor="mentor-student-chat-select">
                Chat with student
              </label>
              <select
                id="mentor-student-chat-select"
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                {mentorStudents.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3 dark:bg-slate-900/60">
            {loading && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading messages...</p>
            )}

            {!loading && messages.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">No messages yet. Start the conversation.</p>
            )}

            {!loading && messages.map((item) => {
              const mine = item.senderId === user?._id;
              const isDeleting = deletingMessageId === item._id;

              return (
                <div key={item._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <article
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{item.message}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      {mine && (
                        <button
                          type="button"
                          onClick={() => onDeleteMessage(item._id)}
                          disabled={Boolean(deletingMessageId)}
                          className="inline-flex items-center rounded p-0.5 text-blue-100 transition hover:bg-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete message"
                          title="Delete message"
                        >
                          {isDeleting ? (
                            <span className="text-[10px]">...</span>
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                      <p className={`text-[10px] ${mine ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>

          <footer className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            {error && <p className="mb-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onSendMessage();
                  }
                }}
                placeholder="Type a message"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                disabled={loading || !target || sending}
              />
              <button
                type="button"
                onClick={onSendMessage}
                disabled={loading || !target || sending || !messageInput.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>
      )}
    </>
  );
}
