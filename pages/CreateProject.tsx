import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewProject } from '../services/storageService';
import { generateOutline, generateTitle } from '../services/geminiService';
import { DocumentType, User } from '../types';
import { Button } from '../components/Button';
import { FileText, Presentation, Wand2, X, GripVertical, Plus, RefreshCcw, Edit2 } from 'lucide-react';

interface CreateProjectProps {
  user: User;
}

export const CreateProject: React.FC<CreateProjectProps> = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Configuration State
  const [type, setType] = useState<DocumentType>(DocumentType.DOCX);
  const [topic, setTopic] = useState('');
  const [generatedTitleStr, setGeneratedTitleStr] = useState('');
  const [sectionCount, setSectionCount] = useState(5);
  
  // Outline State
  const [outline, setOutline] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateOutline = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const [generatedOutline, aiTitle] = await Promise.all([
        generateOutline(topic, type, sectionCount),
        generateTitle(topic)
      ]);
      
      setOutline(generatedOutline);
      setGeneratedTitleStr(aiTitle);
      setStep(2);
    } catch (err) {
      alert('Failed to generate content. Please check your API Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProject = () => {
    if (outline.length === 0) return;
    // Default styles - can be changed in Editor
    const newProject = createNewProject(
      user.id, 
      generatedTitleStr || topic, 
      type, 
      outline, 
      { font: 'Modern', template: 'Minimal' } 
    );
    navigate(`/editor/${newProject.id}`);
  };

  const addSection = () => setOutline([...outline, 'New Section']);
  const removeSection = (index: number) => setOutline(outline.filter((_, i) => i !== index));
  const updateSection = (index: number, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = value;
    setOutline(newOutline);
  };
  
  const moveSection = (index: number, direction: -1 | 1) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === outline.length - 1)) return;
    const newOutline = [...outline];
    const temp = newOutline[index];
    newOutline[index] = newOutline[index + direction];
    newOutline[index + direction] = temp;
    setOutline(newOutline);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white mb-2">Start a New Project</h1>
        <p className="text-slate-400">Define your goals and let AI structure it for you.</p>
      </div>

      {step === 1 && (
        <div className="bg-dark-900 p-8 rounded-2xl shadow-lg border border-dark-800 space-y-8 animate-fade-in">
          
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Format</label>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setType(DocumentType.DOCX)}
                className={`p-6 rounded-xl border flex flex-col items-center gap-4 transition-all duration-300 ${
                  type === DocumentType.DOCX
                    ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan'
                    : 'border-dark-800 bg-dark-950 text-slate-500 hover:border-slate-600 hover:bg-dark-800'
                }`}
              >
                <FileText size={40} />
                <span className="font-bold text-lg">Document</span>
                <span className="text-xs opacity-60">Reports, Articles, Essays</span>
              </button>
              <button
                onClick={() => setType(DocumentType.PPTX)}
                className={`p-6 rounded-xl border flex flex-col items-center gap-4 transition-all duration-300 ${
                  type === DocumentType.PPTX
                    ? 'border-neon-purple bg-neon-purple/10 text-neon-purple shadow-neon-purple'
                    : 'border-dark-800 bg-dark-950 text-slate-500 hover:border-slate-600 hover:bg-dark-800'
                }`}
              >
                <Presentation size={40} />
                <span className="font-bold text-lg">Presentation</span>
                <span className="text-xs opacity-60">Decks, Slides, Pitches</span>
              </button>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              What do you want to create?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe your document topic, audience, and goal..."
              className="w-full px-4 py-4 bg-dark-950 border border-dark-800 rounded-xl text-white focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan outline-none min-h-[120px] text-lg"
            />
          </div>

          {/* Sections Slider */}
          <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
               <label className="block text-sm font-medium text-slate-300 mb-4">
                 Approximate Length ({type === DocumentType.DOCX ? 'Sections' : 'Slides'}): <span className="text-neon-cyan font-bold text-lg ml-1">{sectionCount}</span>
               </label>
               <input 
                  type="range" 
                  min="3" 
                  max="15" 
                  value={sectionCount} 
                  onChange={(e) => setSectionCount(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer"
               />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleGenerateOutline}
              disabled={!topic}
              isLoading={isGenerating}
              size="lg"
              className="w-full md:w-auto shadow-neon-cyan"
              icon={<Wand2 size={18} />}
            >
              Generate Structure
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-dark-900 p-8 rounded-2xl shadow-lg border border-dark-800 space-y-6 animate-fade-in">
          
          {/* Title Editor */}
          <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 border-l-4 border-l-neon-cyan">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Project Title
              </label>
              <div className="flex items-center gap-2">
                  <Edit2 size={18} className="text-neon-cyan" />
                  <input 
                      type="text"
                      value={generatedTitleStr}
                      onChange={(e) => setGeneratedTitleStr(e.target.value)}
                      className="w-full bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-neon-cyan transition-colors"
                  />
              </div>
          </div>

          <div className="flex items-center justify-between border-b border-dark-800 pb-4">
            <h2 className="text-xl font-semibold text-white">
              Refine Structure
            </h2>
            <div className="flex gap-2">
                 <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleGenerateOutline} 
                    isLoading={isGenerating}
                    icon={<RefreshCcw size={14} />}
                >
                    Try Again
                </Button>
                <Button variant="neon" size="sm" onClick={() => addSection()} icon={<Plus size={16} /> as any}>
                Add Item
                </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {outline.map((item, index) => (
              <div key={index} className="flex items-center gap-4 group bg-dark-950 p-3 rounded-lg border border-dark-800 hover:border-slate-600 transition-colors">
                <div className="text-slate-600 cursor-move hover:text-white">
                  <GripVertical size={20} />
                </div>
                <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-sm font-bold text-neon-cyan flex-shrink-0">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateSection(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent border-b border-transparent focus:border-neon-cyan outline-none text-slate-200"
                />
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => moveSection(index, -1)}
                     disabled={index === 0}
                     className="p-2 text-slate-500 hover:text-neon-cyan disabled:opacity-30"
                   >
                     ▲
                   </button>
                   <button 
                     onClick={() => moveSection(index, 1)}
                     disabled={index === outline.length - 1}
                     className="p-2 text-slate-500 hover:text-neon-cyan disabled:opacity-30"
                   >
                     ▼
                   </button>
                   <button
                      onClick={() => removeSection(index)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-950/50 rounded-lg ml-2"
                    >
                      <X size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6 border-t border-dark-800">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleCreateProject} size="lg" className="shadow-neon-cyan">
              Launch Editor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};