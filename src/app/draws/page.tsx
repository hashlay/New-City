'use client';

import React, { useState } from 'react';
import { Plus, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Draw } from '@/types';
import { formatDate } from '@/lib/utils';
import { useSchemeData } from '@/context/SchemeDataContext';

export default function DrawsPage() {
  const { showToast } = useToast();
  const { draws, customers, schemeCards, refreshAll } = useSchemeData();

  // Create Draw Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [drawNumber, setDrawNumber] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [grandPrize, setGrandPrize] = useState('');
  const [additionalPrizesStr, setAdditionalPrizesStr] = useState('');
  const [drawNotes, setDrawNotes] = useState('');
  const [isSubmittingDraw, setIsSubmittingDraw] = useState(false);

  // Record Winner Modal
  const [recordingWinnerDraw, setRecordingWinnerDraw] = useState<Draw | null>(null);
  const [winnerCustId, setWinnerCustId] = useState('');
  const [winnerCardId, setWinnerCardId] = useState('');
  const [winnerPrize, setWinnerPrize] = useState('');
  const [winnerInfo, setWinnerInfo] = useState('');
  const [isSubmittingWinner, setIsSubmittingWinner] = useState(false);

  // Handle Create Draw
  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDraw(true);
    try {
      const addPrizes = additionalPrizesStr
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawNumber: Number(drawNumber),
          drawDate: new Date(drawDate).toISOString(),
          grandPrize: grandPrize.trim(),
          additionalPrizes: addPrizes,
          notes: drawNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create draw');

      showToast(`Draw #${drawNumber} scheduled successfully!`, 'success');
      setIsCreateOpen(false);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error creating draw', 'error');
    } finally {
      setIsSubmittingDraw(false);
    }
  };

  // Open Record Winner modal
  const handleOpenRecordWinner = (draw: Draw) => {
    setRecordingWinnerDraw(draw);
    setWinnerPrize(draw.grandPrize);
    setWinnerCustId(customers[0]?._id || '');
    const firstCustCards = schemeCards.filter((c) => c.customerId === customers[0]?._id);
    setWinnerCardId(firstCustCards[0]?._id || '');
    setWinnerInfo('');
  };

  const handleWinnerCustomerChange = (cId: string) => {
    setWinnerCustId(cId);
    const matching = schemeCards.filter((c) => c.customerId === cId);
    setWinnerCardId(matching[0]?._id || '');
  };

  // Submit Winner
  const handleSubmitWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingWinnerDraw) return;
    setIsSubmittingWinner(true);

    try {
      const res = await fetch(`/api/draws/${recordingWinnerDraw._id}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: winnerCustId,
          schemeCardId: winnerCardId,
          prize: winnerPrize.trim(),
          winnerInformation: winnerInfo.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to record winner');

      showToast(`Winner recorded for Draw #${recordingWinnerDraw.drawNumber}!`, 'success');
      setRecordingWinnerDraw(null);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Error recording winner', 'error');
    } finally {
      setIsSubmittingWinner(false);
    }
  };

  const completedDraws = draws.filter((d) => d.status === 'Completed').length;
  const upcomingDraws = draws.filter((d) => d.status === 'Upcoming').length;
  const nextDraw = draws.find((d) => d.status === 'Upcoming');

  const winnerCustomerCards = schemeCards.filter((c) => c.customerId === winnerCustId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            New City Scheme Monthly Prize Draws
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Conduct monthly scheme prize draws, track grand prizes, and register felicitated winners.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setDrawNumber(String(draws.length + 1));
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setDrawDate(nextMonth.toISOString().split('T')[0]);
            setGrandPrize('');
            setAdditionalPrizesStr('');
            setDrawNotes('');
            setIsCreateOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Draw</span>
        </Button>
      </div>

      {/* Draw Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Draws</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{draws.length}</div>
          <span className="text-[11px] text-slate-400">Total 20-month draws</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Completed Draws</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">{completedDraws}</div>
          <span className="text-[11px] text-emerald-600">Prizes awarded</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Upcoming Draws</span>
          <div className="mt-1 text-2xl font-bold text-blue-600 tabular-nums">{upcomingDraws}</div>
          <span className="text-[11px] text-slate-400">Scheduled ahead</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <span className="text-xs font-medium text-slate-500">Next Draw Date</span>
          <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 truncate">
            {nextDraw ? formatDate(nextDraw.drawDate) : 'All Completed'}
          </div>
          <span className="text-[11px] text-slate-400">
            {nextDraw ? `Draw #${nextDraw.drawNumber}` : '-'}
          </span>
        </div>
      </div>

      {/* Draws List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Prize Draws Schedule</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draws.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-400">
              No draws scheduled.
            </div>
          ) : (
            draws.map((draw) => {
              const isCompleted = draw.status === 'Completed';

              return (
                <div
                  key={draw._id}
                  className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-display font-bold text-xs">
                          {String(draw.drawNumber).padStart(2, '0')}
                        </span>
                        <span className="font-display font-semibold text-slate-900 text-sm tracking-wide">
                          DRAW {String(draw.drawNumber).padStart(2, '0')}
                        </span>
                      </div>
                      <Badge status={draw.status} />
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(draw.drawDate)}</span>
                    </div>

                    {/* Luxury Grand Prize Display Card */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-md">
                      <div className="flex items-center gap-1.5 text-amber-900 text-xs font-semibold uppercase tracking-wider">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-display">Grand Prize</span>
                      </div>
                      <div className="font-serif text-sm font-bold text-slate-900 mt-1">
                        {draw.grandPrize}
                      </div>
                    </div>

                    {/* Additional Prizes */}
                    {draw.additionalPrizes && draw.additionalPrizes.length > 0 && (
                      <div className="text-xs text-slate-600 space-y-1">
                        <span className="font-medium text-slate-500 text-[11px] uppercase tracking-wider block mb-0.5">
                          Other Prizes
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                          {draw.additionalPrizes.map((p, idx) => (
                            <li key={idx} className="truncate">
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Winners Display */}
                    {draw.winners && draw.winners.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Winner Felicitated
                        </span>
                        {draw.winners.map((w) => (
                          <div
                            key={w._id}
                            className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">
                                {w.customer?.name || 'Winner'}
                              </span>
                              <span className="font-mono text-emerald-800 font-semibold">
                                {w.schemeCard?.cardNumber || 'Card'}
                              </span>
                            </div>
                            <div className="text-emerald-900 font-medium">Won: {w.prize}</div>
                            {w.winnerInformation && (
                              <div className="text-[11px] text-slate-600 italic">
                                &ldquo;{w.winnerInformation}&rdquo;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      variant={isCompleted ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenRecordWinner(draw)}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Add / View Winner' : 'Record Winner'}</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Draw Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Prize Draw"
          description="Schedule a monthly scheme draw with grand and additional prizes."
          maxWidth="md"
        >
          <form onSubmit={handleCreateDraw} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Draw Number"
                type="number"
                min="1"
                max="60"
                value={drawNumber}
                onChange={(e) => setDrawNumber(e.target.value)}
                required
              />

              <Input
                label="Draw Date"
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                required
              />
            </div>

            <Input
              label="Grand Prize"
              placeholder="e.g. 5 Gram 22K Gold Coin"
              value={grandPrize}
              onChange={(e) => setGrandPrize(e.target.value)}
              required
            />

            <Input
              label="Additional Prizes (Comma separated)"
              placeholder="e.g. Mixer Grinder, Dinner Set, Smart Watch"
              value={additionalPrizesStr}
              onChange={(e) => setAdditionalPrizesStr(e.target.value)}
            />

            <Input
              label="Notes (Optional)"
              placeholder="e.g. Special Festival Draw"
              value={drawNotes}
              onChange={(e) => setDrawNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmittingDraw}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmittingDraw}>
                Schedule Draw
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Winner Modal */}
      {recordingWinnerDraw && (
        <Modal
          isOpen={true}
          onClose={() => setRecordingWinnerDraw(null)}
          title={`Record Winner • Draw #${recordingWinnerDraw.drawNumber}`}
          description="Select the lucky winning customer and scheme card number for this draw."
          maxWidth="md"
        >
          <form onSubmit={handleSubmitWinner} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Winner Customer
              </label>
              <select
                value={winnerCustId}
                onChange={(e) => handleWinnerCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Winner Scheme Card
              </label>
              <select
                value={winnerCardId}
                onChange={(e) => setWinnerCardId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                required
              >
                {winnerCustomerCards.length === 0 ? (
                  <option value="">No scheme cards for this customer</option>
                ) : (
                  winnerCustomerCards.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.cardNumber} &bull; {c.schemeName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <Input
              label="Prize Awarded"
              value={winnerPrize}
              onChange={(e) => setWinnerPrize(e.target.value)}
              placeholder="e.g. 2 Gram 24K Gold Coin"
              required
            />

            <Input
              label="Felicitations & Notes (Optional)"
              value={winnerInfo}
              onChange={(e) => setWinnerInfo(e.target.value)}
              placeholder="e.g. Token #28 felicitated at showroom event"
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRecordingWinnerDraw(null)}
                disabled={isSubmittingWinner}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmittingWinner}>
                Save Winner & Mark Completed
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
