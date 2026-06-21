import React, { useState, useRef, useMemo } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  FileText as FileIcon,
  Search,
  Filter,
  X,
  FileImage,
  FileArchive,
  File,
  FolderOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Document type definition
interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

// File type information
interface FileTypeInfo {
  extension: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const getFileTypeInfo = (fileName: string): FileTypeInfo => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const fileTypes: Record<string, FileTypeInfo> = {
    // Images
    jpg: { extension: 'jpg', icon: FileImage, color: 'text-blue-500', category: 'image' },
    jpeg: { extension: 'jpeg', icon: FileImage, color: 'text-blue-500', category: 'image' },
    png: { extension: 'png', icon: FileImage, color: 'text-blue-500', category: 'image' },
    gif: { extension: 'gif', icon: FileImage, color: 'text-blue-500', category: 'image' },
    svg: { extension: 'svg', icon: FileImage, color: 'text-blue-500', category: 'image' },
    
    // Documents
    pdf: { extension: 'pdf', icon: FileIcon, color: 'text-red-500', category: 'document' },
    doc: { extension: 'doc', icon: FileIcon, color: 'text-blue-600', category: 'document' },
    docx: { extension: 'docx', icon: FileIcon, color: 'text-blue-600', category: 'document' },
    txt: { extension: 'txt', icon: FileIcon, color: 'text-gray-500', category: 'document' },
    
    // Spreadsheets
    xls: { extension: 'xls', icon: FileIcon, color: 'text-green-600', category: 'spreadsheet' },
    xlsx: { extension: 'xlsx', icon: FileIcon, color: 'text-green-600', category: 'spreadsheet' },
    csv: { extension: 'csv', icon: FileIcon, color: 'text-green-600', category: 'spreadsheet' },
    
    // Archives
    zip: { extension: 'zip', icon: FileArchive, color: 'text-yellow-600', category: 'archive' },
    rar: { extension: 'rar', icon: FileArchive, color: 'text-yellow-600', category: 'archive' },
    '7z': { extension: '7z', icon: FileArchive, color: 'text-yellow-600', category: 'archive' },
  };
  
  return fileTypes[extension] || { extension, icon: File, color: 'text-gray-500', category: 'other' };
};

