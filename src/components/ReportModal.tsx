import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Flag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ReportModalProps {
  hangoutId: string | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ hangoutId, onClose }) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState<'spam' | 'harassment' | 'misleading' | 'safety' | 'other'>('misleading');
  const [details, setDetails] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hangoutId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      showToast('Please provide details for the report.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          details,
          userEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Report submitted. Our moderation team will review this shortly.', 'success');
        onClose();
      } else {
        showToast(data.error || 'Failed to submit report', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#141622] border border-[#232736] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232736] bg-[#0f1118]">
          <div className="flex items-center gap-2 text-red-400">
            <Flag className="w-4 h-4" />
            <h3 className="font-bold text-white text-sm">Report Hangout</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#232736]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm text-gray-300">
          <p className="text-xs text-gray-400 leading-relaxed">
            YapOut is dedicated to respectful, safe, real-world hangouts. If this hangout violates our community standards, please let us know.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
            >
              <option value="misleading">Misleading information or bait-and-switch</option>
              <option value="safety">Safety concern or hazardous activity</option>
              <option value="harassment">Harassment, hate speech, or discrimination</option>
              <option value="spam">Commercial spam or advertising</option>
              <option value="other">Other policy violation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">Explanation & Details</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what occurred or why this hangout violates community guidelines..."
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7] resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">
              Your Email <span className="text-gray-500 font-normal">(optional, for updates)</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-genz-dark rounded-xl px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-genz-danger rounded-xl px-5 py-2 text-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
