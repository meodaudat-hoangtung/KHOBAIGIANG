import React, { useState } from 'react';
import {
  PlusSquare,
  Table as TableIcon,
  Image as ImageIcon,
  Camera,
  Shapes,
  Smile,
  Box,
  Network,
  BarChart3,
  Link2,
  ZoomIn,
  MessageSquare,
  Type,
  FileText,
  Sparkles,
  Omega,
  Video,
  Mic,
  MonitorPlay,
  Layers,
  ChevronDown,
  Upload,
  Library,
  Scissors
} from 'lucide-react';

interface InsertRibbonProps {
  onAddSlide: (layout?: string) => void;
  onOpenTablePicker: () => void;
  onOpenImagePicker: () => void;
  onAddCameo: () => void;
  onOpenShapePicker: () => void;
  onOpenIconPicker: () => void;
  onOpenSmartArtPicker: () => void;
  onOpenChartPicker: () => void;
  onAddTextBox: () => void;
  onAddWordArt: () => void;
  onOpenMathFormula: () => void;
  onOpenSymbolPicker: () => void;
  onAddVideo: () => void;
  onAddAudio: () => void;
  onAddComment: () => void;
  onToggleCameo: () => void;
  hasCameo: boolean;
}

export const InsertRibbon: React.FC<InsertRibbonProps> = ({
  onAddSlide,
  onOpenTablePicker,
  onOpenImagePicker,
  onAddCameo,
  onOpenShapePicker,
  onOpenIconPicker,
  onOpenSmartArtPicker,
  onOpenChartPicker,
  onAddTextBox,
  onAddWordArt,
  onOpenMathFormula,
  onOpenSymbolPicker,
  onAddVideo,
  onAddAudio,
  onAddComment,
  onToggleCameo,
  hasCameo
}) => {
  const [showSlideLayouts, setShowSlideLayouts] = useState(false);

  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      {/* 1. Group: Trang chiếu (Slides) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1 relative">
        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              onClick={() => setShowSlideLayouts(!showSlideLayouts)}
              className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group"
              title="Thêm trang chiếu mới"
            >
              <div className="relative">
                <PlusSquare size={24} className="text-[#c43e1c] group-hover:scale-105 transition" />
              </div>
              <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
                Trang mới <ChevronDown size={10} className="ml-0.5" />
              </span>
            </button>

            {/* Slide Layout Dropdown */}
            {showSlideLayouts && (
              <div 
                className="absolute top-full left-0 mt-1 w-52 bg-white rounded-md shadow-xl border border-slate-200 z-50 p-1.5"
                onMouseLeave={() => setShowSlideLayouts(false)}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Chọn bố cục trang chiếu
                </div>
                <button
                  onClick={() => { onAddSlide('title'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <div className="w-6 h-4 border border-slate-400 bg-slate-50 flex items-center justify-center text-[7px]">Tiêu đề</div>
                  <span>Trang tiêu đề</span>
                </button>
                <button
                  onClick={() => { onAddSlide('title-content'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <div className="w-6 h-4 border border-slate-400 bg-slate-50 flex flex-col justify-between p-0.5">
                    <div className="h-1 bg-slate-400 w-full"></div>
                    <div className="h-1.5 bg-slate-200 w-full"></div>
                  </div>
                  <span>Tiêu đề & Nội dung</span>
                </button>
                <button
                  onClick={() => { onAddSlide('two-column'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <div className="w-6 h-4 border border-slate-400 bg-slate-50 flex gap-0.5 p-0.5">
                    <div className="w-1/2 bg-slate-300 h-full"></div>
                    <div className="w-1/2 bg-slate-300 h-full"></div>
                  </div>
                  <span>Hai cột so sánh</span>
                </button>
                <button
                  onClick={() => { onAddSlide('blank'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2 font-medium"
                >
                  <div className="w-6 h-4 border border-slate-300 bg-white"></div>
                  <span>Trang trống</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Trang chiếu</span>
      </div>

      {/* 2. Group: Bảng (Tables) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onOpenTablePicker}
          className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-12 h-[50px] group"
          title="Chèn bảng số liệu"
        >
          <TableIcon size={24} className="text-blue-600 group-hover:scale-105 transition" />
          <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
            Bảng <ChevronDown size={10} className="ml-0.5" />
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Bảng</span>
      </div>

      {/* 3. Group: Hình ảnh (Images) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onOpenImagePicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group"
            title="Chèn ảnh từ máy tính hoặc kho ảnh bài giảng"
          >
            <ImageIcon size={23} className="text-emerald-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
              Hình ảnh <ChevronDown size={10} className="ml-0.5" />
            </span>
          </button>
          
          <div className="flex flex-col space-y-0.5 pl-1">
            <button
              onClick={onOpenImagePicker}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 text-[10.5px] text-slate-700 font-medium"
              title="Kho ảnh học liệu"
            >
              <Library size={12} className="text-amber-600" />
              <span>Kho ảnh</span>
            </button>
            <button
              onClick={onOpenImagePicker}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 text-[10.5px] text-slate-700 font-medium"
              title="Tải ảnh lên"
            >
              <Upload size={12} className="text-blue-600" />
              <span>Tải lên</span>
            </button>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Hình ảnh</span>
      </div>

      {/* 4. Group: Camera (Cameo) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onToggleCameo}
          className={`flex flex-col items-center justify-center p-1 rounded transition w-13 h-[50px] group ${
            hasCameo ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400' : 'hover:bg-slate-200 active:bg-slate-300'
          }`}
          title="Bật camera giáo viên (Cameo) hiển thị trên góc bài giảng"
        >
          <Camera size={23} className={`${hasCameo ? 'text-amber-600' : 'text-purple-600'} group-hover:scale-105 transition`} />
          <span className="text-[10.5px] leading-tight font-medium mt-0.5">
            {hasCameo ? 'Đang bật' : 'Cameo'}
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Máy ảnh</span>
      </div>

      {/* 5. Group: Minh họa (Illustrations) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenShapePicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
            title="Chèn hình dạng: chữ nhật, mũi tên, ngôi sao, hình tròn..."
          >
            <Shapes size={22} className="text-cyan-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
              Hình dạng <ChevronDown size={10} className="ml-0.5" />
            </span>
          </button>

          <button
            onClick={onOpenIconPicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
            title="Biểu tượng minh họa môn học"
          >
            <Smile size={22} className="text-indigo-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Biểu tượng
            </span>
          </button>

          <button
            onClick={onOpenSmartArtPicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group"
            title="Sơ đồ SmartArt (Quy trình, Phân cấp, Thẻ nội dung)"
          >
            <Network size={22} className="text-emerald-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              SmartArt
            </span>
          </button>

          <button
            onClick={onOpenChartPicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
            title="Biểu đồ cột, đường, tròn"
          >
            <BarChart3 size={22} className="text-amber-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Biểu đồ
            </span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Hình minh họa</span>
      </div>

      {/* 6. Group: Liên kết & Thu phóng (Links & Zoom) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onAddTextBox}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-11 h-[50px] group"
            title="Thu phóng slide"
          >
            <ZoomIn size={20} className="text-blue-500 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Zoom
            </span>
          </button>

          <button
            onClick={onAddTextBox}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-11 h-[50px] group"
            title="Tạo liên kết chuyển trang hoặc liên kết web"
          >
            <Link2 size={20} className="text-slate-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Liên kết
            </span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Liên kết</span>
      </div>

      {/* 7. Group: Chú thích (Comments) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onAddComment}
          className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
          title="Thêm nhận xét / ghi chú cho học sinh"
        >
          <MessageSquare size={21} className="text-teal-600 group-hover:scale-105 transition" />
          <span className="text-[10.5px] leading-tight font-medium mt-0.5">
            Bình luận
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Nhận xét</span>
      </div>

      {/* 8. Group: Văn bản (Text) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onAddTextBox}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group"
            title="Thêm hộp văn bản để gõ nội dung"
          >
            <div className="p-1 border border-dashed border-slate-600 rounded">
              <Type size={18} className="text-slate-800 group-hover:scale-105 transition" />
            </div>
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Hộp chữ
            </span>
          </button>

          <button
            onClick={onAddWordArt}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group"
            title="WordArt: Tiêu đề nghệ thuật nổi bật"
          >
            <Sparkles size={21} className="text-amber-500 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              WordArt
            </span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Văn bản</span>
      </div>

      {/* 9. Group: Ký hiệu & Công thức Toán (Symbols & Equations) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenMathFormula}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 active:bg-blue-100 transition w-15 h-[50px] group text-blue-700"
            title="Soạn công thức Toán học ngay trên slide hỗ trợ LaTeX ($...$ hoặc $$...$$)"
          >
            <span className="text-lg font-bold font-serif leading-none group-hover:scale-110 transition text-blue-700">
              ∑
            </span>
            <span className="text-[10.5px] leading-tight font-bold mt-0.5 text-blue-800">
              Toán LaTeX
            </span>
          </button>

          <button
            onClick={onOpenSymbolPicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
            title="Chèn ký hiệu toán học và khoa học (π, √, ∑, α, β...)"
          >
            <Omega size={20} className="text-slate-700 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Ký hiệu
            </span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Ký hiệu & Toán</span>
      </div>

      {/* 10. Group: Phương tiện (Media) */}
      <div className="flex flex-col items-center px-2 shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onAddVideo}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
            title="Chèn video minh họa bài giảng"
          >
            <Video size={21} className="text-red-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Video
            </span>
          </button>

          <button
            onClick={onAddAudio}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group"
            title="Chèn âm thanh giảng bài / nhạc nền"
          >
            <Mic size={21} className="text-indigo-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Âm thanh
            </span>
          </button>

          <button
            onClick={() => alert('Chức năng Ghi màn hình: Sẵn sàng ghi lại toàn bộ bài giảng kèm giọng nói của bạn!')}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group"
            title="Ghi lại video bài giảng"
          >
            <MonitorPlay size={21} className="text-emerald-600 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Ghi hình
            </span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Phương tiện</span>
      </div>
    </div>
  );
};
