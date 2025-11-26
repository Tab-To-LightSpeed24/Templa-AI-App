
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, saveProject } from '../services/storageService';
import { generateSectionContent, refineText, applyLayout } from '../services/geminiService';
import { exportDocument } from '../services/exportService';
import { Project, Section, SectionStatus, DocumentType, ProjectStyle } from '../types';
import { Button } from '../components/Button';
import { 
  ArrowLeft, Download, RefreshCw, Wand2, CheckCircle,
  Save, Play, X, ChevronRight, ChevronLeft,
  Palette, Undo, Send, BarChart, Image as ImageIcon,
  Workflow, List, Grid, ThumbsUp, ThumbsDown, StickyNote,
  Bold, Italic, Heading1, Heading2, ListOrdered, Table, Edit3, ChevronDown, AlignCenter, LayoutTemplate, Sparkles
} from 'lucide-react';

// --- Components ---

const DesignModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    style: ProjectStyle; 
    onUpdate: (s: Partial<ProjectStyle>) => void 
}> = ({ isOpen, onClose, style, onUpdate }) => {
    if (!isOpen) return null;
    
    const fonts = ['Modern', 'Clean', 'Classic', 'Formal', 'Display', 'Handwriting'];
    const themes = ['Minimal', 'Corporate', 'Executive', 'Paper', 'Vibrant', 'Ocean', 'Dark'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Design Settings</h3>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Typography</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {fonts.map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => onUpdate({ font: f as any })}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${style.font === f ? 'bg-neon-cyan text-dark-950 border-neon-cyan font-bold' : 'bg-dark-950 border-dark-800 text-slate-300 hover:border-slate-600'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visual Theme</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {themes.map(t => (
                                <button 
                                    key={t} 
                                    onClick={() => onUpdate({ template: t as any })}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${style.template === t ? 'bg-neon-purple text-white border-neon-purple font-bold' : 'bg-dark-950 border-dark-800 text-slate-300 hover:border-slate-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                    <Button onClick={onClose} variant="primary">Apply Changes</Button>
                </div>
            </div>
        </div>
    );
};

const VisualRenderer: React.FC<{ content: string; isSlide: boolean }> = ({ content, isSlide }) => {
  let layout = 'STANDARD';
  if (content.includes('[LAYOUT: TIMELINE]')) layout = 'TIMELINE';
  else if (content.includes('[LAYOUT: WORKFLOW]')) layout = 'WORKFLOW';
  else if (content.includes('[LAYOUT: GRID]')) layout = 'GRID';
  else if (content.includes('[LAYOUT: CENTERED]')) layout = 'CENTERED';
  else if (content.includes('[LAYOUT: TABLE]')) layout = 'TABLE';

  // Cleaning text for display
  const cleanContent = content
    .replace(/\[LAYOUT:.*?\]/gi, '')
    .replace(/\[CHART:.*?\]/gi, '')
    .replace(/\[IMAGE:.*?\]/gi, '')
    .trim();

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-bold text-current">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
  };

  const renderTextContent = (text: string) => {
    if (!text.trim()) return null;
    
    const lines = text.split('\n')
        .filter(l => l.trim())
        .map(l => l.replace(/^[-*•#]+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim());

    const itemCount = lines.length;
    let textSizeClass = "text-lg";
    let spacingClass = "space-y-3";
    
    if (isSlide) {
        if (itemCount <= 3) { textSizeClass = "text-2xl md:text-3xl"; spacingClass = "space-y-6 md:space-y-8"; }
        else if (itemCount <= 5) { textSizeClass = "text-xl md:text-2xl"; spacingClass = "space-y-4 md:space-y-6"; }
    }

    if (layout === 'TIMELINE') {
        return (
            <div className="flex flex-col h-full justify-center py-4 w-full">
                <div className={`relative border-l-4 border-current ml-4 md:ml-8 ${spacingClass}`}>
                    {lines.map((line, i) => (
                        <div key={i} className="relative pl-6 md:pl-8">
                            <div className="absolute -left-[11px] top-1.5 w-5 h-5 bg-current rounded-full border-4 border-dark-950"></div>
                            <div className="bg-white/5 p-3 md:p-4 rounded-lg border border-white/10">
                                <p className={`${textSizeClass} font-medium`}>{parseBold(line)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (layout === 'GRID') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-center py-4 w-full">
                {lines.map((line, i) => (
                    <div key={i} className="bg-white/5 p-4 md:p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-start h-full">
                        <div className="w-8 h-8 rounded-full bg-current text-dark-950 flex items-center justify-center font-bold mb-3">{i+1}</div>
                        <p className={`${textSizeClass} font-medium leading-relaxed`}>{parseBold(line)}</p>
                    </div>
                ))}
            </div>
        );
    }

    if (layout === 'CENTERED') {
        return (
            <div className={`flex flex-col items-center justify-center h-full text-center ${spacingClass} py-4 px-4 w-full`}>
                 {lines.map((line, i) => (
                    <p key={i} className={`max-w-4xl ${i===0 ? 'text-3xl md:text-5xl font-bold leading-tight' : 'text-xl md:text-3xl opacity-90 leading-relaxed'}`}>
                        {parseBold(line)}
                    </p>
                 ))}
            </div>
        );
    }

    // Standard / Fallback
    const renderedElements: React.ReactNode[] = [];
    text.split('\n').forEach((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        const cleanText = trimmed.replace(/^[-*•#]+\s*/, '');
        
        if (trimmed.startsWith('## ')) renderedElements.push(<h2 key={i} className="text-2xl font-bold mt-4 mb-2">{cleanText}</h2>);
        else if (trimmed.startsWith('### ')) renderedElements.push(<h3 key={i} className="text-xl font-bold opacity-80 mt-2 mb-1">{cleanText}</h3>);
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             renderedElements.push(<div key={i} className="flex gap-3 ml-2 mb-2 items-start"><span className="opacity-100 mt-2 w-1.5 h-1.5 rounded-full bg-current shrink-0"></span><span className={`opacity-90 leading-relaxed ${textSizeClass}`}>{parseBold(cleanText)}</span></div>);
        } else {
            renderedElements.push(<p key={i} className={`mb-2 leading-relaxed opacity-90 ${textSizeClass}`}>{parseBold(cleanText)}</p>);
        }
    });

    return <div className="w-full h-full flex flex-col justify-center">{renderedElements}</div>;
  };

  return <div className="w-full h-full">{renderTextContent(content)}</div>;
};

const SectionEditor: React.FC<{
  content: string;
  onChange: (val: string) => void;
  onClose: () => void;
}> = ({ content, onChange, onClose }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end);
      onChange(newText);
  };

  return (
      <div className="w-full animate-fade-in h-full flex flex-col">
          <div className="bg-dark-800/50 border-b border-dark-700 p-2 flex items-center gap-2">
              <button onClick={() => insertText('**', '**')} className="p-1.5 hover:bg-white/10 rounded"><Bold size={16} /></button>
              <button onClick={() => insertText('*', '*')} className="p-1.5 hover:bg-white/10 rounded"><Italic size={16} /></button>
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              <button onClick={() => insertText('## ')} className="p-1.5 hover:bg-white/10 rounded"><Heading1 size={16} /></button>
              <button onClick={() => insertText('- ')} className="p-1.5 hover:bg-white/10 rounded"><List size={16} /></button>
              <div className="flex-1"></div>
              <button onClick={onClose} className="bg-neon-cyan text-dark-950 px-3 py-1 rounded text-xs font-bold">Done</button>
          </div>
          <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 w-full bg-transparent outline-none p-4 font-mono text-sm resize-none"
          />
      </div>
  );
};

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [refineInput, setRefineInput] = useState<Record<string, string>>({});
  
  // UI State
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState(0);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (id) {
      const found = getProjectById(id);
      if (found) {
        setProject(found);
        if (!activeSectionId && found.sections.length > 0) setActiveSectionId(found.sections[0].id);
      } else navigate('/');
    }
  }, [id, navigate]);

  const save = useCallback(() => { if (project) saveProject(project); }, [project]);
  useEffect(() => { const interval = setInterval(save, 30000); return () => clearInterval(interval); }, [save]);

  // Scroll Spy
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('data-section-id');
                if (id) setActiveSectionId(id);
            }
        });
    }, { threshold: 0.5 });
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el as Element); });
    return () => observer.disconnect();
  }, [project?.sections.length]);

  const scrollToSection = (sid: string) => {
      sectionRefs.current[sid]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveSectionId(sid);
  };

  const updateSection = (sid: string, updates: Partial<Section>) => {
    setProject(prev => {
        if (!prev) return null;
        return {
            ...prev,
            sections: prev.sections.map(s => s.id === sid ? { ...s, ...updates } : s)
        };
    });
  };

  const handleGenerate = async (section: Section) => {
      setLoadingMap(prev => ({ ...prev, [section.id]: true }));
      try {
          const content = await generateSectionContent(project!.title, section.title, project!.type);
          updateSection(section.id, { content, status: SectionStatus.COMPLETED, history: [...section.history, content] });
      } finally { setLoadingMap(prev => ({ ...prev, [section.id]: false })); }
  };

  const handleRefine = async (section: Section) => {
      const prompt = refineInput[section.id];
      if (!prompt || !section.content) return;
      
      setLoadingMap(prev => ({ ...prev, [section.id]: true }));
      try {
          const newContent = await refineText(section.content, prompt);
          updateSection(section.id, { content: newContent, history: [...section.history, section.content] }); // Push OLD content to history
          setRefineInput(prev => ({ ...prev, [section.id]: '' }));
      } finally { setLoadingMap(prev => ({ ...prev, [section.id]: false })); }
  };

  const handleUndo = (section: Section) => {
      if (section.history.length === 0) return;
      const prevContent = section.history[section.history.length - 1];
      const newHistory = section.history.slice(0, -1);
      updateSection(section.id, { content: prevContent, history: newHistory });
  };

  if (!project) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  // Dynamic Classes
  const getThemeClasses = (template: string) => {
      const map: any = {
          'Minimal': 'bg-white text-slate-900',
          'Corporate': 'bg-slate-50 text-slate-800 border-t-8 border-blue-700',
          'Executive': 'bg-[#0f172a] text-slate-200 border border-slate-700',
          'Paper': 'bg-[#fdfbf7] text-[#2c2c2c] shadow-md',
          'Vibrant': 'bg-[#111827] text-white border-l-8 border-pink-500',
          'Ocean': 'bg-[#f0f9ff] text-[#0c4a6e]',
          'Dark': 'bg-black text-gray-200 border border-green-500'
      };
      return map[template] || map['Minimal'];
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden relative">
        <DesignModal 
            isOpen={showDesignModal} 
            onClose={() => setShowDesignModal(false)} 
            style={project.style} 
            onUpdate={(s) => setProject(p => p ? { ...p, style: { ...p.style, ...s } } : null)}
        />

        {/* Top Bar */}
        <div className="h-16 border-b border-dark-800 flex items-center justify-between px-6 bg-dark-900 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft size={18}/></Button>
                <div>
                    <h1 className="font-bold text-white text-lg truncate max-w-md">{project.title}</h1>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{project.type} • {project.sections.length} items</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDesignModal(true)} icon={<Palette size={16} />}>Design</Button>
                {project.type === DocumentType.PPTX && (
                    <Button variant="outline" size="sm" onClick={() => setShowPresentation(true)} icon={<Play size={16} />}>Present</Button>
                )}
                <Button variant="neon" size="sm" onClick={() => exportDocument(project)} icon={<Download size={16} />}>Export</Button>
                <Button variant="primary" size="sm" onClick={save} icon={<Save size={16} />}>Save</Button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Outline Sidebar */}
            <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col shrink-0 hidden md:flex">
                <div className="p-4 overflow-y-auto flex-1 space-y-1">
                    {project.sections.map((s, i) => (
                        <button 
                            key={s.id} 
                            onClick={() => scrollToSection(s.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-all ${activeSectionId === s.id ? 'bg-neon-cyan/10 text-neon-cyan font-medium' : 'text-slate-400 hover:bg-dark-800'}`}
                        >
                            <span className="text-xs opacity-50 w-4">{i+1}</span>
                            <span className="truncate">{s.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editor Canvas */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-dark-950 p-4 md:p-12 space-y-12 scroll-smooth relative">
                {project.sections.map((section) => (
                    <div 
                        key={section.id} 
                        ref={el => sectionRefs.current[section.id] = el} 
                        data-section-id={section.id} 
                        className="flex flex-col items-center w-full"
                    >
                        <div className={`
                            relative transition-all duration-300 shadow-2xl w-full max-w-5xl group
                            ${project.type === DocumentType.PPTX ? 'aspect-video rounded-xl p-8 md:p-12 flex flex-col overflow-hidden' : 'min-h-[800px] rounded-sm p-12 md:p-16'} 
                            ${getThemeClasses(project.style.template)}
                            ${activeSectionId === section.id ? 'ring-2 ring-neon-cyan/50 scale-[1.01]' : 'opacity-90'}
                        `}>
                            {loadingMap[section.id] ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                                    <RefreshCw className="animate-spin text-neon-cyan mb-2" size={32} />
                                    <p className="text-sm font-bold uppercase tracking-widest">Processing...</p>
                                </div>
                            ) : null}

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-current/20">
                                <h2 className="text-3xl font-bold truncate">{section.title}</h2>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {section.history.length > 0 && (
                                        <button onClick={() => handleUndo(section)} title="Undo" className="p-2 hover:bg-black/10 rounded-full"><Undo size={16} /></button>
                                    )}
                                    <button onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)} title="Edit Manually" className="p-2 hover:bg-black/10 rounded-full"><Edit3 size={16} /></button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 relative">
                                {editingSectionId === section.id ? (
                                    <SectionEditor 
                                        content={section.content} 
                                        onChange={(val) => updateSection(section.id, { content: val })} 
                                        onClose={() => setEditingSectionId(null)} 
                                    />
                                ) : (
                                    section.content ? (
                                        <div onClick={() => setEditingSectionId(section.id)} className="h-full cursor-text">
                                            <VisualRenderer content={section.content} isSlide={project.type === DocumentType.PPTX} />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                                            <Wand2 size={48} className="mb-4" />
                                            <Button variant="secondary" onClick={() => handleGenerate(section)}>Generate Content</Button>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Footer / Refinement Bar */}
                            <div className="mt-8 pt-4 border-t border-current/10">
                                <div className="flex flex-col gap-3">
                                    {/* AI Input */}
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="w-full bg-black/5 border border-black/10 rounded-lg pl-10 pr-12 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 ring-neon-cyan/50 transition-all"
                                            placeholder="Ask AI to refine this section... (e.g. 'Make shorter', 'Add a table')"
                                            value={refineInput[section.id] || ''}
                                            onChange={(e) => setRefineInput(prev => ({ ...prev, [section.id]: e.target.value }))}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRefine(section)}
                                        />
                                        <Sparkles size={16} className="absolute left-3 top-3 opacity-50" />
                                        <button 
                                            onClick={() => handleRefine(section)}
                                            disabled={!refineInput[section.id]}
                                            className="absolute right-2 top-2 p-1 bg-neon-cyan text-white rounded hover:scale-105 transition-transform disabled:opacity-0"
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>

                                    {/* Meta Controls */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => updateSection(section.id, { feedback: section.feedback === 'like' ? null : 'like' })}
                                                className={`p-1.5 rounded ${section.feedback === 'like' ? 'text-green-600 bg-green-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            ><ThumbsUp size={14} /></button>
                                            <button 
                                                onClick={() => updateSection(section.id, { feedback: section.feedback === 'dislike' ? null : 'dislike' })}
                                                className={`p-1.5 rounded ${section.feedback === 'dislike' ? 'text-red-600 bg-red-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            ><ThumbsDown size={14} /></button>
                                        </div>
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={() => setActiveNoteId(activeNoteId === section.id ? null : section.id)}
                                                className={`flex items-center gap-1 text-xs font-medium ${section.notes ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <StickyNote size={14} /> {section.notes ? 'Edit Note' : 'Add Note'}
                                            </button>
                                            {activeNoteId === section.id && (
                                                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white shadow-xl border rounded-xl p-2 z-50 animate-fade-in">
                                                    <textarea 
                                                        className="w-full h-24 p-2 text-sm bg-slate-50 rounded border-0 focus:ring-0 text-slate-800 resize-none"
                                                        placeholder="Private notes..."
                                                        value={section.notes || ''}
                                                        onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                                                        autoFocus
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="h-32"></div>
            </div>
        </div>
    </div>
  );
};
