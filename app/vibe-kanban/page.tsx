'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { getCurrentUser, getVibeKanban, createVibeCardAction, moveVibeCardAction, deleteVibeCardAction, getVibeKanbanStats } from '../actions';
import { toast } from 'sonner';
import { Plus, Trash2, DollarSign, Sparkles } from 'lucide-react';
import { User, KanbanCard, KanbanColumnId } from '../../lib/types';

const COLUMNS = [
  { id: 'ideate' as const, label: 'Ideate', icon: '🌱', desc: 'Capture the spark' },
  { id: 'flow' as const, label: 'In the Flow', icon: '⚡', desc: 'Deep work mode' },
  { id: 'ship' as const, label: 'Ship It', icon: '🚀', desc: 'Almost bankable' },
  { id: 'banked' as const, label: 'Banked', icon: '🏦', desc: 'Vibes cashed' },
];

const VIBE_OPTIONS = [
  { value: 'chill', label: 'Chill', emoji: '🧘' },
  { value: 'grind', label: 'Grind', emoji: '💪' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'social', label: 'Social', emoji: '🗣️' },
  { value: 'hustle', label: 'Hustle', emoji: '🔥' },
];

export default function VibeKanbanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [stats, setStats] = useState<{ totalCards: number; banked: number; earnedFromVibes: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadAll() {
    setLoading(true);
    const u = await getCurrentUser();
    setUser(u);
    const board = await getVibeKanban();
    if (board) {
      setCards(board.cards);
    }
    const s = await getVibeKanbanStats();
    setStats(s);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Native HTML5 Drag and Drop
  function onDragStart(e: React.DragEvent, cardId: string) {
    setDraggingId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd() {
    setDraggingId(null);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function onDrop(e: React.DragEvent, toColumn: KanbanColumnId) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId || draggingId !== cardId) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.column === toColumn) {
      setDraggingId(null);
      return;
    }

    // Optimistic UI
    const prevCards = [...cards];
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column: toColumn } : c))
    );

    const res = await moveVibeCardAction(cardId, toColumn);
    if (res.error) {
      toast.error(res.error);
      setCards(prevCards); // rollback
    } else {
      if (toColumn === 'banked' && card.reward) {
        toast.success(`+$${card.reward.toFixed(2)} vibe cashed`, {
          description: card.title,
          icon: <Sparkles className="text-emerald-400" />,
        });
      } else {
        toast.success(`Moved to ${COLUMNS.find((c) => c.id === toColumn)?.label}`);
      }
      // refresh stats + any earnings that happened
      loadAll();
    }
    setDraggingId(null);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    const res = await createVibeCardAction(fd);
    setCreating(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('New vibe added 🌱');
      setShowCreate(false);
      (e.target as HTMLFormElement).reset();
      loadAll();
    }
  }

  async function handleDelete(cardId: string) {
    if (!confirm('Delete this vibe card?')) return;
    const res = await deleteVibeCardAction(cardId);
    if (res.error) toast.error(res.error);
    else {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      toast('Vibe deleted');
    }
  }

  const cardsByColumn = (colId: KanbanColumnId) =>
    cards.filter((c) => c.column === colId);

  const totalPotential = cards
    .filter((c) => c.reward && c.column !== 'banked')
    .reduce((s, c) => s + (c.reward || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Nav userName={user?.name} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="uppercase tracking-[3px] text-xs text-violet-400">PRODUCTIVITY + EARNINGS</div>
            <h1 className="text-5xl font-semibold tracking-tighter flex items-center gap-3">
              Vibe Kanban <Sparkles className="text-violet-400" size={32} />
            </h1>
            <p className="text-zinc-400 mt-1 max-w-md">Organize your earning ideas, side projects and hustles. Ship vibes → get paid.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm hidden sm:block">
              <div className="text-zinc-400">Potential in pipeline</div>
              <div className="font-semibold text-xl tabular-nums text-amber-400">${totalPotential.toFixed(2)}</div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium"
            >
              <Plus size={18} /> New Vibe
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="mb-6 flex gap-4 text-sm">
            <div className="card rounded-2xl px-5 py-3 flex items-center gap-2">
              <span className="text-zinc-400">Total vibes tracked</span>
              <span className="font-semibold">{stats.totalCards}</span>
            </div>
            <div className="card rounded-2xl px-5 py-3 flex items-center gap-2">
              <span className="text-zinc-400">Banked</span>
              <span className="font-semibold text-emerald-400">{stats.banked}</span>
            </div>
            <div className="card rounded-2xl px-5 py-3 flex items-center gap-2">
              <span className="text-zinc-400">Earned via Kanban</span>
              <span className="font-semibold text-emerald-400 tabular-nums">+${stats.earnedFromVibes.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
          {COLUMNS.map((col) => {
            const colCards = cardsByColumn(col.id);
            const isBanked = col.id === 'banked';
            return (
              <div
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                className={`rounded-3xl p-3 min-h-[520px] border border-white/10 flex flex-col ${isBanked ? 'bg-emerald-950/30' : 'bg-zinc-900/60'}`}
              >
                <div className="flex items-center justify-between px-3 pt-2 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{col.icon}</span>
                    <div>
                      <div className="font-semibold">{col.label}</div>
                      <div className="text-[10px] text-zinc-500 -mt-0.5">{col.desc}</div>
                    </div>
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-zinc-400 tabular-nums">
                    {colCards.length}
                  </div>
                </div>

                <div className="flex-1 space-y-3 px-1 pb-2 overflow-y-auto">
                  {colCards.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                      Drop vibes here
                    </div>
                  )}

                  {colCards.map((card) => {
                    const vibeMeta = VIBE_OPTIONS.find((v) => v.value === card.vibe);
                    const isDragging = draggingId === card.id;
                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, card.id)}
                        onDragEnd={onDragEnd}
                        className={`group card rounded-2xl p-4 cursor-grab active:cursor-grabbing select-none transition-all ${isDragging ? 'opacity-40 scale-[0.985]' : 'hover:border-white/30'} border border-white/10`}
                      >
                        <div className="flex justify-between gap-2">
                          <div className="font-medium leading-tight pr-1">{card.title}</div>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition"
                            title="Delete vibe"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {card.description && (
                          <div className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{card.description}</div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {vibeMeta && (
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/70">
                                {vibeMeta.emoji} {vibeMeta.label}
                              </span>
                            )}
                          </div>

                          {card.reward && (
                            <div className={`flex items-center gap-1 font-mono font-semibold ${isBanked ? 'text-emerald-400' : 'text-amber-400'}`}>
                              <DollarSign size={13} /> {card.reward.toFixed(2)}
                            </div>
                          )}
                        </div>

                        {isBanked && card.reward && (
                          <div className="mt-2 text-[10px] text-emerald-400/70">Cashed ✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-center text-zinc-500 pt-1 pb-2">{col.label.toUpperCase()}</div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-zinc-500 max-w-md mx-auto">
          Drag cards between columns. When a card with a reward hits <span className="text-emerald-400">Banked</span>, you instantly earn the amount + a small flow bonus.
          <br />Use this to stay organized while building multiple income streams.
        </div>
      </div>

      {/* Create Vibe Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6" onClick={() => setShowCreate(false)}>
          <div
            className="modal card w-full max-w-md rounded-3xl p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-semibold text-xl mb-1 flex items-center gap-2">
              <Sparkles /> Capture a new vibe
            </div>
            <p className="text-sm text-zinc-400 mb-5">Ideas, micro-projects, content, outreach — anything that can earn.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">WHAT'S THE VIBE?</label>
                <input
                  name="title"
                  required
                  placeholder="Launch a 3-day offer for my Notion template"
                  className="w-full bg-black border border-white/15 focus:border-violet-500 rounded-2xl px-4 py-3 text-base outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">DETAILS (OPTIONAL)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Target audience: indie hackers. Channels: Twitter + LinkedIn"
                  className="w-full bg-black border border-white/15 focus:border-violet-500 rounded-2xl px-4 py-3 text-sm outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">POTENTIAL EARNINGS</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-zinc-400">$</span>
                    <input
                      name="reward"
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="12"
                      className="w-full bg-black border border-white/15 focus:border-violet-500 rounded-2xl pl-7 pr-4 py-3 text-base outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">VIBE TAG</label>
                  <select name="vibe" defaultValue="grind" className="w-full bg-black border border-white/15 focus:border-violet-500 rounded-2xl px-4 py-3 text-base outline-none">
                    {VIBE_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value}>{v.emoji} {v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-2xl border border-white/15 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1 py-3 rounded-2xl font-medium disabled:opacity-60"
                >
                  {creating ? 'Adding vibe...' : 'Add to Kanban'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
