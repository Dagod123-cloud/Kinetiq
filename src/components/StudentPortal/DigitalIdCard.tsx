import React from 'react';
import { X, QrCode, ShieldCheck, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { StudentProfile } from '../../types/index.ts';
import { getHouseConfig } from '../../utils/houseThemes.ts';

interface DigitalIdCardProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  registeredCount: number;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({
  student,
  isOpen,
  onClose,
  registeredCount
}) => {
  if (!isOpen) return null;

  const houseConfig = getHouseConfig(student.house);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-label="Digital Student ID Card"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative text-white">
        {/* Card Header Background with House Color Theme */}
        <div className={`p-6 bg-gradient-to-br ${houseConfig.gradientClass} relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white/90" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/90 font-heading">
                {student.schoolName || "St. Jude's Academy"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
              aria-label="Close pass"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-xl">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-heading leading-tight">
                {student.name}
              </h3>
              <div className="text-xs text-white/95 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Yr {student.yearGroup} • {student.className || '10-A'}</span>
                <span>•</span>
                <span className="font-bold underline decoration-white/40">{houseConfig.label}</span>
              </div>
              <div className="text-[11px] font-mono text-white/80 mt-0.5">
                {student.studentIdNumber}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-white border border-white/20">
              PE Team: {houseConfig.colorName}
            </span>
            {student.houseVerified && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-200 border border-emerald-400/50 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Official Record
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 bg-slate-900 space-y-4">
          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-2xl border text-center"
              style={{
                borderColor: `${houseConfig.hex}50`,
                backgroundColor: `${houseConfig.hex}15`
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                {houseConfig.name} Points
              </span>
              <span className="text-lg font-extrabold font-heading" style={{ color: houseConfig.hex }}>
                {student.points} pts
              </span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Active Sign-Ups
              </span>
              <span className="text-lg font-extrabold text-cyan-400 font-heading">
                {registeredCount} Events
              </span>
            </div>
          </div>

          {/* QR Code Security Scanner Area */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
            <div className="p-2.5 bg-white rounded-xl shadow-lg">
              <QrCode className="w-32 h-32 text-slate-900" />
            </div>
            <div className="text-center">
              <div className="text-[11px] font-mono text-slate-400">
                OFFICIAL DIGITAL EVENT PASS
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Valid for Entry at All Campus Venues
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            Close Digital Pass
          </button>
        </div>
      </div>
    </div>
  );
};
