import React, { useState, useEffect, useCallback } from 'react';
import { 
  Presentation, 
  Slide, 
  SlideElement, 
  ActiveTab, 
  ViewMode, 
  ShapeType, 
  PresentationTheme 
} from './types/presentation';
import { DEFAULT_PRESENTATION, PRESENTATION_THEMES, LECTURE_LIBRARY } from './data/defaultLectures';
import { TitleBar } from './components/TitleBar';
import { Ribbon } from './components/Ribbon';
import { SlideSidebar } from './components/SlideSidebar';
import { SlideCanvas } from './components/SlideCanvas';
import { NotesPanel } from './components/NotesPanel';
import { StatusBar } from './components/StatusBar';
import { SlideSorterView } from './components/SlideSorterView';
import { SlideShowModal } from './components/SlideShowModal';
import { LectureRepositoryModal } from './components/LectureRepositoryModal';
import { ImportPowerPointModal } from './components/ImportPowerPointModal';
import { 
  TablePickerModal, 
  ShapePickerModal, 
  ImagePickerModal, 
  SmartArtPickerModal, 
  SymbolPickerModal 
} from './components/InsertDialogs';
import { MathFormulaModal } from './components/MathFormulaModal';
import { 
  broadcastPresentationSync, 
  broadcastLibrarySync, 
  subscribeToRealtimeSync, 
  getFormattedTimeString 
} from './utils/realtimeSync';
import { CheckCircle, Info, FileUp } from 'lucide-react';

