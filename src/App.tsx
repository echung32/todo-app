import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import {
  CheckCircle2,
  LayoutDashboard,
  BrainCircuit,
  Calendar,
  Settings,
  X,
} from 'lucide-react'

interface Todo {
  id: string
  title: string
  deadline: string
  completed: boolean
  x: number
  y: number
  rotation: number
  scale: number
}

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'

const SPOTLIGHT_R = 260

const rand = (min: number, max: number) => Math.random() * (max - min) + min

// Generate scatter coordinates/transforms once. Called at module init for the
// seed list and again whenever a new task is created, so positions are stable
// across re-renders (never recomputed on every render).
function makeScatter() {
  return {
    x: rand(10, 90), // percent
    y: rand(15, 85), // percent
    rotation: rand(-20, 20), // deg
    scale: rand(0.8, 1.2),
  }
}

const SEED_DATA: Omit<Todo, 'x' | 'y' | 'rotation' | 'scale'>[] = [
  { id: 't1', title: 'Buy groceries', deadline: 'Jun 20, 2026', completed: false },
  { id: 't2', title: 'Finish React project', deadline: 'Jun 24, 2026', completed: false },
  { id: 't3', title: 'Call Mom', deadline: 'Jun 19, 2026', completed: true },
  { id: 't4', title: 'Review PRs', deadline: 'Jun 21, 2026', completed: false },
  { id: 't5', title: 'Water the plants', deadline: 'Jun 19, 2026', completed: true },
  { id: 't6', title: 'Book dentist appointment', deadline: 'Jun 30, 2026', completed: false },
  { id: 't7', title: 'Pay electricity bill', deadline: 'Jun 25, 2026', completed: false },
  { id: 't8', title: 'Plan weekend trip', deadline: 'Jul 04, 2026', completed: false },
  { id: 't9', title: 'Read 20 pages', deadline: 'Jun 19, 2026', completed: true },
  { id: 't10', title: 'Refactor auth module', deadline: 'Jun 27, 2026', completed: false },
  { id: 't11', title: 'Reply to Sarah', deadline: 'Jun 20, 2026', completed: true },
  { id: 't12', title: 'Renew gym membership', deadline: 'Jul 01, 2026', completed: false },
  { id: 't13', title: 'Backup laptop', deadline: 'Jun 22, 2026', completed: false },
]

// Coordinates computed ONCE at module init — stable across renders.
const INITIAL_TODOS: Todo[] = SEED_DATA.map((t) => ({ ...t, ...makeScatter() }))

interface RevealLayerProps {
  cursorX: number
  cursorY: number
  todos: Todo[]
  toggleTodo: (id: string) => void
}

function RevealLayer({ cursorX, cursorY, todos, toggleTodo }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 720,
  }))

  // Recompute canvas size on window resize.
  useEffect(() => {
    const onResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // On every render: redraw the radial spotlight gradient into the hidden
  // canvas and apply it as a mask on the reveal div so the scattered notes are
  // only visible inside the glowing circle.
  useEffect(() => {
    const canvas = canvasRef.current
    const reveal = revealRef.current
    if (!canvas || !reveal) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size.w
    canvas.height = size.h
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const grad = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R,
    )
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(255,255,255,1)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    grad.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    grad.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2)
    ctx.fill()

    const url = canvas.toDataURL()
    reveal.style.setProperty('mask-image', `url(${url})`)
    reveal.style.setProperty('-webkit-mask-image', `url(${url})`)
    reveal.style.setProperty('mask-size', '100% 100%')
    reveal.style.setProperty('-webkit-mask-size', '100% 100%')
  }, [cursorX, cursorY, size])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />
      <div ref={revealRef} className="absolute inset-0 z-30 pointer-events-auto">
        {todos.map((todo) => (
          <div
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className="absolute pointer-events-auto bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl p-3 sm:p-4 shadow-xl cursor-pointer hover:bg-white/20 transition-colors"
            style={{
              left: `${todo.x}%`,
              top: `${todo.y}%`,
              transform: `translate(-50%,-50%) rotate(${todo.rotation}deg) scale(${todo.scale})`,
              opacity: todo.completed ? 0.5 : 1,
            }}
          >
            <div
              className={`text-sm font-medium ${todo.completed ? 'line-through' : ''}`}
            >
              {todo.title}
            </div>
            <div className="text-xs text-white/70 mt-1">{todo.deadline}</div>
          </div>
        ))}
      </div>
    </>
  )
}

const NAV_ITEMS = [
  { label: 'Dashboard', Icon: LayoutDashboard },
  { label: 'Mind Map', Icon: BrainCircuit },
  { label: 'Calendar', Icon: Calendar },
  { label: 'Settings', Icon: Settings },
]

function App() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [cursor, setCursor] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 640,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 360,
  }))

  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDeadline, setNewDeadline] = useState('')

  const mouseRef = useRef({ ...cursor })
  const smoothRef = useRef({ ...cursor })

  // Smooth the cursor with requestAnimationFrame + lerp (0.1 factor).
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    let raf = 0
    const tick = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1
      setCursor({ x: smoothRef.current.x, y: smoothRef.current.y })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }, [])

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      deadline: newDeadline || 'No deadline',
      completed: false,
      ...makeScatter(),
    }
    setTodos((prev) => [...prev, todo])
    setNewTitle('')
    setNewDeadline('')
    setShowModal(false)
  }

  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-white" />
          <span className="text-white text-2xl font-playfair italic">
            Toodledo
          </span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-2 items-center gap-1">
          {NAV_ITEMS.map(({ label, Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <button className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100">
          Login
        </button>
      </nav>

      {/* Hero */}
      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        {/* Base layer (z-10) */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Reveal layer / Mind Map (z-30) */}
        <RevealLayer
          cursorX={cursor.x}
          cursorY={cursor.y}
          todos={todos}
          toggleTodo={toggleTodo}
        />

        {/* Heading (z-50) */}
        <div className="absolute top-[20%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Clear the
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              mental clutter
            </span>
          </h1>
        </div>

        {/* Bottom-left paragraph (z-50) */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 z-50 max-w-[260px] hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed">
            Your tasks shouldn't overwhelm you. Hover around to shine a light on
            what matters, click to resolve, and organize your thoughts
            organically.
          </p>
        </div>

        {/* Bottom-right block (z-50) */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 z-50 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#3b82f6]/30"
          >
            Create Task
          </button>
        </div>
      </section>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-[200] bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-lg font-semibold">Create Task</h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/60">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What needs doing?"
                  autoFocus
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3b82f6] placeholder:text-white/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/60">Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#3b82f6]"
                />
              </div>
              <button
                type="submit"
                className="mt-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
