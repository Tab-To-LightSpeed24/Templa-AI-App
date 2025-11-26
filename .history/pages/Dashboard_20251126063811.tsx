import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../services/storageService';
import { Project, User, DocumentType } from '../types';
import { FileText, Presentation, Plus, Trash2, ArrowRight, Play } from 'lucide-react';
import { Button } from '../components/Button';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const loadProjects = () => {
    setProjects(getProjects(user.id));
  };

  useEffect(() => {
    loadProjects();
  }, [user.id]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(id);
      loadProjects();
    }
  };
  
  const handleQuickPresent = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/editor/${id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Projects</h1>
          <p className="text-slate-400 mt-1">Manage your documents and presentation decks</p>
        </div>
        <Link to="/create">
          <Button icon={<Plus size={18} />} className="shadow-neon-cyan">Create New</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-dark-900/50 rounded-3xl border border-dashed border-dark-800">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500 shadow-inner">
            <FileText size={36} />
          </div>
          <h3 className="text-xl font-semibold text-white">No projects yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-8">
            Get started by creating a new document outline or presentation deck using AI.
          </p>
          <Link to="/create">
            <Button variant="neon">Create your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/editor/${project.id}`)}
              className="group bg-dark-900 border border-dark-800 rounded-2xl p-6 hover:shadow-neon-cyan hover:border-neon-cyan/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] pointer-events-none"></div>

              <div className="flex items-start justify-between mb-5">
                <div className={`p-3 rounded-xl ${project.type === DocumentType.DOCX ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                  {project.type === DocumentType.DOCX ? <FileText size={28} /> : <Presentation size={28} />}
                </div>
                <div className="flex items-center gap-2 relative z-20">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        project.sections.every(s => s.status === 'COMPLETED') 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-slate-700/30 text-slate-400 border-slate-700'
                    }`}>
                        {project.sections.every(s => s.status === 'COMPLETED') ? 'Done' : 'In Progress'}
                    </span>
                    <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors z-30"
                        title="Delete Project"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 truncate pr-2" title={project.title}>{project.title}</h3>
              <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">
                {project.sections.length} {project.type === DocumentType.DOCX ? 'Sections' : 'Slides'} • {project.style?.template || 'Standard'}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-sm font-medium text-neon-cyan group-hover:text-white transition-colors">
                    Open Editor <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
                {project.type === DocumentType.PPTX && (
                    <button 
                        onClick={(e) => handleQuickPresent(e, project.id)}
                        className="p-2 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors relative z-20"
                        title="Present"
                    >
                        <Play size={18} />
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};