export default function App() {
  // Load presentation from localStorage or default
  const [presentation, setPresentation] = useState<Presentation>(() => {
    try {
      const saved = localStorage.getItem('kho_bai_giang_active');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved presentation', e);
    }
    return DEFAULT_PRESENTATION;
  });

  const [savedLibrary, setSavedLibrary] = useState<Presentation[]>(() => {
    try {
      const saved = localStorage.getItem('kho_bai_giang_user_saved');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user saved library', e);
    }
    return [];
  });

  const [deletedLibraryIds, setDeletedLibraryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kho_bai_giang_deleted_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading deleted ids', e);
    }
    return [];
  });

  // Real-time synchronization states
  const [currentTime, setCurrentTime] = useState<string>(() => getFormattedTimeString());
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => getFormattedTimeString());
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState<boolean>(false);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Live system clock ticker (ticks every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Multi-tab real-time sync listener via BroadcastChannel
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync(
      (syncedPresentation) => {
        setPresentation((curr) => {
          if (curr.id === syncedPresentation.id) {
            return syncedPresentation;
          }
          return curr;
        });
      },
      (syncedLibrary) => {
        setSavedLibrary(syncedLibrary);
      }
    );
    return () => unsubscribe();
  }, []);

  // History for Undo / Redo
  const [history, setHistory] = useState<Presentation[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Active UI states
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  // Default to 'insert' tab to match user screenshot!
  const [activeTab, setActiveTab] = useState<ActiveTab>('insert');
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  // Default zoom 67% matching user screenshot!
  const [zoomLevel, setZoomLevel] = useState<number>(67);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dialog states
  const [isRepositoryOpen, setIsRepositoryOpen] = useState<boolean>(false);
  const [isImportPptxOpen, setIsImportPptxOpen] = useState<boolean>(false);
  const [pptxInitialFile, setPptxInitialFile] = useState<File | null>(null);
  const [isGlobalDraggingPptx, setIsGlobalDraggingPptx] = useState<boolean>(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState<boolean>(false);
  const [isShapePickerOpen, setIsShapePickerOpen] = useState<boolean>(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);
  const [isSmartArtPickerOpen, setIsSmartArtPickerOpen] = useState<boolean>(false);
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState<boolean>(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false);
  const [mathModalInitialFormula, setMathModalInitialFormula] = useState<string>('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');

  // Global Drag-and-drop listener for PowerPoint files (.pptx, .ppt)
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsGlobalDraggingPptx(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget) {
        setIsGlobalDraggingPptx(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsGlobalDraggingPptx(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt'))) {
        setPptxInitialFile(file);
        setIsImportPptxOpen(true);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Record history when presentation changes
  const updatePresentationWithHistory = useCallback((updater: (prev: Presentation) => Presentation) => {
    setPresentation((prev) => {
      const next = updater(prev);
      setHistory(h => [...h.slice(0, historyIndex + 1), prev]);
      setHistoryIndex(i => i + 1);
      setIsSaved(false);
      return next;
    });
  }, [historyIndex]);

  // Real-time debounced auto-save & synchronization engine
  useEffect(() => {
    if (!isRealtimeEnabled) return;

    setIsRealtimeSyncing(true);
    const timer = setTimeout(() => {
      try {
        // 1. Save active presentation to localStorage
        localStorage.setItem('kho_bai_giang_active', JSON.stringify(presentation));

        // 2. Synchronize in real-time to user saved library if this lecture was saved
        setSavedLibrary((prevLib) => {
          const index = prevLib.findIndex(p => p.id === presentation.id);
          if (index !== -1) {
            const updated = [...prevLib];
            updated[index] = { 
              ...presentation, 
              updatedAt: new Date().toISOString().split('T')[0] 
            };
            localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updated));
            broadcastLibrarySync(updated);
            return updated;
          }
          return prevLib;
        });

        // 3. Broadcast real-time change to other open browser tabs
        broadcastPresentationSync(presentation);

        setLastSavedTime(getFormattedTimeString());
        setIsSaved(true);
      } catch (e) {
        console.error('Real-time sync error', e);
      } finally {
        setIsRealtimeSyncing(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [presentation, isRealtimeEnabled]);

  // Current slide
  const currentSlide = presentation.slides[activeSlideIndex] || presentation.slides[0];
  const currentTheme = PRESENTATION_THEMES.find(t => t.id === presentation.themeId) || PRESENTATION_THEMES[0];
  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId) || null;
  const hasCameo = currentSlide?.elements.some(el => el.type === 'cameo') || false;

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const prevPresentation = history[historyIndex];
      setHistoryIndex(i => i - 1);
      setPresentation(prevPresentation);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextPresentation = history[historyIndex + 1];
      setHistoryIndex(i => i + 1);
      setPresentation(nextPresentation);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        setViewMode('slideshow');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeSlideIndex < presentation.slides.length - 1) {
          e.preventDefault();
          setActiveSlideIndex(i => i + 1);
          setSelectedElementId(null);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeSlideIndex > 0) {
          e.preventDefault();
          setActiveSlideIndex(i => i - 1);
          setSelectedElementId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIndex, presentation.slides.length, selectedElementId, historyIndex, history]);

  // Slide CRUD Actions
  const handleAddSlide = (layout: string = 'title-content') => {
    const newSlideId = `slide-${Date.now()}`;
    let newElements: SlideElement[] = [];

    if (layout === 'title') {
      newElements = [
        {
          id: `el-${Date.now()}-t`,
          type: 'text',
          text: 'TIÊU ĐỀ BÀI GIẢNG',
          fontSize: 42,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          x: 10,
          y: 30,
          width: 80,
          height: 25,
          zIndex: 1
        },
        {
          id: `el-${Date.now()}-sub`,
          type: 'text',
          text: 'Nhập phụ đề hoặc tên giáo viên tại đây',
          fontSize: 20,
          fontFamily: 'Segoe UI',
          color: '#93c5fd',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textDecoration: 'none',
          textAlign: 'center',
          x: 20,
          y: 58,
          width: 60,
          height: 10,
          zIndex: 2
        }
      ];
    } else if (layout === 'title-content') {
      newElements = [
        {
          id: `el-${Date.now()}-hdr`,
          type: 'text',
          text: 'TIÊU ĐỀ NỘI DUNG TRANG',
          fontSize: 32,
          fontFamily: 'Segoe UI',
          color: '#fbbf24',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          x: 8,
          y: 8,
          width: 84,
          height: 12,
          zIndex: 1
        },
        {
          id: `el-${Date.now()}-body`,
          type: 'text',
          text: '• Ý chính thứ nhất của bài giảng\n• Ý chính thứ hai kèm ví dụ minh họa\n• Các lưu ý quan trọng cần ghi nhớ',
          fontSize: 22,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: 16,
          x: 8,
          y: 24,
          width: 84,
          height: 60,
          zIndex: 2
        }
      ];
    } else if (layout === 'two-column') {
      newElements = [
        {
          id: `el-${Date.now()}-hdr`,
          type: 'text',
          text: 'SO SÁNH HAI KHÁI NIỆM',
          fontSize: 30,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          x: 8,
          y: 8,
          width: 84,
          height: 10,
          zIndex: 1
        },
        {
          id: `el-${Date.now()}-col1`,
          type: 'text',
          text: '1. Khái niệm A:\n- Đặc điểm nổi bật\n- Ưu điểm\n- Ứng dụng',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 14,
          x: 8,
          y: 22,
          width: 40,
          height: 64,
          zIndex: 2
        },
        {
          id: `el-${Date.now()}-col2`,
          type: 'text',
          text: '2. Khái niệm B:\n- Đặc điểm đối chiếu\n- Nhược điểm\n- Khác biệt cốt lõi',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 14,
          x: 52,
          y: 22,
          width: 40,
          height: 64,
          zIndex: 3
        }
      ];
    }

    const newSlide: Slide = {
      id: newSlideId,
      title: `Trang chiếu ${presentation.slides.length + 1}`,
      notes: '',
      backgroundColor: currentTheme.slideBg,
      elements: newElements,
      transition: 'fade'
    };

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideIndex(presentation.slides.length);
    setSelectedElementId(null);
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToCopy = presentation.slides[index];
    const newSlide: Slide = {
      ...slideToCopy,
      id: `slide-${Date.now()}`,
      title: `${slideToCopy.title} (Bản sao)`,
      elements: slideToCopy.elements.map(el => ({ ...el, id: `el-${Date.now()}-${Math.random()}` }))
    };

    const newSlides = [...presentation.slides];
    newSlides.splice(index + 1, 0, newSlide);

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (presentation.slides.length <= 1) return;
    const newSlides = presentation.slides.filter((_, i) => i !== index);
    const nextIndex = Math.min(index, newSlides.length - 1);

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlideIndex(nextIndex);
    setSelectedElementId(null);
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    const newSlides = [...presentation.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlideIndex(toIndex);
  };

  // Element CRUD Actions
  const handleUpdateElement = (updated: Partial<SlideElement>) => {
    if (!selectedElementId) return;

    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = slide.elements.map(el => {
        if (el.id === selectedElementId) {
          return { ...el, ...updated } as SlideElement;
        }
        return el;
      });
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
  };

  const handleDeleteElement = () => {
    if (!selectedElementId) return;

    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = slide.elements.filter(el => el.id !== selectedElementId);
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
    setSelectedElementId(null);
  };

  const handleDuplicateElement = () => {
    if (!selectedElement) return;

    const newElement: SlideElement = {
      ...selectedElement,
      id: `el-${Date.now()}`,
      x: Math.min(85, selectedElement.x + 4),
      y: Math.min(85, selectedElement.y + 4),
      zIndex: (selectedElement.zIndex || 1) + 1
    };

    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = [...slide.elements, newElement];
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
    setSelectedElementId(newElement.id);
  };

  const handleBringForward = () => {
    if (!selectedElementId) return;
    handleUpdateElement({ zIndex: (selectedElement?.zIndex || 1) + 1 });
  };

  const handleSendBackward = () => {
    if (!selectedElementId) return;
    handleUpdateElement({ zIndex: Math.max(1, (selectedElement?.zIndex || 1) - 1) });
  };

  // Insert Helpers
  const addElementToCurrentSlide = (newElement: SlideElement) => {
    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = [...slide.elements, newElement];
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
    setSelectedElementId(newElement.id);
  };

  const handleAddTextBox = () => {
    const textEl: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Nhập nội dung văn bản tại đây...',
      fontSize: 22,
      fontFamily: 'Segoe UI',
      color: '#ffffff',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      x: 30,
      y: 40,
      width: 40,
      height: 18,
      zIndex: 10
    };
    addElementToCurrentSlide(textEl);
  };

  const handleAddWordArt = () => {
    const waEl: SlideElement = {
      id: `wa-${Date.now()}`,
      type: 'wordart',
      text: 'TIÊU ĐỀ NGHỆ THUẬT',
      stylePreset: 'golden',
      fontSize: 38,
      x: 20,
      y: 38,
      width: 60,
      height: 20,
      zIndex: 10
    };
    addElementToCurrentSlide(waEl);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    const tableData: string[][] = [];
    const headerRow: string[] = [];
    for (let c = 0; c < cols; c++) {
      headerRow.push(`Cột ${c + 1}`);
    }
    tableData.push(headerRow);

    for (let r = 1; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(`Ô (${r}, ${c + 1})`);
      }
      tableData.push(row);
    }

    const tblEl: SlideElement = {
      id: `table-${Date.now()}`,
      type: 'table',
      rows,
      cols,
      data: tableData,
      headerBgColor: '#0284c7',
      headerTextColor: '#ffffff',
      rowAltColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: '#38bdf8',
      fontSize: 16,
      x: 15,
      y: 25,
      width: 70,
      height: 50,
      zIndex: 10
    };
    addElementToCurrentSlide(tblEl);
  };

  const handleInsertShape = (shapeType: ShapeType) => {
    const shapeEl: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      fillColor: '#0284c7',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      text: shapeType === 'speech-bubble' ? 'Lời thoại...' : '',
      textColor: '#ffffff',
      fontSize: 16,
      x: 35,
      y: 35,
      width: 30,
      height: 25,
      zIndex: 10
    };
    addElementToCurrentSlide(shapeEl);
  };

  const handleInsertImage = (src: string) => {
    const imgEl: SlideElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      src,
      alt: 'Hình ảnh học liệu',
      objectFit: 'cover',
      borderRadius: 8,
      x: 25,
      y: 22,
      width: 50,
      height: 56,
      zIndex: 10
    };
    addElementToCurrentSlide(imgEl);
  };

  const handleInsertSmartArt = (type: 'cards' | 'process') => {
    const smEl: SlideElement = {
      id: `smartart-${Date.now()}`,
      type: 'smartart',
      smartArtType: type,
      items: type === 'cards' ? [
        { id: '1', title: 'Ý chính 1', desc: 'Mô tả chi tiết nội dung 1', color: '#0284c7' },
        { id: '2', title: 'Ý chính 2', desc: 'Mô tả chi tiết nội dung 2', color: '#0d9488' },
        { id: '3', title: 'Ý chính 3', desc: 'Mô tả chi tiết nội dung 3', color: '#d97706' }
      ] : [
        { id: '1', title: 'Bước 1', desc: 'Khởi động', color: '#6366f1' },
        { id: '2', title: 'Bước 2', desc: 'Hình thành kiến thức', color: '#0d9488' },
        { id: '3', title: 'Bước 3', desc: 'Luyện tập', color: '#eab308' },
        { id: '4', title: 'Bước 4', desc: 'Vận dụng', color: '#16a34a' }
      ],
      x: 10,
      y: 26,
      width: 80,
      height: 48,
      zIndex: 10
    };
    addElementToCurrentSlide(smEl);
  };

  const handleInsertChart = () => {
    const chartEl: SlideElement = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      chartType: 'bar',
      title: 'Biểu đồ số liệu khảo sát',
      data: [
        { label: 'Nhóm A', value: 35, color: '#38bdf8' },
        { label: 'Nhóm B', value: 58, color: '#fb923c' },
        { label: 'Nhóm C', value: 82, color: '#34d399' },
        { label: 'Nhóm D', value: 44, color: '#f43f5e' }
      ],
      x: 15,
      y: 22,
      width: 70,
      height: 58,
      zIndex: 10
    };
    addElementToCurrentSlide(chartEl);
  };

  const handleInsertSymbol = (symbol: string) => {
    if (selectedElement && selectedElement.type === 'text') {
      handleUpdateElement({ text: `${selectedElement.text} ${symbol}` });
    } else {
      const symEl: SlideElement = {
        id: `sym-${Date.now()}`,
        type: 'text',
        text: symbol,
        fontSize: 44,
        fontFamily: 'Segoe UI',
        color: '#fbbf24',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        x: 45,
        y: 40,
        width: 15,
        height: 18,
        zIndex: 10
      };
      addElementToCurrentSlide(symEl);
    }
  };

  const handleToggleCameo = () => {
    if (hasCameo) {
      updatePresentationWithHistory(prev => {
        const slides = [...prev.slides];
        const slide = { ...slides[activeSlideIndex] };
        slide.elements = slide.elements.filter(el => el.type !== 'cameo');
        slides[activeSlideIndex] = slide;
        return { ...prev, slides };
      });
    } else {
      const cameoEl: SlideElement = {
        id: `cameo-${Date.now()}`,
        type: 'cameo',
        shape: 'circle',
        showMirror: true,
        x: 76,
        y: 62,
        width: 20,
        height: 32,
        zIndex: 50
      };
      addElementToCurrentSlide(cameoEl);
    }
  };

  const handleAddComment = () => {
    const commentEl: SlideElement = {
      id: `comment-${Date.now()}`,
      type: 'shape',
      shapeType: 'speech-bubble',
      fillColor: '#0f766e',
      strokeColor: '#5eead4',
      strokeWidth: 2,
      text: '💬 Nhận xét: Các em chú ý ghi lại phần này vào vở ghi bài!',
      textColor: '#ffffff',
      fontSize: 16,
      x: 25,
      y: 65,
      width: 50,
      height: 22,
      zIndex: 40
    };
    addElementToCurrentSlide(commentEl);
  };

  const handleAddVideo = () => {
    const videoEl: SlideElement = {
      id: `video-${Date.now()}`,
      type: 'shape',
      shapeType: 'rounded-rect',
      fillColor: '#0f172a',
      strokeColor: '#ef4444',
      strokeWidth: 2,
      text: '🎬 Video Minh Họa Bài Học\n(Bấm để phát video bài giảng)',
      textColor: '#ffffff',
      fontSize: 20,
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      zIndex: 10
    };
    addElementToCurrentSlide(videoEl);
  };

  const handleAddAudio = () => {
    const audioEl: SlideElement = {
      id: `audio-${Date.now()}`,
      type: 'shape',
      shapeType: 'rounded-rect',
      fillColor: '#4338ca',
      strokeColor: '#a5b4fc',
      strokeWidth: 2,
      text: '🔊 Âm Thanh Giảng Bài & Phát Âm Chuẩn',
      textColor: '#ffffff',
      fontSize: 18,
      x: 30,
      y: 40,
      width: 40,
      height: 18,
      zIndex: 10
    };
    addElementToCurrentSlide(audioEl);
  };

  // Math Formula (LaTeX) Handlers
  const handleOpenMathModal = (formula?: string) => {
    if (formula) {
      setMathModalInitialFormula(formula);
    } else if (selectedElement && selectedElement.type === 'text') {
      setMathModalInitialFormula(selectedElement.text || 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    } else {
      setMathModalInitialFormula('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    }
    setIsMathModalOpen(true);
  };

  const handleInsertMathFormula = (formula: string) => {
    if (selectedElement && selectedElement.type === 'text') {
      // If current text has content, decide whether to replace or append
      const existing = selectedElement.text.trim();
      const updatedText = existing && !existing.startsWith('$') ? `${existing}\n${formula}` : formula;
      handleUpdateElement({ text: updatedText });
    } else {
      // Create new clean formula block
      const mathEl: SlideElement = {
        id: `math-${Date.now()}`,
        type: 'text',
        text: formula,
        fontSize: 30,
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        x: 20,
        y: 38,
        width: 60,
        height: 22,
        zIndex: 10
      };
      addElementToCurrentSlide(mathEl);
    }
  };

  // Presentation Management & Library Persistence
  const handleSaveCurrentToLibrary = (asNewCopy: boolean = false) => {
    try {
      let lectureToSave: Presentation = {
        ...presentation,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      if (asNewCopy) {
        lectureToSave = {
          ...lectureToSave,
          id: `lec-user-${Date.now()}`,
          title: `${lectureToSave.title} (Bản sao mới)`
        };
        setPresentation(lectureToSave);
      }

      // 1. Remove from deleted IDs if present so it is never hidden
      setDeletedLibraryIds(prev => {
        const filtered = prev.filter(delId => delId !== lectureToSave.id);
        localStorage.setItem('kho_bai_giang_deleted_ids', JSON.stringify(filtered));
        return filtered;
      });

      // 2. Add / Update in user saved library (at beginning of list)
      setSavedLibrary(prev => {
        const filtered = prev.filter(s => s.id !== lectureToSave.id);
        const updated = [lectureToSave, ...filtered];
        localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updated));
        broadcastLibrarySync(updated);
        return updated;
      });

      // 3. Save active scratchpad
      localStorage.setItem('kho_bai_giang_active', JSON.stringify(lectureToSave));

      setIsSaved(true);
      setLastSavedTime(getFormattedTimeString());
      showToast(`Đã lưu bài giảng "${lectureToSave.title}" vào Kho bài giảng thành công!`);
    } catch (e) {
      console.error('Save error', e);
      showToast('Có lỗi xảy ra khi lưu bài giảng vào Kho');
    }
  };

  const handleManualSave = () => {
    handleSaveCurrentToLibrary(false);
  };

  const handleUpdatePresentationInLibrary = (updated: Presentation) => {
    // 1. Ensure not hidden in deleted IDs
    setDeletedLibraryIds(prev => {
      const filtered = prev.filter(delId => delId !== updated.id);
      localStorage.setItem('kho_bai_giang_deleted_ids', JSON.stringify(filtered));
      return filtered;
    });

    // 2. Update in saved library
    const exists = savedLibrary.some(s => s.id === updated.id);
    let updatedLib: Presentation[];
    if (exists) {
      updatedLib = savedLibrary.map(s => s.id === updated.id ? updated : s);
    } else {
      updatedLib = [updated, ...savedLibrary];
    }
    setSavedLibrary(updatedLib);
    localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updatedLib));
    broadcastLibrarySync(updatedLib);

    // 3. If currently editing this presentation, update active presentation as well!
    if (presentation.id === updated.id) {
      setPresentation(updated);
      localStorage.setItem('kho_bai_giang_active', JSON.stringify(updated));
    }

    showToast(`Đã lưu cập nhật cho bài giảng "${updated.title}"!`);
  };

  const handleDuplicatePresentation = (target: Presentation) => {
    const cloned: Presentation = {
      ...target,
      id: `lec-user-${Date.now()}`,
      title: `${target.title} (Bản sao)`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const updatedLib = [cloned, ...savedLibrary];
    setSavedLibrary(updatedLib);
    localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updatedLib));
    broadcastLibrarySync(updatedLib);
    showToast(`Đã nhân bản bài giảng "${cloned.title}" vào Kho bài giảng của bạn!`);
  };

  const handleDeleteSavedPresentation = (id: string) => {
    const allCombined = [
      ...savedLibrary,
      ...LECTURE_LIBRARY.filter(l => !savedLibrary.some(s => s.id === l.id))
    ];
    const target = allCombined.find(s => s.id === id);

    // 1. Remove from savedLibrary if present
    const updatedLib = savedLibrary.filter(s => s.id !== id);
    setSavedLibrary(updatedLib);
    localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updatedLib));

    // 2. Add to deletedLibraryIds so default sample lectures are also deleted
    const newDeleted = Array.from(new Set([...deletedLibraryIds, id]));
    setDeletedLibraryIds(newDeleted);
    localStorage.setItem('kho_bai_giang_deleted_ids', JSON.stringify(newDeleted));
    broadcastLibrarySync(updatedLib);

    // 3. If active presentation is the one deleted, safely fallback
    if (presentation.id === id) {
      const remaining = allCombined.filter(l => l.id !== id && !newDeleted.includes(l.id));
      const fallback = remaining[0] || DEFAULT_PRESENTATION;
      setPresentation(fallback);
      setActiveSlideIndex(0);
      setSelectedElementId(null);
    }

    showToast(`Đã xóa bài giảng "${target?.title || ''}" khỏi Kho bài giảng.`);
  };

  const handleRestoreDefaultSamples = () => {
    setDeletedLibraryIds([]);
    localStorage.removeItem('kho_bai_giang_deleted_ids');
    showToast('Đã khôi phục lại các bài mẫu mặc định!');
  };

  const handleNewPresentation = () => {
    const blankPresentation: Presentation = {
      id: `lec-user-${Date.now()}`,
      title: 'Bài Giảng Mới Chưa Đặt Tên',
      subject: 'Môn học',
      grade: 'Khối lớp',
      author: 'Giáo viên',
      updatedAt: new Date().toISOString().split('T')[0],
      aspectRatio: '16:9',
      themeId: 'ocean-blue',
      slides: [
        {
          id: `slide-${Date.now()}`,
          title: 'Trang Tiêu Đề',
          notes: '',
          backgroundColor: '#1e5385',
          elements: [
            {
              id: `el-title-${Date.now()}`,
              type: 'text',
              text: 'BẤM ĐỂ NHẬP TIÊU ĐỀ BÀI HỌC',
              fontSize: 44,
              fontFamily: 'Segoe UI',
              color: '#ffffff',
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              x: 10,
              y: 35,
              width: 80,
              height: 25,
              zIndex: 1
            }
          ]
        }
      ]
    };
    setPresentation(blankPresentation);
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setIsRepositoryOpen(false);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presentation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${presentation.title.replace(/\s+/g, '_')}.pptx-json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.slides && Array.isArray(imported.slides)) {
            setPresentation(imported);
            setActiveSlideIndex(0);
            setSelectedElementId(null);
            setIsRepositoryOpen(false);
            alert(`Đã tải bài giảng "${imported.title}" thành công!`);
          }
        } catch (err) {
          alert('Tệp không đúng định dạng bài giảng.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrintSlides = () => {
    window.print();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // PowerPoint Import Handlers
  const handleOpenPptxForEdit = (importedPresentation: Presentation) => {
    setPresentation(importedPresentation);
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setViewMode('normal');
    setIsImportPptxOpen(false);
    setPptxInitialFile(null);
    showToast(`Đã mở bài giảng PowerPoint "${importedPresentation.title}" (${importedPresentation.slides.length} trang) để chỉnh sửa!`);
  };

  const handleOpenPptxForSlideShow = (importedPresentation: Presentation) => {
    setPresentation(importedPresentation);
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setViewMode('slideshow');
    setIsImportPptxOpen(false);
    setPptxInitialFile(null);
    showToast(`Đang trình chiếu bài giảng PowerPoint "${importedPresentation.title}"!`);
  };

  const handleSavePptxToLibrary = (importedPresentation: Presentation) => {
    setSavedLibrary((prev) => {
      const filtered = prev.filter(p => p.id !== importedPresentation.id);
      const updated = [importedPresentation, ...filtered];
      localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updated));
      broadcastLibrarySync(updated);
      return updated;
    });
    setIsImportPptxOpen(false);
    setPptxInitialFile(null);
    showToast(`Đã lưu bài giảng "${importedPresentation.title}" vào Kho bài giảng cá nhân!`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f2f5]">
      {/* 1. Top Title Bar */}
      <TitleBar
        title={presentation.title}
        onUpdateTitle={(title) => updatePresentationWithHistory(prev => ({ ...prev, title }))}
        onSave={handleManualSave}
        isSaved={isSaved}
        isRealtimeSyncing={isRealtimeSyncing}
        lastSavedTime={lastSavedTime}
        currentTime={currentTime}
        isRealtimeEnabled={isRealtimeEnabled}
        onToggleRealtime={() => {
          setIsRealtimeEnabled(prev => !prev);
          showToast(!isRealtimeEnabled ? 'Đã BẬT đồng bộ thời gian thực' : 'Đã TẮT đồng bộ thời gian thực');
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
        onStartSlideShow={() => setViewMode('slideshow')}
        onOpenRepository={() => setIsRepositoryOpen(true)}
        onOpenImportPptx={() => setIsImportPptxOpen(true)}
        onExportJSON={handleExportJSON}
        onPrintSlides={handlePrintSlides}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* 2. Ribbon Menu Tabs and Toolbars */}
      <Ribbon
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        // Home tab
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onDuplicateElement={handleDuplicateElement}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onAddSlide={handleAddSlide}
        onSave={handleManualSave}
        // Insert tab (matching user screenshot)
        onOpenTablePicker={() => setIsTablePickerOpen(true)}
        onOpenImagePicker={() => setIsImagePickerOpen(true)}
        onAddCameo={handleToggleCameo}
        onOpenShapePicker={() => setIsShapePickerOpen(true)}
        onOpenIconPicker={() => setIsShapePickerOpen(true)}
        onOpenSmartArtPicker={() => setIsSmartArtPickerOpen(true)}
        onOpenChartPicker={handleInsertChart}
        onAddTextBox={handleAddTextBox}
        onAddWordArt={handleAddWordArt}
        onOpenMathFormula={() => handleOpenMathModal()}
        onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
        onAddVideo={handleAddVideo}
        onAddAudio={handleAddAudio}
        onAddComment={handleAddComment}
        onToggleCameo={handleToggleCameo}
        hasCameo={hasCameo}
        // Design tab
        currentThemeId={presentation.themeId}
        onSelectTheme={(theme) => updatePresentationWithHistory(prev => ({
          ...prev,
          themeId: theme.id,
          slides: prev.slides.map(s => ({ ...s, backgroundColor: theme.slideBg }))
        }))}
        aspectRatio={presentation.aspectRatio}
        onChangeAspectRatio={(aspectRatio) => updatePresentationWithHistory(prev => ({ ...prev, aspectRatio }))}
        currentSlideBg={currentSlide?.backgroundColor}
        onChangeSlideBg={(color) => {
          updatePresentationWithHistory(prev => {
            const slides = [...prev.slides];
            slides[activeSlideIndex] = { ...slides[activeSlideIndex], backgroundColor: color };
            return { ...prev, slides };
          });
        }}
        // Transitions tab
        currentTransition={currentSlide?.transition}
        onChangeTransition={(trans) => {
          updatePresentationWithHistory(prev => {
            const slides = [...prev.slides];
            slides[activeSlideIndex] = { ...slides[activeSlideIndex], transition: trans };
            return { ...prev, slides };
          });
        }}
        onApplyToAllTransitions={() => {
          const trans = currentSlide?.transition || 'fade';
          updatePresentationWithHistory(prev => ({
            ...prev,
            slides: prev.slides.map(s => ({ ...s, transition: trans }))
          }));
          alert(`Đã áp dụng hiệu ứng "${trans.toUpperCase()}" cho tất cả các trang chiếu!`);
        }}
        // Slide Show tab
        onStartFromBeginning={() => {
          setActiveSlideIndex(0);
          setViewMode('slideshow');
        }}
        onStartFromCurrent={() => setViewMode('slideshow')}
        onPresenterMode={() => setViewMode('slideshow')}
        onTriggerConfetti={() => setViewMode('slideshow')}
        onOpenRepository={() => setIsRepositoryOpen(true)}
        onOpenImportPptx={() => setIsImportPptxOpen(true)}
      />

      {/* 3. Main Body View (Normal Editor or Slide Sorter) */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'sorter' ? (
          <SlideSorterView
            slides={presentation.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={(idx) => setActiveSlideIndex(idx)}
            onAddSlide={() => handleAddSlide()}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onCloseSorter={() => setViewMode('normal')}
            defaultSlideBg={currentTheme.slideBg}
          />
        ) : (
          <>
            {/* Left Sidebar: Slide Thumbnails */}
            <SlideSidebar
              slides={presentation.slides}
              activeSlideIndex={activeSlideIndex}
              onSelectSlide={(idx) => {
                setActiveSlideIndex(idx);
                setSelectedElementId(null);
              }}
              onAddSlide={() => handleAddSlide()}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onMoveSlide={handleMoveSlide}
              aspectRatio={presentation.aspectRatio}
              defaultSlideBg={currentTheme.slideBg}
            />

            {/* Central Work Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <SlideCanvas
                slide={currentSlide}
                defaultSlideBg={currentTheme.slideBg}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
                onEditFormula={(currentText) => handleOpenMathModal(currentText)}
                aspectRatio={presentation.aspectRatio}
                zoomLevel={zoomLevel}
              />

              {/* Bottom Speaker Notes Bar */}
              <NotesPanel
                notes={currentSlide?.notes || ''}
                onChangeNotes={(notes) => {
                  updatePresentationWithHistory(prev => {
                    const slides = [...prev.slides];
                    slides[activeSlideIndex] = { ...slides[activeSlideIndex], notes };
                    return { ...prev, slides };
                  });
                }}
                isOpen={isNotesOpen}
                onToggle={() => setIsNotesOpen(!isNotesOpen)}
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Bottom Status Bar */}
      <StatusBar
        currentSlideIndex={activeSlideIndex}
        totalSlides={presentation.slides.length}
        isNotesOpen={isNotesOpen}
        onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        zoomLevel={zoomLevel}
        onChangeZoom={setZoomLevel}
        onFitToWindow={() => setZoomLevel(67)}
        currentTime={currentTime}
        lastSavedTime={lastSavedTime}
        isRealtimeSyncing={isRealtimeSyncing}
      />

      {/* 5. Fullscreen Presentation Mode Modal */}
      <SlideShowModal
        isOpen={viewMode === 'slideshow'}
        onClose={() => setViewMode('normal')}
        slides={presentation.slides}
        initialSlideIndex={activeSlideIndex}
        aspectRatio={presentation.aspectRatio}
        defaultSlideBg={currentTheme.slideBg}
      />

      {/* 6. Kho Bài Giảng (Repository) Modal with Full Edit & Delete Permissions */}
      <LectureRepositoryModal
        isOpen={isRepositoryOpen}
        onClose={() => setIsRepositoryOpen(false)}
        currentPresentation={presentation}
        onLoadPresentation={(p) => {
          setPresentation(p);
          setActiveSlideIndex(0);
          setSelectedElementId(null);
          showToast(`Đã mở bài giảng "${p.title}"`);
        }}
        onSaveCurrentToLibrary={() => handleSaveCurrentToLibrary(false)}
        onSaveCurrentAsNewCopy={() => handleSaveCurrentToLibrary(true)}
        onNewPresentation={handleNewPresentation}
        onImportJSON={handleImportJSON}
        onOpenImportPptx={() => {
          setIsRepositoryOpen(false);
          setIsImportPptxOpen(true);
        }}
        savedPresentations={savedLibrary}
        onDeleteSavedPresentation={handleDeleteSavedPresentation}
        onUpdatePresentationInLibrary={handleUpdatePresentationInLibrary}
        onDuplicatePresentation={handleDuplicatePresentation}
        deletedLectureIds={deletedLibraryIds}
        onRestoreDefaultSamples={handleRestoreDefaultSamples}
      />

      {/* 6.5. Nhập bài giảng từ PowerPoint (.pptx, .ppt) Modal */}
      <ImportPowerPointModal
        isOpen={isImportPptxOpen}
        onClose={() => {
          setIsImportPptxOpen(false);
          setPptxInitialFile(null);
        }}
        onOpenForEdit={handleOpenPptxForEdit}
        onOpenForSlideShow={handleOpenPptxForSlideShow}
        onSaveToLibrary={handleSavePptxToLibrary}
        initialFile={pptxInitialFile}
      />

      {/* Global Drag-and-drop Overlay */}
      {isGlobalDraggingPptx && (
        <div className="fixed inset-0 z-[999] bg-[#c43e1c]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none transition-all">
          <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl border-4 border-dashed border-[#c43e1c] flex flex-col items-center max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 text-[#c43e1c]">
              <FileUp size={40} className="animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Thả tệp PowerPoint vào đây</h3>
            <p className="text-xs text-slate-500">Hỗ trợ tệp .pptx (chuẩn Office 2007-2024, Google Slides, Canva) để mở, trình chiếu hoặc chỉnh sửa ngay</p>
          </div>
        </div>
      )}

      {/* 7. Dialogs for Insert Ribbon */}
      <TablePickerModal
        isOpen={isTablePickerOpen}
        onClose={() => setIsTablePickerOpen(false)}
        onInsertTable={handleInsertTable}
      />

      <ShapePickerModal
        isOpen={isShapePickerOpen}
        onClose={() => setIsShapePickerOpen(false)}
        onInsertShape={handleInsertShape}
      />

      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onInsertImage={handleInsertImage}
      />

      <SmartArtPickerModal
        isOpen={isSmartArtPickerOpen}
        onClose={() => setIsSmartArtPickerOpen(false)}
        onInsertSmartArt={handleInsertSmartArt}
      />

      <SymbolPickerModal
        isOpen={isSymbolPickerOpen}
        onClose={() => setIsSymbolPickerOpen(false)}
        onInsertSymbol={handleInsertSymbol}
      />

      {/* 8. Math Formula (LaTeX) Modal */}
      <MathFormulaModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onInsertFormula={handleInsertMathFormula}
        initialFormula={mathModalInitialFormula}
      />

      {/* 9. Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-100">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
