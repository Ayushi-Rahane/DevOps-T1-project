import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Eye, Tag, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComplaintCard = ({ complaint, isAdminView = false }) => {
  const { id, title, description, status, visibility, category, date, author } = complaint;
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAdminView) navigate(`/admin/complaint/${id}`);
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':     return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'in progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'resolved':    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:            return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':     return <Clock className="w-3.5 h-3.5 mr-1.5" />;
      case 'in progress': return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
      case 'resolved':    return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div
      data-testid="complaint-card"
      onClick={handleClick}
      className={`bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl transition-all duration-300 shadow-lg mb-4 ${
        isAdminView
          ? 'cursor-pointer hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]'
          : 'hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {isAdminView && (
          <span className="text-xs text-blue-400/70 border border-blue-500/20 rounded-lg px-2 py-1 ml-3 whitespace-nowrap shrink-0">
            View Details →
          </span>
        )}
      </div>

      <p className="text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed">{description}</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          {status}
        </span>
        <span className="flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          {visibility}
        </span>
        <span className="flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-pink-500/10 text-pink-300 border border-pink-500/20">
          <Tag className="w-3.5 h-3.5 mr-1.5" />
          {category}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
        <div className="flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          {date}
        </div>
        <div className="flex items-center font-medium">
          <User className="w-3.5 h-3.5 mr-1.5" />
          By: {author}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;