const Documents: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useDocuments();
  const { t } = useTranslation();
  
  // State management
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) {
      showToast('❌ ' + t('select_file'));
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(selectedFile);
      addDocument({
        title,
        description,
        fileName: selectedFile.name,
        fileUrl,
      });

      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setShowForm(false);
      setUploadProgress(0);
      setIsUploading(false);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      showToast('✅ ' + t('save_success'));
      clearInterval(interval);
    }, 1000);
  };

  // Handle file preview
  const handlePreview = (doc: Document) => {
    if (doc.fileName.toLowerCase().endsWith('.pdf')) {
      window.open(doc.fileUrl, '_blank');
    } else {
      window.open(doc.fileUrl, '_blank');
    }
  };

  // Handle file download
  const handleDownload = (doc: Document) => {
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`📥 ${t('download_success')}`);
  };

  // Handle delete confirmation
  const handleDelete = (id: string) => {
    deleteDocument(id);
    setShowDeleteConfirm(null);
    showToast('🗑️ ' + t('delete_success'));
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];
    
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => {
        const fileType = getFileTypeInfo(doc.fileName);
        return fileType.category === categoryFilter;
      });
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });
    
    return filtered;
  }, [documents, searchTerm, categoryFilter, sortBy, sortOrder]);

  // Get statistics
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileName.length || 0), 0);
    const recentDocs = documents.filter(doc => {
      const daysOld = (new Date().getTime() - new Date(doc.uploadDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysOld <= 7;
    }).length;
    
    const categories = {
      image: documents.filter(doc => getFileTypeInfo(doc.fileName).category === 'image').length,
      document: documents.filter(doc => getFileTypeInfo(doc.fileName).category === 'document').length,
      spreadsheet: documents.filter(doc => getFileTypeInfo(doc.fileName).category === 'spreadsheet').length,
      archive: documents.filter(doc => getFileTypeInfo(doc.fileName).category === 'archive').length,
      other: documents.filter(doc => getFileTypeInfo(doc.fileName).category === 'other').length,
    };
    
    return { totalDocs, totalSize, recentDocs, categories };
  }, [documents]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('documents')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('documents_subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary flex items-center gap-2"
          aria-label="Add new document"
        >
          <Upload className="w-4 h-4" />
          {showForm ? t('close') : t('upload_document')}
        </button>
      </div>

      {/* Statistics Cards */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('total_documents')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDocs}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('new_documents')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.recentDocs}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('active_categories')}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Object.values(stats.categories).filter(v => v > 0).length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('total_size')}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalSize > 1024 ? `${(stats.totalSize / 1024).toFixed(1)} KB` : `${stats.totalSize} B`}
            </p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="card p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('upload_document')}</h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('document_title')} <span className="text-red-500">*</span>
              </label>
              <input
                id="document-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Tax Document, Invoice, etc."
                required
                aria-label="Document title"
              />
            </div>
            
            <div>
              <label htmlFor="document-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('description')}
              </label>
              <textarea
                id="document-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={3}
                placeholder="Brief description of the document (optional)"
                aria-label="Document description"
              />
            </div>
            
            <div>
              <label htmlFor="document-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('file')} <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  id="document-file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  required
                  aria-label="Select file"
                />
                <label htmlFor="document-file" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileIcon className="w-12 h-12 text-primary-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-red-500 text-sm hover:text-red-600"
                      >
                        {t('change')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('click_or_drag')}
                      </p>
                      <p className="text-xs text-gray-500">{t('file_types_allowed')}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('uploading')}...</span>
                  <span className="text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                className="btn btn-primary flex-1"
                disabled={isUploading}
                aria-label="Save document"
              >
                {isUploading ? t('uploading') : t('save')}
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                className="btn btn-secondary"
                aria-label="Cancel"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      {documents.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_documents')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                aria-label="Search documents"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-40"
              aria-label="Category filter"
            >
              <option value="all">{t('all_documents')}</option>
              <option value="image">{t('images')}</option>
              <option value="document">{t('documents_label')}</option>
              <option value="spreadsheet">{t('spreadsheets')}</option>
              <option value="archive">{t('archives')}</option>
              <option value="other">{t('other')}</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              className="input w-40"
              aria-label="Sort by"
            >
              <option value="date">{t('sort_by_date')}</option>
              <option value="name">{t('sort_by_name')}</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary flex items-center gap-2"
              aria-label="Toggle sort order"
            >
              <Filter className="w-4 h-4" />
              {sortOrder === 'asc' ? t('ascending') : t('descending')}
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <FolderOpen className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{t('no_documents')}</p>
              <p className="text-sm text-gray-400">{t('create_first_document')}</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('upload_document')}
              </button>
            </div>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const fileType = getFileTypeInfo(doc.fileName);
            const IconComponent = fileType.icon;
            
            return (
              <div key={doc.id} className="card p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 bg-opacity-10 rounded-lg ${fileType.color.replace('text', 'bg')}/10`}>
                      <IconComponent className={`w-6 h-6 ${fileType.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate" title={doc.title}>
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(doc.uploadDate).toLocaleDateString('en-US')}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{doc.fileName}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      aria-label={`Preview ${doc.title}`}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      aria-label={`Download ${doc.title}`}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(doc.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Delete ${doc.title}`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {doc.description && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {doc.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    fileType.category === 'image' ? 'bg-blue-100 text-blue-700' :
                    fileType.category === 'document' ? 'bg-red-100 text-red-700' :
                    fileType.category === 'spreadsheet' ? 'bg-green-100 text-green-700' :
                    fileType.category === 'archive' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {fileType.extension.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('delete_document')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('confirm_delete_document')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;