import React, { useState } from 'react';
import { 
  Play, 
  Save, 
  RotateCcw, 
  RotateCw, 
  FolderOpen, 
  Download, 
  Printer, 
  Maximize, 
  Minimize, 
  Check, 
  Sparkles,
  Layers,
  FileText,
  Clock,
  RefreshCw,
  Zap,
  FileUp
} from 'lucide-react';

interface TitleBarProps {
  title: string;
  onUpdateTitle: (title: string) => void;
  onSave: () => void;
  isSaved: boolean;
  isRealtimeSyncing?: boolean;
  lastSavedTime?: string;
  currentTime?: string;
  isRealtimeEnabled?: boolean;
  onToggleRealtime?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onStartSlideShow: () => void;
  onOpenRepository: () => void;
  onOpenImportPptx?: () => void;
  onExportJSON: () => void;
  onPrintSlides: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  onUpdateTitle,
  onSave,
  isSaved,
  isRealtimeSyncing,
  lastSavedTime,
  currentTime,
  isRealtimeEnabled = true,
  onToggleRealtime,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onStartSlideShow,
  onOpenRepository,
  onOpenImportPptx,
  onExportJSON,
  onPrintSlides,
  onToggleFullscreen,
  isFullscreen
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="h-10 bg-[#c43e1c] text-white flex items-center justify-between px-3 text-xs select-none border-b border-[#a83214] z-30 shrink-0">
      {/* Left: PPT Brand Icon & Quick Access Toolbar */}
      <div className="flex items-center space-x-2">
        {/* PowerPoint Logo / Kho Bài Giảng Badge */}
        <div className="flex items-center space-x-1.5 font-bold tracking-wider mr-1">
          <div className="w-6 h-6 bg-white text-[#c43e1c] rounded flex items-center justify-center font-black text-sm shadow-sm">
            P
          </div>
          <span className="font-extrabold text-sm tracking-normal flex items-center gap-1">
            KHO BÀI GIẢNG
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-semibold tracking-wide uppercase">
              PPT Pro
            </span>
          </span>
        </div>

        {/* Quick Access Toolbar */}
        <div className="flex items-center space-x-1.5 border-l border-white/20 pl-2">
          <button
            onClick={onSave}
            title={isSaved ? 'Bài giảng đã được lưu an toàn vào Kho bài giảng (Ctrl + S)' : 'Lưu bài giảng đang soạn vào Kho bài giảng (Ctrl + S)'}
            className={`px-2 py-1 rounded transition flex items-center gap-1.5 shadow-xs font-bold text-xs cursor-pointer ${
              isSaved 
                ? 'bg-white/15 hover:bg-white/25 text-white' 
                : 'bg-amber-400 hover:bg-amber-300 text-slate-900 animate-pulse'
            }`}
          >
            {isRealtimeSyncing ? (
              <RefreshCw size={13} className="animate-spin text-amber-300" />
            ) : isSaved ? (
              <Check size={13} className="text-emerald-300" />
            ) : (
              <Save size={13} />
            )}
            <span className="text-[11px]">{isSaved ? 'Đã lưu vào Kho' : 'Lưu vào Kho'}</span>
          </button>

          {/* Real-time sync indicator badge */}
          <div 
            onClick={onToggleRealtime}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/30 cursor-pointer transition text-[10.5px]"
            title="Trạng thái đồng bộ thời gian thực (Bấm để bật/tắt)"
          >
            {isRealtimeSyncing ? (
              <>
                <RefreshCw size={11} className="animate-spin text-amber-300" />
                <span className="text-amber-200 font-medium">Đang lưu...</span>
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${isRealtimeEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                <span className="text-white/90 font-medium">
                  {isRealtimeEnabled ? 'Thời gian thực' : 'Đã tắt'}
                </span>
                {lastSavedTime && (
                  <span className="text-white/70 text-[9.5px]">({lastSavedTime})</span>
                )}
              </>
            )}
          </div>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl + Z)"
            className={`p-1.5 rounded hover:bg-white/15 transition ${
              !canUndo ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
            }`}
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl + Y)"
            className={`p-1.5 rounded hover:bg-white/15 transition ${
              !canRedo ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
            }`}
          >
            <RotateCw size={14} />
          </button>

          <button
            onClick={onStartSlideShow}
            title="Bắt đầu trình chiếu từ đầu (F5)"
            className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-medium transition flex items-center gap-1 shadow-xs ml-1"
          >
            <Play size={13} className="fill-current" />
            <span className="text-[11px] font-semibold">Trình chiếu (F5)</span>
          </button>
        </div>
      </div>

      {/* Center: Editable Presentation Title */}
      <div className="flex-1 max-w-xl mx-4 flex justify-center">
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="w-full">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className="w-full bg-white text-slate-900 px-2 py-0.5 rounded text-xs text-center font-medium focus:outline-hidden"
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(true);
            }}
            title="Bấm để đổi tên bài giảng"
            className="px-3 py-1 rounded hover:bg-white/15 transition text-xs font-medium truncate max-w-md border border-transparent hover:border-white/20"
          >
            {title} <span className="opacity-70 text-[10px]">✏️</span>
          </button>
        )}
      </div>

      {/* Right: Repository, Export, Fullscreen, Clock */}
      <div className="flex items-center space-x-1.5">
        {/* Real-time live clock */}
        {currentTime && (
          <div 
            className="hidden md:flex items-center gap-1 text-[11px] font-mono bg-black/20 px-2 py-1 rounded text-white/90"
            title="Đồng hồ hệ thống thời gian thực"
          >
            <Clock size={12} className="text-amber-300" />
            <span>{currentTime}</span>
          </div>
        )}

        {onOpenImportPptx && (
          <button
            onClick={onOpenImportPptx}
            title="Nhập file PowerPoint (.pptx) có sẵn từ máy tính để trình chiếu hoặc chỉnh sửa"
            className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileUp size={13} className="text-slate-900" />
            <span className="text-[11px]">Nhập PowerPoint</span>
          </button>
        )}

        <button
          onClick={onOpenRepository}
          title="Mở Kho Bài Giảng (Các bài học mẫu & đã lưu)"
          className="px-2.5 py-1 rounded bg-white text-[#c43e1c] hover:bg-amber-50 font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <FolderOpen size={13} />
          <span className="text-[11px]">Kho Bài Giảng</span>
        </button>

        <button
          onClick={onPrintSlides}
          title="In hoặc Xuất bài giảng sang PDF"
          className="p-1.5 rounded hover:bg-white/15 transition flex items-center gap-1"
        >
          <Printer size={14} />
          <span className="hidden md:inline text-[11px]">In / PDF</span>
        </button>

        <button
          onClick={onExportJSON}
          title="Tải tệp sao lưu bài giảng (.json)"
          className="p-1.5 rounded hover:bg-white/15 transition flex items-center gap-1"
        >
          <Download size={14} />
          <span className="hidden lg:inline text-[11px]">Xuất file</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          className="p-1.5 rounded hover:bg-white/15 transition"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>
    </div>
  );
};
