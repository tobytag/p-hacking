import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Database,
    Upload,
    FileText,
    Users,
    BookOpen,
    Link as LinkIcon,
    BarChart,
    Search,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Download,
    Trash2,
    Edit2,
    MoreVertical,
    ClipboardList,
    Landmark,
    Binary,
    Plus,
    X,
    Eye,
    ExternalLink,
    Tag,
    GraduationCap,
    Award,
    User,
    Percent,
    Briefcase,
    Save,
    XCircle,
    FileDown,
    TrendingUp,
    PieChart,
    Activity,
    AlignLeft,
    DollarSign
} from 'lucide-react';

import { slugify } from '../utils/slugify';
import { parseCSV } from '../utils/csvParser';
import Card from './ui/Card';
import MetricCard from './ui/MetricCard';
import SimplePieChart from './ui/SimplePieChart';
import Chip from './ui/Chip';
import Modal from './ui/Modal';
import ConfirmModal from './ui/ConfirmModal';
import RowActions from './ui/RowActions';
import TableView from './ui/TableView';
import ToastContainer, { useToast } from './ui/ToastContainer';
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Success</h3>
                    <p className="text-sm text-slate-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-100"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

const ErrorModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Error</h3>
                    <p className="text-sm text-slate-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors focus:ring-4 focus:ring-red-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ResearchDBApp() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [importLog, setImportLog] = useState([]);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingItem, setEditingItem] = useState(null);

    // View Details States
    const [viewingItem, setViewingItem] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [editData, setEditData] = useState(null);

    // API States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterDiscipline, setFilterDiscipline] = useState('');
    const [filterMethod, setFilterMethod] = useState('');

    // Author Management for Articles
    const [articleAuthors, setArticleAuthors] = useState([]);
    const [authorInput, setAuthorInput] = useState('');

    // Success/Failure Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Confirm Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Toast Notifications
    const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();

    // Full Database State
    const [db, setDb] = useState({
        disciplines: [],
        institutions: [],
        journals: [],
        funding_agencies: [],
        authors: [],
        articles: [],
        article_design: [],
        article_metrics: [],
        statistics: [],
        article_authors: [],
        article_funding: []
    });

    // Fetch all data from API on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Helper to safely fetch array data
            const safeFetchData = async (endpoint) => {
                try {
                    const res = await fetch(`${API_BASE_URL}/${endpoint}`);
                    if (!res.ok) throw new Error(`Status ${res.status}`);
                    const data = await res.json();
                    // Ensure we always return an array
                    return Array.isArray(data) ? data : [];
                } catch (e) {
                    console.error(`Failed to fetch ${endpoint}:`, e);
                    return [];
                }
            };

            const [disciplines, institutions, journals, funding_agencies, authors, articles,
                article_design, article_metrics, statistics, article_authors, article_funding] = await Promise.all([
                    safeFetchData('disciplines'),
                    safeFetchData('institutions'),
                    safeFetchData('journals'),
                    safeFetchData('funding-agencies'),
                    safeFetchData('authors'),
                    safeFetchData('articles'),
                    safeFetchData('article-design'),
                    safeFetchData('article-metrics'),
                    safeFetchData('statistics'),
                    safeFetchData('article-authors'),
                    safeFetchData('article-funding')
                ]);

            setDb({
                disciplines,
                institutions,
                journals,
                funding_agencies,
                authors,
                articles,
                article_design,
                article_metrics,
                statistics,
                article_authors,
                article_funding
            });
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data from server. Please check if the API is running.');
        } finally {
            setLoading(false);
        }
    };

    // --- DATA HELPERS ---

    const getCompositeArticle = (article) => {
        if (!article) return null;

        // 1. Get Journal
        const journal = db.journals.find(j => j.id === article.journal_id);

        // 2. Get Design
        const design = db.article_design.find(d => d.article_id === article.id);

        // 3. Get Authors
        const linkedAuthors = db.article_authors
            .filter(link => link.article_id === article.id)
            .sort((a, b) => (a.author_order || 0) - (b.author_order || 0))
            .map(link => {
                const author = db.authors.find(a => a.id === link.author_id);
                const institution = author ? db.institutions.find(i => i.id === author.current_institution_id) : null;
                return author ? { ...author, institution_name: institution?.name } : null;
            })
            .filter(Boolean);

        // 4. Get Statistics
        const linkedStats = db.statistics.filter(s => s.article_id === article.id);

        // 5. Get Discipline
        const discipline = db.disciplines.find(d => d.id === article.discipline_id);

        // 6. Calculate Max Z-Score
        let maxZ = 0;
        linkedStats.forEach(s => {
            const z = Math.abs(parseFloat(s.z_score || 0));
            if (z > maxZ) maxZ = z;
        });

        return {
            ...article,
            journal_details: journal,
            design_details: design,
            authors_list: linkedAuthors,
            stats_list: linkedStats,
            discipline_name: discipline ? discipline.name : article.discipline_id || 'Unknown',
            max_z_score: maxZ.toFixed(2)
        };
    };

    const entriesData = useMemo(() => {
        let filtered = db.articles.map(article => {
            const composite = getCompositeArticle(article);
            return {
                ...article,
                journal_name: composite.journal_details ? composite.journal_details.name : 'Unknown',
                authors_list: composite.authors_list,
                institutions_list: [...new Map(composite.authors_list.map(a => [a.current_institution_id, { id: a.current_institution_id, name: a.institution_name }])).values()].filter(i => i.name),
                design_method: composite.design_details ? composite.design_details.primary_method : null,
                design_data: composite.design_details ? composite.design_details.data_type : null,
                stats_list: composite.stats_list,
                max_z_score: composite.max_z_score,
                discipline_name: composite.discipline_name
            };
        });

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.title?.toLowerCase().includes(query) ||
                article.doi?.toLowerCase().includes(query) ||
                article.authors_list.some(author => author.full_name?.toLowerCase().includes(query))
            );
        }

        // Apply year filter
        if (filterYear) {
            filtered = filtered.filter(article => article.publication_year === parseInt(filterYear));
        }

        // Apply discipline filter
        if (filterDiscipline) {
            filtered = filtered.filter(article => article.discipline_id === filterDiscipline);
        }

        // Apply method filter
        if (filterMethod) {
            filtered = filtered.filter(article => article.design_method === filterMethod);
        }

        return filtered;
    }, [db, searchQuery, filterYear, filterDiscipline, filterMethod]);

    // Merge Authors with Relations for the "Authors" Tab
    const authorsViewData = useMemo(() => {
        return db.article_authors.map(link => {
            const author = db.authors.find(a => a.id === link.author_id) || {};
            const article = db.articles.find(a => a.id === link.article_id) || {};

            return {
                // Use a synthetic key for React rendering, but preserve real author data
                _rowKey: link.author_id + link.article_id, // for React key only
                id: link.author_id, // REAL author ID for editing
                author_id: link.author_id,
                article_id: link.article_id,
                author_order: link.author_order,
                full_name: author.full_name || 'Unknown',
                gender: author.gender,
                phd_year: author.phd_year,
                current_institution_id: author.current_institution_id,
                experience: author.experience,
                article_title: article.title || 'Unknown'
            };
        });
    }, [db]);

    // --- DASHBOARD CALCULATIONS ---
    const dashboardStats = useMemo(() => {
        const yearCounts = {};
        db.articles.forEach(a => {
            if (a.publication_year) {
                yearCounts[a.publication_year] = (yearCounts[a.publication_year] || 0) + 1;
            }
        });
        const years = Object.keys(yearCounts).sort();
        const chartData = years.map(y => ({ label: y, value: yearCounts[y] }));

        const methodCounts = {};
        let empiricalCount = 0;
        db.article_design.forEach(d => {
            if (d.primary_method) {
                methodCounts[d.primary_method] = (methodCounts[d.primary_method] || 0) + 1;
            }
            if (d.is_empirical) empiricalCount++;
        });

        // Prepare Data for Pie Chart
        const methodColors = ['#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#64748b'];
        const pieData = Object.entries(methodCounts)
            .map(([label, value], i) => ({
                label,
                value,
                color: methodColors[i % methodColors.length]
            }))
            .sort((a, b) => b.value - a.value);

        // Calculate active authors (authors who have written articles)
        const activeAuthorIds = new Set(db.article_authors.map(aa => aa.author_id));
        const activeAuthors = db.authors.filter(a => activeAuthorIds.has(a.id));

        let male = 0, female = 0, unknown = 0;
        activeAuthors.forEach(a => {
            if (a.gender === 'M') male++;
            else if (a.gender === 'F') female++;
            else unknown++;
        });
        const totalActiveAuthors = activeAuthors.length;
        const femalePercentage = totalActiveAuthors ? Math.round((female / totalActiveAuthors) * 100) : 0;

        const avgExp = totalActiveAuthors
            ? (activeAuthors.reduce((acc, curr) => acc + (Number(curr.experience) || 0), 0) / totalActiveAuthors).toFixed(1)
            : 0;

        const discCounts = {};
        db.articles.forEach(a => {
            const disc = db.disciplines.find(d => d.id === a.discipline_id)?.name || 'Other';
            discCounts[disc] = (discCounts[disc] || 0) + 1;
        });
        const topDisciplines = Object.entries(discCounts)
            .sort((a, b) => b[1] - a[1]);

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        let thisWeekCount = 0;
        let lastWeekCount = 0;

        db.articles.forEach(a => {
            if (a.date_added) {
                const d = new Date(a.date_added);
                if (d >= oneWeekAgo) thisWeekCount++;
                else if (d >= twoWeeksAgo && d < oneWeekAgo) lastWeekCount++;
            }
        });

        let wowText = "No recent data";
        let wowTrend = "neutral";

        if (thisWeekCount > 0 || lastWeekCount > 0) {
            if (lastWeekCount === 0) {
                wowText = `+${thisWeekCount} this week`;
                wowTrend = "up";
            } else {
                const diff = thisWeekCount - lastWeekCount;
                const pct = Math.round((diff / lastWeekCount) * 100);
                wowText = `${pct > 0 ? '+' : ''}${pct}% vs last week`;
                wowTrend = pct >= 0 ? "up" : "down";
            }
        } else if (db.articles.length > 0) {
            wowText = "Historical data only";
        }

        return {
            years: chartData,
            pieData: pieData,
            empiricalShare: db.article_design.length ? Math.round((empiricalCount / db.article_design.length) * 100) : 0,
            gender: { male, female, unknown, femalePercentage },
            avgExp,
            disciplines: topDisciplines,
            wow: { text: wowText, trend: wowTrend },
            activeAuthorsCount: totalActiveAuthors
        };
    }, [db]);


    // --- CSV DOWNLOAD ---
    const handleDownloadAll = () => {
        const csvRows = [];
        csvRows.push([
            'Article ID', 'Title', 'Year', 'Journal', 'DOI', 'Discipline', 'Abstract', 'URL',
            'Methodology', 'Data Type', 'Is Empirical', 'Replication Avail',
            'Authors', 'Author Genders', 'Total Authors', 'Female Share', 'Avg Experience',
            'Statistics Summary'
        ].map(h => `"${h}"`).join(','));

        entriesData.forEach(item => {
            const femaleCount = item.authors_list.filter(a => a.gender === 'F').length;
            const femaleShare = item.authors_list.length > 0 ? Math.round((femaleCount / item.authors_list.length) * 100) : 0;
            const totalExp = item.authors_list.reduce((sum, a) => sum + (parseInt(a.experience) || 0), 0);
            const avgExp = item.authors_list.length > 0 ? (totalExp / item.authors_list.length).toFixed(1) : 0;
            const statsStr = item.stats_list.map(s => `${s.test_name}(p=${s.p_value_reported}, b=${s.coefficient})`).join('; ');

            const row = [
                item.id,
                item.title,
                item.publication_year,
                item.journal_name,
                item.doi,
                db.disciplines.find(d => d.id === item.discipline_id)?.name || item.discipline_id,
                item.abstract ? item.abstract.replace(/"/g, '""') : '',
                item.url,
                item.design_method,
                item.design_data,
                item.design_details?.is_empirical ? 'Yes' : 'No',
                item.design_details?.replication_available ? 'Yes' : 'No',
                item.authors_list.map(a => a.full_name).join('; '),
                item.authors_list.map(a => a.gender).join('; '),
                item.authors_list.length,
                femaleShare + '%',
                avgExp,
                statsStr
            ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',');

            csvRows.push(row);
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "research_database_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- FORM CONFIGURATIONS ---
    const FORM_CONFIGS = useMemo(() => ({
        articles: [
            { name: 'id', label: 'Key/ID', type: 'text', placeholder: 'P7PYD64M' },
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'publication_year', label: 'Year', type: 'number', placeholder: '2025' },
            {
                name: 'journal_name',
                label: 'Journal Name',
                type: 'text',
                placeholder: 'Nature, Science, etc.',
                required: true,
                helpText: 'Journal will be auto-created if it doesn\'t exist'
            },
            {
                name: 'discipline_id',
                label: 'Discipline',
                type: 'select',
                options: [
                    'Economics',
                    'Political science',
                    'Sociology',
                    'Philosophy',
                    'Geography',
                    'Sports and society',
                    'Psychology',
                    'History',
                    'Communication and information',
                    'Literature',
                    'Other'
                ]
            },
            { name: 'doi', label: 'DOI', type: 'text' },
            { name: 'abstract', label: 'Abstract', type: 'textarea' },
            { name: 'url', label: 'URL', type: 'text' }
        ],
        journals: [
            { name: 'id', label: 'ID (Slug)', type: 'text', placeholder: 'nature', required: true },
            { name: 'name', label: 'Journal Name', type: 'text', required: true },
            { name: 'issn', label: 'ISSN', type: 'text' },
            { name: 'impact_factor', label: 'Impact Factor', type: 'number', step: '0.001' }
        ],
        authors: [
            { name: 'id', label: 'ID (e.g. name-slug)', type: 'text', placeholder: 'smith-john', required: true },
            { name: 'full_name', label: 'Full Name', type: 'text', required: true },
            { name: 'gender', label: 'Gender', type: 'select', options: ['M', 'F', 'U'] },
            { name: 'phd_year', label: 'PhD Year', type: 'number' },
            {
                name: 'current_institution_id',
                label: 'Institution',
                type: 'select',
                options: ['', ...db.institutions.map(i => i.id)],
                optionLabels: db.institutions.reduce((acc, i) => ({ ...acc, [i.id]: i.name }), { '': 'None' }),
                helpText: 'Select from available institutions'
            }
        ],
        institutions: [
            { name: 'name', label: 'Institution Name', type: 'text', required: true },
            { name: 'country', label: 'Country', type: 'text' },
            { name: 'shanghai_rank', label: 'Rank', type: 'text' },
            { name: 'is_private', label: 'Private Institution?', type: 'checkbox' }
        ],
        design: [
            { name: 'article_id', label: 'Article ID', type: 'text', required: true },
            { name: 'primary_method', label: 'Primary Method', type: 'text', placeholder: 'DID, RCT...' },
            { name: 'data_type', label: 'Data Type', type: 'text', placeholder: 'Admin, Survey...' },
            { name: 'is_empirical', label: 'Is Empirical?', type: 'checkbox' },
            { name: 'replication_available', label: 'Replication Avail?', type: 'checkbox' },
            { name: 'legal_constraints', label: 'Legal Constraints?', type: 'checkbox' }
        ],
        statistics: [
            { name: 'article_id', label: 'Article ID', type: 'text', required: true },
            { name: 'test_name', label: 'Test Name', type: 'text', placeholder: 'Treatment Effect' },
            { name: 'location_in_text', label: 'Location', type: 'text', placeholder: 'Table 2, Col 1' },
            { name: 'coeff_reported', label: 'Coefficient', type: 'number', step: '0.0001' },
            { name: 'se_reported', label: 'Standard Error', type: 'number', step: '0.0001' },
            { name: 'p_value_reported', label: 'P-Value', type: 'number', step: '0.0001' },
            { name: 'stars_reported', label: 'Stars', type: 'text', placeholder: '***' },
            { name: 'is_just_significant', label: 'Just Significant?', type: 'checkbox' },
            { name: 'distance_to_threshold', label: 'Distance to 0.05', type: 'number', step: '0.0001' }
        ],
        funding_agencies: [
            { name: 'id', label: 'ID', type: 'text', required: true },
            { name: 'name', label: 'Agency Name', type: 'text', required: true },
            { name: 'is_corporate_conflict', label: 'Corporate Conflict?', type: 'checkbox' }
        ],
        article_metrics: [
            { name: 'article_id', label: 'Article ID', type: 'text', required: true },
            { name: 'citation_count', label: 'Citation Count', type: 'number' },
            { name: 'citation_velocity', label: 'Citations/Year', type: 'number', step: '0.01' },
            { name: 'altmetric_score', label: 'Altmetric Score', type: 'number' }
        ]
    }), []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            processCSVData(e.target.result);
        };
        reader.readAsText(file);
    };

    // Helper to clean form data - convert empty strings to null
    const cleanFormData = (data) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(data)) {
            // Convert empty strings and 'null' strings to actual null
            if (value === '' || value === 'null' || value === 'undefined') {
                cleaned[key] = null;
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    };

    const processCSVData = async (csvText) => {
        const rawRows = parseCSV(csvText);
        if (rawRows.length < 2) return;

        const headers = rawRows[0].map(h => h.trim().toLowerCase());
        const dataRows = rawRows.slice(1);

        const getColIndex = (possibleNames) => {
            return headers.findIndex(h => possibleNames.some(name => h.includes(name.toLowerCase())));
        };


        const idx = {
            key: getColIndex(['key']),
            itemType: getColIndex(['item type']),
            title: getColIndex(['title']),
            pubYear: getColIndex(['publication year', 'date']),
            author: getColIndex(['author']),
            pubTitle: getColIndex(['publication title', 'journal']),
            issn: getColIndex(['issn']),
            doi: getColIndex(['doi']),
            url: getColIndex(['url']),
            abstract: getColIndex(['abstract note', 'abstract']),
            dateAdded: getColIndex(['date added', 'date_added']),
            discipline: getColIndex(['discipline', 'field', 'subject'])
        };

        let newLog = [];
        const journalIds = new Set(db.journals.map(j => j.id));
        const articleIds = new Set(db.articles.map(a => a.id));
        const authorIds = new Set(db.authors.map(a => a.id));

        const batchJournals = [];
        const batchArticles = [];
        const batchAuthors = [];
        const batchJunctionAA = [];
        const batchDesign = [];
        const batchMetrics = [];
        const batchStatistics = [];

        dataRows.forEach((row, rowIndex) => {
            const key = row[idx.key];
            if (!key) return;

            // CRITICAL: Only process journal articles, skip books and other item types
            const itemType = row[idx.itemType]?.toLowerCase() || '';
            if (itemType !== 'journalarticle') {
                newLog.push(`⏭️ Skipped ${key}: Item type "${itemType}" is not a journal article`);
                return;
            }


            const pubTitle = row[idx.pubTitle] || "Unknown Journal";
            const journalId = slugify(pubTitle.substring(0, 30));
            const issn = row[idx.issn] || null;

            // DEBUG: Log journal processing
            if (rowIndex < 3) { // Only log first 3 rows
                console.log(`Row ${rowIndex}: pubTitle="${pubTitle}", journalId="${journalId}"`);
                console.log(`  journalIds.has("${journalId}"):`, journalIds.has(journalId));
            }

            // Track journals we've already added in THIS batch to avoid duplicates
            const batchJournalIds = new Set(batchJournals.map(j => j.id));

            if (!journalIds.has(journalId) && !batchJournalIds.has(journalId) && pubTitle !== "Unknown Journal") {
                batchJournals.push({
                    id: journalId,
                    name: pubTitle,
                    issn: issn,
                    impact_factor: null,
                    policy_year_data: null,
                    policy_year_open_access: null
                });
                newLog.push(`Created Journal: ${pubTitle}`);
            }

            const rawYear = row[idx.pubYear];
            let cleanYear = null;
            if (rawYear) {
                const match = rawYear.toString().match(/(\d{4})/);
                if (match) cleanYear = parseInt(match[0]);
            }

            // Use discipline from CSV if available, otherwise default to 'economics'
            const disciplineValue = row[idx.discipline] || 'economics';
            const disciplineId = slugify(disciplineValue);

            // Always add article to batch - API will handle duplicates with ON CONFLICT
            batchArticles.push({
                id: key,
                title: row[idx.title] || "Untitled",
                publication_year: cleanYear,
                doi: row[idx.doi] || null,
                url: row[idx.url] || null,
                abstract: row[idx.abstract] || null,
                journal_id: journalId,
                discipline_id: disciplineId
            });

            batchDesign.push({
                article_id: key,
                primary_method: null,
                data_type: null,
                is_empirical: true,
                replication_available: false,
                legal_constraints: false
            });

            batchMetrics.push({
                article_id: key,
                citation_count: 0,
                citation_velocity: 0,
                altmetric_score: 0
            });

            batchStatistics.push({
                article_id: key,
                test_name: null,
                location_in_text: null,
                coeff_reported: null,
                se_reported: null,
                p_value_reported: null,
                stars_reported: null,
                is_just_significant: false,
                distance_to_threshold: null
            });

            const authorStr = row[idx.author];
            if (authorStr) {
                const authorList = authorStr.split(/;|\n/).map(s => s.trim()).filter(s => s.length > 0);
                authorList.forEach((authName, orderIdx) => {
                    const authId = slugify(authName);
                    if (!authorIds.has(authId)) {
                        batchAuthors.push({
                            id: authId,
                            full_name: authName,
                            gender: 'U',
                            phd_year: null,
                            current_institution_id: null
                        });
                        authorIds.add(authId);
                    }
                    batchJunctionAA.push({
                        article_id: key,
                        author_id: authId,
                        author_order: orderIdx + 1
                    });
                });
            }
        });

        // Send all batches to API
        try {
            setImportLog(['Starting batch import...']);
            let newArticlesCount = 0;
            let existingArticlesCount = 0;
            let failCount = 0;

            const safeFetch = async (url, data, type) => {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`Failed to import ${type}:`, errorText);
                        setImportLog(prev => [`❌ Failed ${type}: ${errorText.substring(0, 100)}`, ...prev]);
                        return false;
                    }

                    const result = await response.json();
                    // Check if it was a duplicate (for articles)
                    if (type === 'article' && result.message && result.message.includes('already exists')) {
                        return 'duplicate';
                    }
                    return true;
                } catch (err) {
                    console.error(`Error importing ${type}:`, err);
                    setImportLog(prev => [`❌ Error ${type}: ${err.message}`, ...prev]);
                    return false;
                }
            };

            // Import journals first (articles depend on them)
            console.log('=== BATCH IMPORT DEBUG ===');
            console.log('Total journals to import:', batchJournals.length);
            console.log('Total articles to import:', batchArticles.length);
            console.log('Total authors to import:', batchAuthors.length);

            if (batchJournals.length > 0) {
                setImportLog(prev => [`Processing ${batchJournals.length} journals...`, ...prev]);
                console.log('First journal:', batchJournals[0]);
            }

            const successfulJournalIds = new Set();
            for (const journal of batchJournals) {
                const result = await safeFetch(`${API_BASE_URL}/journals`, journal, 'journal');
                if (result) {
                    successfulJournalIds.add(journal.id);
                }
            }
            console.log('Successfully imported journals:', successfulJournalIds.size);

            // Import authors
            if (batchAuthors.length > 0) {
                setImportLog(prev => [`Processing ${batchAuthors.length} authors...`, ...prev]);
                console.log('First author:', batchAuthors[0]);
                console.log('Total article-author links:', batchJunctionAA.length);
            }
            for (const author of batchAuthors) {
                await safeFetch(`${API_BASE_URL}/authors`, author, 'author');
            }

            // Import articles (ONLY if their journal was successfully created)
            if (batchArticles.length > 0) {
                setImportLog(prev => [`Processing ${batchArticles.length} articles...`, ...prev]);
                console.log('First article:', batchArticles[0]);
            }
            const successfulArticleIds = new Set(); // Track which articles were successfully imported

            // Process articles in parallel batches for better performance
            const BATCH_SIZE = 10; // Process 10 articles at a time
            for (let i = 0; i < batchArticles.length; i += BATCH_SIZE) {
                const batch = batchArticles.slice(i, i + BATCH_SIZE);

                // Update progress
                setImportLog(prev => [`Progress: ${Math.min(i + BATCH_SIZE, batchArticles.length)}/${batchArticles.length} articles processed...`, ...prev]);

                // Process batch in parallel
                const results = await Promise.all(
                    batch.map(async (article) => {
                        // Check if journal exists
                        const journalExists = successfulJournalIds.has(article.journal_id) || journalIds.has(article.journal_id);

                        if (article.journal_id && !journalExists) {
                            setImportLog(prev => [`⚠️ Skipped article ${article.id}: journal ${article.journal_id} not found`, ...prev]);
                            return { status: 'failed', articleId: article.id };
                        }

                        const result = await safeFetch(`${API_BASE_URL}/articles`, article, 'article');
                        return { status: result, articleId: article.id };
                    })
                );

                // Process results
                results.forEach(({ status, articleId }) => {
                    if (status === true) {
                        newArticlesCount++;
                        successfulArticleIds.add(articleId);
                    } else if (status === 'duplicate') {
                        existingArticlesCount++;
                        successfulArticleIds.add(articleId);
                    } else {
                        failCount++;
                    }
                });
            }

            // Import article design (ONLY for successful articles) - in parallel
            const successfulDesigns = batchDesign.filter(d => successfulArticleIds.has(d.article_id));
            setImportLog(prev => [`Processing ${successfulDesigns.length} article designs...`, ...prev]);
            await Promise.all(successfulDesigns.map(design =>
                safeFetch(`${API_BASE_URL}/article-design`, design, 'design')
            ));

            // Import article metrics (ONLY for successful articles) - in parallel
            const successfulMetrics = batchMetrics.filter(m => successfulArticleIds.has(m.article_id));
            setImportLog(prev => [`Processing ${successfulMetrics.length} article metrics...`, ...prev]);
            await Promise.all(successfulMetrics.map(metrics =>
                safeFetch(`${API_BASE_URL}/article-metrics`, metrics, 'metrics')
            ));

            // Import article-author relationships (ONLY for successful articles) - in parallel
            const successfulJunctions = batchJunctionAA.filter(j => successfulArticleIds.has(j.article_id));
            setImportLog(prev => [`Processing ${successfulJunctions.length} article-author links...`, ...prev]);
            await Promise.all(successfulJunctions.map(junction =>
                safeFetch(`${API_BASE_URL}/article-authors`, junction, 'author-link')
            ));

            // Import statistics (ONLY for successful articles) - in parallel
            const successfulStatistics = batchStatistics.filter(s => successfulArticleIds.has(s.article_id));
            setImportLog(prev => [`Processing ${successfulStatistics.length} statistics records...`, ...prev]);
            await Promise.all(successfulStatistics.map(stat =>
                safeFetch(`${API_BASE_URL}/statistics`, stat, 'statistics')
            ));

            // Import complete - show final status
            setImportLog(prev => [`✅ Import processing complete! Refreshing data...`, ...prev]);
            console.log('Import complete:', { newArticlesCount, existingArticlesCount, failCount });

            // Refresh data from server
            // Refresh data to show new imports
            await fetchAllData();

            const summaryMsg = `Import Complete: ${newArticlesCount} new articles added, ${existingArticlesCount} already existed, ${failCount} failed.`;
            setImportLog(prev => [summaryMsg, ...prev]);
            if (newArticlesCount > 0) setActiveTab('articles');

            // Show toast notification
            if (failCount === 0) {
                showSuccess(summaryMsg);
            } else if (newArticlesCount > 0) {
                showWarning(summaryMsg);
            } else {
                showError(summaryMsg);
            }
        } catch (err) {
            console.error('Critical error during import:', err);
            setImportLog([`❌ Critical error: ${err.message}`]);
            showError('Critical error importing CSV data. Check console for details.');
        }
    };

    const clearDb = () => {
        if (confirm("Are you sure you want to clear the database?")) {
            setDb({
                articles: [], journals: [], authors: [], article_authors: [],
                disciplines: [...db.disciplines], institutions: [],
                article_design: [], statistics: []
            });
            setImportLog([]);
        }
    };

    // --- ACTIONS ---

    const handleOpenAdd = () => {
        setFormData({});
        setEditingItem(null);
        setArticleAuthors([]);
        setAuthorInput('');
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData({ ...item });
        setEditingItem(item);
        // Load existing authors if editing an article
        if (activeTab === 'articles') {
            const articleAuthorsData = db.article_authors
                .filter(aa => aa.article_id === item.id)
                .sort((a, b) => a.author_order - b.author_order)
                .map(aa => {
                    const author = db.authors.find(a => a.id === aa.author_id);
                    return author ? author.full_name : aa.author_id;
                });
            setArticleAuthors(articleAuthorsData);
        }
        // For articles, check if current discipline is custom (not in default list)
        if (activeTab === 'articles') {
            const defaultDisciplines = FORM_CONFIGS.articles.find(f => f.name === 'discipline_id').options;
            const disc = db.disciplines.find(d => d.id === item.discipline_id);
            const discName = disc ? disc.name : '';

            if (disc && !defaultDisciplines.includes(disc.name)) {
                setFormData({ ...item, discipline_id: 'Other', custom_discipline: disc.name });
            } else if (disc) {
                setFormData({ ...item, discipline_id: disc.name });
            }
        }

        setEditingItem(item);
        setIsModalOpen(true);
    };

    // Author management functions
    const handleAddAuthor = () => {
        if (authorInput.trim()) {
            setArticleAuthors(prev => [...prev, authorInput.trim()]);
            setAuthorInput('');
        }
    };

    const handleRemoveAuthor = (index) => {
        setArticleAuthors(prev => prev.filter((_, i) => i !== index));
    };

    const handleAuthorKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAuthor();
        }
    };

    const handleDelete = async (item) => {
        let dbKey = activeTab;
        let endpoint = activeTab;
        let itemId = item.id;

        // Map tab names to API endpoints and determine ID
        if (activeTab === 'design') {
            endpoint = 'article-design';
            dbKey = 'article_design';
            itemId = item.article_id;
        } else if (activeTab === 'funding_agencies') {
            endpoint = 'funding-agencies';
        } else if (activeTab === 'article_metrics') {
            endpoint = 'article-metrics';
            itemId = item.article_id;
        }

        // Show confirmation modal
        setConfirmModalConfig({
            title: 'Delete Record',
            message: 'Are you sure you want to delete this record? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/${endpoint}/${itemId}`, {
                        method: 'DELETE'
                    });
                    await fetch(`${API_BASE_URL}/${endpoint}/${itemId}`, { method: 'DELETE' });
                    await fetchAllData(); // Refresh data
                    showSuccess('Record deleted successfully');
                    setShowConfirmModal(false);
                } catch (err) {
                    console.error('Error deleting:', err);
                    showError('Error deleting item: ' + err.message);
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleBulkDelete = async (articleIds) => {
        // Show confirmation modal
        setConfirmModalConfig({
            title: 'Delete Multiple Articles',
            message: `Are you sure you want to delete ${articleIds.length} article${articleIds.length !== 1 ? 's' : ''}? This will also delete all linked records (statistics, design, metrics, author relationships). This action cannot be undone.`,
            onConfirm: async () => {
                let successCount = 0;
                let failCount = 0;

                try {
                    for (const articleId of articleIds) {
                        try {
                            const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                                method: 'DELETE'
                            });

                            if (response.ok) {
                                successCount++;
                            } else {
                                failCount++;
                            }
                        } catch (err) {
                            console.error(`Failed to delete article ${articleId}:`, err);
                            failCount++;
                        }
                    }

                    // Refresh data from server
                    await fetchAllData();

                    // Show success/error message
                    if (failCount === 0) {
                        showSuccess(`Successfully deleted ${successCount} article${successCount !== 1 ? 's' : ''} and all linked records.`);
                    } else if (successCount === 0) {
                        showError(`Failed to delete all ${failCount} article${failCount !== 1 ? 's' : ''}.`);
                    } else {
                        showWarning(`Deleted ${successCount} article${successCount !== 1 ? 's' : ''}, but ${failCount} failed.`);
                    }
                    setShowConfirmModal(false);
                } catch (err) {
                    console.error('Error in bulk delete:', err);
                    showError('Error during bulk delete: ' + err.message);
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleViewDetails = (item) => {
        const composite = getCompositeArticle(item);

        const totalAuthors = composite.authors_list ? composite.authors_list.length : 0;
        const isSolo = totalAuthors === 1;

        const femaleCount = composite.authors_list
            ? composite.authors_list.filter(a => a.gender === 'F').length
            : 0;
        const femaleShare = totalAuthors > 0 ? Math.round((femaleCount / totalAuthors) * 100) : 0;

        const totalExp = composite.authors_list
            ? composite.authors_list.reduce((sum, a) => sum + (parseInt(a.experience) || 0), 0)
            : 0;
        const avgExp = totalAuthors > 0 ? (totalExp / totalAuthors).toFixed(1) : 0;

        setViewingItem({
            ...composite,
            metrics: {
                isSolo,
                femaleShare,
                avgExp,
                totalAuthors
            }
        });
        setEditingSection(null);
        setIsViewModalOpen(true);
    };

    // --- POPUP EDIT LOGIC ---

    const handleStartEditSection = (section) => {
        if (section === 'design') {
            setEditData({ ...viewingItem.design_details });
        } else if (section === 'stats') {
            setEditData([...viewingItem.stats_list]);
        } else if (section === 'abstract') {
            setEditData(viewingItem.abstract || '');
        }
        setEditingSection(section);
    };

    const handleSavePopupEdit = async () => {
        try {
            if (editingSection === 'design') {
                await fetch(`${API_BASE_URL}/article-design/${viewingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editData)
                });
            } else if (editingSection === 'stats') {
                // Update each stat record
                for (const stat of editData) {
                    if (stat.id) {
                        await fetch(`${API_BASE_URL}/statistics/${stat.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(stat)
                        });
                    } else {
                        // In case we support adding new stats in the future
                        await fetch(`${API_BASE_URL}/statistics`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...stat, article_id: viewingItem.id })
                        });
                    }
                }
            } else if (editingSection === 'abstract') {
                await fetch(`${API_BASE_URL}/articles/${viewingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...viewingItem, abstract: editData })
                });
            }

            await fetchAllData();
            setModalMessage(`${editingSection} updated successfully!`);
            setShowSuccessModal(true);
            setEditingSection(null);
            setIsViewModalOpen(false);

        } catch (err) {
            console.error('Error saving popup edit:', err);
            setModalMessage(`Error saving ${editingSection}: ${err.message}`);
            setShowErrorModal(true);
        }
    };

    const handlePopupInputChange = (e, index = null) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (editingSection === 'design') {
            setEditData(prev => ({ ...prev, [name]: val }));
        } else if (editingSection === 'stats' && index !== null) {
            setEditData(prev => {
                const newData = [...prev];
                newData[index] = { ...newData[index], [name]: val };
                return newData;
            });
        }
    };

    const handleAbstractChange = (e) => {
        setEditData(e.target.value);
    }


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmitEntry = async (e) => {
        e.preventDefault();
        const config = FORM_CONFIGS[activeTab];
        if (!config) return;

        let newItem = { ...formData };
        let dbKey = activeTab;
        let endpoint = activeTab;

        // Map tab names to API endpoints
        if (activeTab === 'design') {
            endpoint = 'article-design';
            dbKey = 'article_design';
        } else if (activeTab === 'funding_agencies') {
            endpoint = 'funding-agencies';
        } else if (activeTab === 'article_metrics') {
            endpoint = 'article-metrics';
        }

        // Auto-create journal if adding an article
        if (activeTab === 'articles' && newItem.journal_name) {
            const journalName = newItem.journal_name.trim();
            const journalId = slugify(journalName);

            // Check if journal exists
            const existingJournal = db.journals.find(j => j.id === journalId || j.name.toLowerCase() === journalName.toLowerCase());

            if (!existingJournal) {
                // Create journal automatically
                try {
                    await fetch(`${API_BASE_URL}/journals`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: journalId,
                            name: journalName,
                            issn: null,
                            impact_factor: null,
                            policy_year_data: null,
                            policy_year_open_access: null
                        })
                    });
                    setImportLog(prev => [`Auto-created journal: ${journalName}`, ...prev]);
                } catch (err) {
                    console.error('Error creating journal:', err);
                }
            }

            // Replace journal_name with journal_id for the article
            newItem.journal_id = existingJournal ? existingJournal.id : journalId;
            delete newItem.journal_name;
        }

        // Handle "Other" Discipline Logic for Articles
        if (activeTab === 'articles' && newItem.discipline_id) {
            if (newItem.discipline_id === 'Other') {
                if (!newItem.custom_discipline) {
                    setModalMessage("Please specify the discipline.");
                    setShowErrorModal(true);
                    return;
                }
                const customName = newItem.custom_discipline.trim();
                const customSlug = slugify(customName);

                // Check if discipline exists, if not create it via API
                const existingDisc = db.disciplines.find(d => d.id === customSlug);
                if (!existingDisc) {
                    try {
                        await fetch(`${API_BASE_URL}/disciplines`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: customSlug,
                                name: customName,
                                parent_field: 'General'
                            })
                        });
                    } catch (err) {
                        console.error('Error creating custom discipline:', err);
                    }
                }

                newItem.discipline_id = customSlug;
            } else {
                // Convert discipline name to ID (e.g., "Economics" -> "economics")
                const disc = db.disciplines.find(d =>
                    d.name.toLowerCase() === newItem.discipline_id.toLowerCase() ||
                    d.id === newItem.discipline_id.toLowerCase()
                );
                if (disc) {
                    newItem.discipline_id = disc.id;
                } else {
                    // If discipline doesn't exist, create it
                    const disciplineSlug = slugify(newItem.discipline_id);
                    try {
                        await fetch(`${API_BASE_URL}/disciplines`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: disciplineSlug,
                                name: newItem.discipline_id,
                                parent_field: 'General'
                            })
                        });
                        newItem.discipline_id = disciplineSlug;
                        setImportLog(prev => [`Auto-created discipline: ${newItem.discipline_id}`, ...prev]);
                    } catch (err) {
                        console.error('Error creating discipline:', err);
                    }
                }
            }
        }

        // Auto-generate ID for institutions if not editing
        if (activeTab === 'institutions' && !editingItem && newItem.name) {
            newItem.id = slugify(newItem.name);
        }

        // Auto-generate IDs if needed
        if (!editingItem) {
            if (!newItem.id && newItem.name && activeTab !== 'statistics') {
                newItem.id = slugify(newItem.name);
            }
            // Statistics ID is auto-generated by database (SERIAL)
            if (activeTab === 'statistics') {
                delete newItem.id; // Let database auto-generate
            }
        }

        // Clean form data - convert empty strings to null
        newItem = cleanFormData(newItem);

        try {
            let response;

            if (editingItem) {
                // UPDATE existing item
                const itemId = activeTab === 'design' || activeTab === 'article_metrics'
                    ? editingItem.article_id
                    : editingItem.id;

                response = await fetch(`${API_BASE_URL}/${endpoint}/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem)
                });
            } else {
                // CREATE new item
                response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save item');
            }

            // Auto-create related records for new articles
            if (activeTab === 'articles' && !editingItem) {
                const articleId = newItem.id;

                try {
                    // Create article_design record
                    await fetch(`${API_BASE_URL}/article-design`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            article_id: articleId,
                            primary_method: null,
                            data_type: null,
                            is_empirical: true,
                            replication_available: false,
                            legal_constraints: false
                        })
                    });

                    // Create article_metrics record
                    await fetch(`${API_BASE_URL}/article-metrics`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            article_id: articleId,
                            citation_count: 0,
                            citation_velocity: 0,
                            altmetric_score: 0
                        })
                    });

                    // Create statistics record (placeholder)
                    await fetch(`${API_BASE_URL}/statistics`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            article_id: articleId,
                            test_name: 'Pending Input',
                            location_in_text: null,
                            coeff_reported: null,
                            se_reported: null,
                            p_value_reported: null,
                            stars_reported: null,
                            is_just_significant: false,
                            distance_to_threshold: null
                        })
                    });

                    // Create article-author relationships
                    for (let i = 0; i < articleAuthors.length; i++) {
                        const authorName = articleAuthors[i];
                        const authorId = slugify(authorName);

                        // Check if author exists, if not create
                        const existingAuthor = db.authors.find(a => a.id === authorId);
                        if (!existingAuthor) {
                            await fetch(`${API_BASE_URL}/authors`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id: authorId,
                                    full_name: authorName,
                                    gender: 'U',
                                    phd_year: null,
                                    current_institution_id: null
                                })
                            });
                        }

                        // Create article-author relationship
                        await fetch(`${API_BASE_URL}/article-authors`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                article_id: articleId,
                                author_id: authorId,
                                author_order: i + 1
                            })
                        });
                    }

                    setImportLog(prev => [`Created article with ${articleAuthors.length} author(s) and related records`, ...prev]);
                } catch (relatedErr) {
                    console.error('Error creating related records:', relatedErr);
                    // Don't fail the whole operation if related records fail
                }
            }

            // Refresh data from server
            await fetchAllData();
            setImportLog(prev => [`${editingItem ? 'Updated' : 'Added'} entry in ${activeTab}`, ...prev]);

            setModalMessage(`${editingItem ? 'Updated' : 'Added'} entry in ${activeTab} successfully!`);
            setShowSuccessModal(true);

            setIsModalOpen(false);
            setFormData({});
            setEditingItem(null);
            setArticleAuthors([]);
            setAuthorInput('');
        } catch (err) {
            console.error('Error saving item:', err);

            // Provide user-friendly error messages
            let userMessage = 'Error saving item: ';

            if (err.message.includes('Not found') || err.message.includes('404')) {
                setModalMessage('This item no longer exists on the server. The data will be refreshed.');
                setShowErrorModal(true);
                await fetchAllData();
                setIsModalOpen(false);
                return;
            }

            if (err.message.includes('foreign key constraint') && err.message.includes('journal')) {
                userMessage += 'The selected journal does not exist. Please create the journal first in the Journals tab.';
            } else if (err.message.includes('foreign key constraint') && err.message.includes('discipline')) {
                userMessage += 'The selected discipline does not exist. Please select a valid discipline.';
            } else if (err.message.includes('foreign key constraint') && err.message.includes('institution')) {
                userMessage += 'The selected institution does not exist. Please create the institution first.';
            } else if (err.message.includes('foreign key constraint') && err.message.includes('author')) {
                userMessage += 'The selected author does not exist. Please create the author first.';
            } else if (err.message.includes('duplicate key') || err.message.includes('unique constraint')) {
                userMessage += 'An item with this ID already exists. Please use a different ID.';
            } else if (err.message.includes('not-null constraint')) {
                userMessage += 'Required fields are missing. Please fill in all required fields.';
            } else {
                userMessage += err.message;
            }

            setModalMessage(userMessage);
            setShowErrorModal(true);
        }
    };

    const renderFormFields = () => {
        const fields = FORM_CONFIGS[activeTab];
        if (!fields) return <p className="text-red-500">No form configuration for this tab.</p>;

        return fields.map((field) => {
            // Check if field should be disabled (e.g., ID field when editing an author)
            const isDisabled = field.disabled || (activeTab === 'authors' && field.name === 'id' && editingItem);

            return (
                <div key={field.name} className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'select' ? (
                        <>
                            <select
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                required={field.required}
                                disabled={isDisabled}
                                className={`w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDisabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Select...</option>
                                {field.options.map(opt => (
                                    <option key={opt} value={opt}>
                                        {field.optionLabels ? field.optionLabels[opt] || opt : opt}
                                    </option>
                                ))}
                            </select>
                            {field.helpText && (
                                <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>
                            )}
                            {field.name === 'discipline_id' && formData.discipline_id === 'Other' && (
                                <input
                                    type="text"
                                    name="custom_discipline"
                                    value={formData.custom_discipline || ''}
                                    onChange={handleInputChange}
                                    placeholder="Specify discipline..."
                                    className="mt-2 w-full p-2 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            )}
                            {field.name === 'journal_id' && db.journals.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">⚠️ No journals found. Create a journal first in the Journals tab.</p>
                            )}
                        </>
                    ) : field.type === 'checkbox' ? (
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                name={field.name}
                                checked={formData[field.name] || false}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                                disabled={isDisabled}
                                className={`w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                            />
                            <span className="ml-2 text-sm text-slate-600">{field.label}</span>
                        </div>
                    ) : field.type === 'textarea' ? (
                        <>
                            <textarea
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                disabled={isDisabled}
                                className={`w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 ${isDisabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                            />
                            {field.helpText && (
                                <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>
                            )}
                        </>
                    ) : (
                        <>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                required={field.required}
                                placeholder={field.placeholder}
                                step={field.step}
                                disabled={isDisabled}
                                className={`w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDisabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                            />
                            {field.helpText && (
                                <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>
                            )}
                        </>
                    )}
                </div>
            );
        });
    };

    // --- RENDER HELPERS ---
    const commonProps = {
        onAdd: FORM_CONFIGS[activeTab] ? handleOpenAdd : undefined,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onView: (activeTab === 'articles') ? handleViewDetails : undefined,
        onDownload: activeTab === 'articles' ? handleDownloadAll : undefined
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
                                <p className="text-slate-500 text-sm">ResearchDB Analytics & Insights</p>
                            </div>
                        </div>

                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Total Articles"
                                value={db.articles.length}
                                subtitle={dashboardStats.wow.text}
                                trend={dashboardStats.wow.trend}
                                icon={FileText}
                                color="bg-blue-500"
                            />
                            <MetricCard
                                title="Active Authors"
                                value={dashboardStats.activeAuthorsCount}
                                subtitle={`${dashboardStats.gender.femalePercentage}% Female`}
                                icon={Users}
                                color="bg-purple-500"
                            />
                            <MetricCard
                                title="Journals"
                                value={db.journals.length}
                                subtitle="Indexed sources"
                                icon={BookOpen}
                                color="bg-emerald-500"
                            />
                            <MetricCard
                                title="Avg Experience"
                                value={`${dashboardStats.avgExp} Yrs`}
                                subtitle="Post-PhD average"
                                icon={GraduationCap}
                                color="bg-amber-500"
                            />
                        </div>

                        {/* Charts & Distributions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Publication Timeline (Bar Chart) */}
                            <Card className="lg:col-span-2 p-6 flex flex-col h-96">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-800 flex items-center">
                                        <BarChart className="w-4 h-4 mr-2 text-blue-500" />
                                        Publication Timeline
                                    </h3>
                                </div>
                                <div className="flex-1 flex items-end space-x-2 overflow-x-auto pb-2 h-full">
                                    {dashboardStats.years.length > 0 ? (
                                        dashboardStats.years.map((year, i) => {
                                            const maxVal = Math.max(...dashboardStats.years.map(y => y.value));
                                            const height = Math.max((year.value / maxVal) * 100, 5);
                                            return (
                                                <div key={year.label} className="flex flex-col items-center flex-1 min-w-[30px] group h-full justify-end">
                                                    <div className="relative w-full bg-blue-50 rounded-t-md hover:bg-blue-100 transition-all flex flex-col justify-end group h-full">
                                                        <div
                                                            className="w-full bg-blue-500 rounded-t-md transition-all duration-500 relative group-hover:bg-blue-600"
                                                            style={{ height: `${height}%` }}
                                                        >
                                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-lg transition-opacity z-10 whitespace-nowrap">
                                                                {year.value} articles
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 mt-2 font-medium">{year.label}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            No publication data available
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Methodology Pie Chart */}
                            <Card className="p-6 h-96 flex flex-col">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                                    <PieChart className="w-4 h-4 mr-2 text-purple-500" />
                                    Research Design
                                </h3>

                                <div className="flex-1 flex flex-col justify-center items-center">
                                    {dashboardStats.pieData.length > 0 ? (
                                        <>
                                            <SimplePieChart data={dashboardStats.pieData} />
                                            <div className="mt-6 w-full grid grid-cols-2 gap-2 text-xs">
                                                {dashboardStats.pieData.slice(0, 4).map((item, i) => (
                                                    <div key={i} className="flex items-center">
                                                        <span className="w-2 h-2 rounded-full mr-2" style={{ background: item.color }}></span>
                                                        <span className="text-slate-600 truncate">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-slate-400 text-sm">No data available</div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Bottom Row: Disciplines & Recent Import */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6 h-80">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-rose-500" />
                                    Top Disciplines
                                </h3>
                                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-60">
                                    {dashboardStats.disciplines.slice(0, 6).map(([name, count], i) => (
                                        <div key={name} className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 mr-3 shrink-0">
                                                {name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 capitalize truncate w-24 md:w-auto">{name}</p>
                                                <p className="text-xs text-slate-500">{count} Articles</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6 h-80 flex flex-col">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <Upload className="w-4 h-4 mr-2 text-slate-500" />
                                    Quick Import
                                </h3>
                                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center p-6 hover:bg-white hover:border-blue-400 transition-colors cursor-pointer relative">
                                    <FileText className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-sm text-slate-600 font-medium mb-1">Drop Zotero CSV here</p>
                                    <p className="text-xs text-slate-400">or click to browse files</p>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                {importLog.length > 0 && (
                                    <div className="mt-4 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
                                        Latest: {importLog[0]}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                );

            case 'articles':
                return (
                    <TableView
                        {...commonProps}
                        title="Articles"
                        description="The Master Table"
                        data={entriesData}
                        enableMultiSelect={true}
                        onBulkDelete={handleBulkDelete}
                        columns={[
                            { header: 'ID (Key)', accessor: 'id' },
                            { header: 'Title', accessor: 'title', render: (row) => <div className="max-w-md truncate font-medium text-slate-800" title={row.title}>{row.title}</div> },
                            { header: 'Year', accessor: 'publication_year' },
                            { header: 'Discipline', accessor: 'discipline_name', render: (row) => <span className="uppercase text-xs font-bold text-slate-500">{row.discipline_name}</span> },
                            { header: 'Method', accessor: 'design_method', render: (row) => row.design_method ? <Chip color="bg-blue-50 text-blue-700">{row.design_method}</Chip> : <span className="text-slate-300">-</span> },
                            { header: 'Max Z-Score', accessor: 'max_z_score', render: (row) => <span className="font-mono text-xs">{row.max_z_score > 0 ? row.max_z_score : '-'}</span> }
                        ]}
                    />
                );

            case 'design':
                return (
                    <TableView
                        {...commonProps}
                        title="Article Design & Methods"
                        description="One-to-One Extension: Methodology details"
                        data={db.article_design}
                        columns={[
                            { header: 'Article ID', accessor: 'article_id' },
                            { header: 'Method', accessor: 'primary_method' },
                            { header: 'Data Type', accessor: 'data_type' },
                            { header: 'Empirical?', accessor: 'is_empirical', render: (r) => r.is_empirical ? 'Yes' : 'No' },
                            { header: 'Replication?', accessor: 'replication_available', render: (r) => r.replication_available ? 'Yes' : 'No' }
                        ]}
                    />
                );

            case 'journals':
                return (
                    <TableView
                        {...commonProps}
                        title="Journals"
                        description="Reference Table"
                        data={db.journals}
                        columns={[
                            { header: 'ID', accessor: 'id' },
                            { header: 'Name', accessor: 'name' },
                            { header: 'ISSN', accessor: 'issn' },
                            { header: 'Impact Factor', accessor: 'impact_factor' }
                        ]}
                    />
                );

            case 'authors':
                return (
                    <TableView
                        {...commonProps}
                        title="Authors"
                        description="Authorships & Relationships"
                        data={authorsViewData}
                        columns={[
                            { header: 'Author Name', accessor: 'full_name', render: (row) => <span className="font-medium text-slate-900">{row.full_name}</span> },
                            { header: 'Article', accessor: 'article_title', render: (row) => <div className="max-w-xs truncate text-slate-600">{row.article_title}</div> },
                            { header: 'Order', accessor: 'author_order', render: (row) => <span className="font-mono text-xs text-slate-500">{row.author_order}</span> },
                            { header: 'Gender', accessor: 'gender', render: (row) => row.gender === 'F' ? <span className="text-pink-500 font-bold text-xs">F</span> : row.gender === 'M' ? <span className="text-blue-500 font-bold text-xs">M</span> : <span className="text-slate-300">-</span> },
                            { header: 'Exp (Yrs)', accessor: 'experience' }
                        ]}
                    />
                );

            case 'institutions':
                return (
                    <TableView
                        {...commonProps}
                        title="Institutions"
                        description="Reference Table: Linked to Authors"
                        data={db.institutions}
                        columns={[
                            { header: 'ID', accessor: 'id' },
                            { header: 'Name', accessor: 'name' },
                            { header: 'Country', accessor: 'country' },
                            { header: 'Rank', accessor: 'shanghai_rank' }
                        ]}
                    />
                );

            case 'statistics':
                return (
                    <TableView
                        {...commonProps}
                        title="Statistics"
                        description="One-to-Many: P-hacking evidence"
                        data={db.statistics}
                        columns={[
                            { header: 'ID', accessor: 'id' },
                            { header: 'Article', accessor: 'article_id' },
                            { header: 'Test Name', accessor: 'test_name' },
                            { header: 'Location', accessor: 'location_in_text' },
                            { header: 'Coefficient', accessor: 'coeff_reported' },
                            { header: 'SE', accessor: 'se_reported' },
                            { header: 'P-Value', accessor: 'p_value_reported' },
                            { header: 'Stars', accessor: 'stars_reported' },
                            { header: 'Z-Score', accessor: 'z_score' },
                            {
                                header: 'Just Sig?',
                                accessor: 'is_just_significant',
                                render: (row) => row.is_just_significant ? '⚠️ Yes' : 'No'
                            }
                        ]}
                    />
                );

            case 'funding_agencies':
                return (
                    <TableView
                        {...commonProps}
                        title="Funding Agencies"
                        description="Organizations that fund research"
                        data={db.funding_agencies}
                        columns={[
                            { header: 'ID', accessor: 'id' },
                            { header: 'Name', accessor: 'name' },
                            {
                                header: 'Corporate Conflict?',
                                accessor: 'is_corporate_conflict',
                                render: (row) => row.is_corporate_conflict ? '⚠️ Yes' : 'No'
                            }
                        ]}
                    />
                );

            case 'article_metrics':
                return (
                    <TableView
                        {...commonProps}
                        title="Article Metrics"
                        description="Citation and impact metrics for articles"
                        data={db.article_metrics}
                        columns={[
                            { header: 'Article ID', accessor: 'article_id' },
                            { header: 'Citations', accessor: 'citation_count' },
                            { header: 'Citations/Year', accessor: 'citation_velocity' },
                            { header: 'Altmetric Score', accessor: 'altmetric_score' }
                        ]}
                    />
                );

            default:
                return null;
        }
    };

    const MenuBtn = ({ id, label, icon: Icon, color }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center p-3 rounded-lg transition-all text-sm font-medium mb-1
        ${activeTab === id
                    ? `bg-slate-800 text-white border-l-4 ${color}`
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <Icon className={`w-4 h-4 mr-3 ${activeTab === id ? 'text-white' : 'text-slate-500'}`} />
            {label}
        </button>
    );

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">Loading data from database...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Data</p>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
            <div className="flex h-screen overflow-hidden">

                {/* Navigation Sidebar */}
                <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl flex-shrink-0">
                    <div className="p-6 border-b border-slate-800">
                        <h1 className="text-xl font-bold text-white tracking-tight">ResearchDB<span className="text-blue-500"></span></h1>
                        <p className="text-xs text-slate-500 mt-1">Full ERD Schema</p>
                    </div>

                    <nav className="flex-1 p-4 overflow-y-auto">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center p-3 rounded-lg transition-all mb-4 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
                        >
                            <BarChart className="w-5 h-5 mr-3" />
                            Dashboard
                        </button>

                        <div className="pt-2 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Main Entities
                        </div>
                        <MenuBtn id="articles" label="Articles" icon={FileText} color="border-blue-500" />
                        <MenuBtn id="design" label="Design & Methods" icon={ClipboardList} color="border-blue-300" />

                        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            People & Orgs
                        </div>
                        <MenuBtn id="authors" label="Authors" icon={Users} color="border-purple-500" />
                        <MenuBtn id="institutions" label="Institutions" icon={Landmark} color="border-purple-300" />

                        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            References & Data
                        </div>
                        <MenuBtn id="journals" label="Journals" icon={BookOpen} color="border-emerald-500" />
                        {/* <MenuBtn id="funding_agencies" label="Funding Agencies" icon={DollarSign} color="border-emerald-400" /> */}
                        <MenuBtn id="article_metrics" label="Article Metrics" icon={TrendingUp} color="border-amber-500" />
                        <MenuBtn id="statistics" label="Statistics" icon={Binary} color="border-rose-500" />
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto bg-slate-100">
                    <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-slate-800 capitalize">
                                {activeTab.replace('_', ' ')}
                            </h2>
                        </div>

                        {/* Search and Filter Bar - Only show on articles tab */}
                        {activeTab === 'articles' && (
                            <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by title, author, DOI..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    />
                                </div>
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Year</option>
                                    {[...new Set(db.articles.map(a => a.publication_year).filter(Boolean))]
                                        .sort((a, b) => b - a)
                                        .map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                </select>
                                <select
                                    value={filterDiscipline}
                                    onChange={(e) => setFilterDiscipline(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Discipline</option>
                                    {db.disciplines.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterMethod}
                                    onChange={(e) => setFilterMethod(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Method</option>
                                    {[...new Set(db.article_design.map(d => d.primary_method).filter(Boolean))]
                                        .sort()
                                        .map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                </select>
                                {(searchQuery || filterYear || filterDiscipline || filterMethod) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterYear('');
                                            setFilterDiscipline('');
                                            setFilterMethod('');
                                        }}
                                        className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        )}
                    </header>

                    <main className="p-8 max-w-7xl mx-auto">
                        {renderContent()}
                    </main>

                    {/* ADD/EDIT ENTRY MODAL */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={`${editingItem ? 'Edit' : 'Add New'} ${activeTab === 'entries' ? 'Entry' : activeTab.replace('_', ' ')}`}
                    >
                        <form onSubmit={handleSubmitEntry}>
                            {renderFormFields()}

                            {/* Author Management - Only for Articles */}
                            {activeTab === 'articles' && (
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Authors
                                    </label>

                                    {/* Author Chips */}
                                    {articleAuthors.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {articleAuthors.map((author, index) => (
                                                <div
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    <span>{author}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAuthor(index)}
                                                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Author Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={authorInput}
                                            onChange={(e) => setAuthorInput(e.target.value)}
                                            onKeyPress={handleAuthorKeyPress}
                                            placeholder="Enter author name and press Enter or Add"
                                            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAuthor}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Add multiple authors in order. They will appear in the Authors tab.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                                >
                                    {editingItem ? 'Update' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </Modal>


                    {/* VIEW DETAILS MODAL */}
                    <Modal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        title="Article Analysis"
                        maxWidth="max-w-4xl"
                    >
                        {viewingItem && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="border-b border-slate-100 pb-4">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded uppercase tracking-wide">
                                            {viewingItem.discipline_name || 'Discipline N/A'}
                                        </span>
                                        {viewingItem.metrics?.isSolo && (
                                            <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded uppercase tracking-wide flex items-center">
                                                <User className="w-3 h-3 mr-1" /> Solo Author
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                                        {viewingItem.title}
                                    </h2>

                                    <div className="flex items-center space-x-3 text-sm text-slate-500">
                                        <span className="flex items-center font-medium text-slate-700">
                                            <BookOpen className="w-4 h-4 mr-1" />
                                            {viewingItem.journal_details?.name || viewingItem.journal_id}
                                        </span>
                                        <span>•</span>
                                        <span>{viewingItem.publication_year || 'Year N/A'}</span>
                                        {viewingItem.doi && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{viewingItem.doi}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 relative">
                                        {editingSection === 'abstract' ? (
                                            <div>
                                                <textarea
                                                    className="w-full p-2 border border-blue-300 rounded text-sm text-slate-700"
                                                    rows={6}
                                                    value={editData}
                                                    onChange={handleAbstractChange}
                                                />
                                                <div className="flex justify-end mt-2 space-x-2">
                                                    <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-xs bg-white border rounded">Cancel</button>
                                                    <button onClick={handleSavePopupEdit} className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Save Abstract</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <span className="absolute top-2 left-2 text-3xl text-slate-200 font-serif">"</span>
                                                    <p className="text-sm text-slate-600 italic leading-relaxed pl-4 pr-8">
                                                        {viewingItem.abstract || "No abstract available."}
                                                    </p>
                                                    <button onClick={() => handleStartEditSection('abstract')} className="text-slate-400 hover:text-blue-600">
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left Column: Metrics, Design, Authors */}
                                    <div className="md:col-span-1 space-y-4">

                                        {/* Team Metrics Card */}
                                        <Card className="p-4 bg-white border-slate-200 shadow-sm">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Team Metrics</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-pink-50 rounded p-2 text-center">
                                                    <Percent className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                                                    <div className="text-lg font-bold text-pink-700">{viewingItem.metrics?.femaleShare}%</div>
                                                    <div className="text-[10px] text-pink-600 font-medium">Female Share</div>
                                                </div>
                                                <div className="bg-blue-50 rounded p-2 text-center">
                                                    <Briefcase className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                                    <div className="text-lg font-bold text-blue-700">{viewingItem.metrics?.avgExp}</div>
                                                    <div className="text-[10px] text-blue-600 font-medium">Avg Years Exp.</div>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Design Card */}
                                        <Card className="p-4 bg-emerald-50 border-emerald-100 relative">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center">
                                                    <ClipboardList className="w-3 h-3 mr-2" />
                                                    Methodology
                                                </h4>
                                                {!editingSection && (
                                                    <button onClick={() => handleStartEditSection('design')} className="text-emerald-600 hover:text-emerald-800">
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>

                                            {editingSection === 'design' ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Method</label>
                                                        <input
                                                            type="text"
                                                            name="primary_method"
                                                            value={editData.primary_method || ''}
                                                            onChange={handlePopupInputChange}
                                                            className="w-full text-xs p-1 border rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data Type</label>
                                                        <input
                                                            type="text"
                                                            name="data_type"
                                                            value={editData.data_type || ''}
                                                            onChange={handlePopupInputChange}
                                                            className="w-full text-xs p-1 border rounded"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <label className="flex items-center text-xs">
                                                            <input type="checkbox" name="is_empirical" checked={editData.is_empirical || false} onChange={handlePopupInputChange} className="mr-1" />
                                                            Empirical
                                                        </label>
                                                        <label className="flex items-center text-xs">
                                                            <input type="checkbox" name="replication_available" checked={editData.replication_available || false} onChange={handlePopupInputChange} className="mr-1" />
                                                            Replication
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-end space-x-2 pt-2">
                                                        <button onClick={() => setEditingSection(null)} className="p-1 bg-white rounded border hover:bg-slate-50 text-slate-500"><XCircle className="w-4 h-4" /></button>
                                                        <button onClick={handleSavePopupEdit} className="p-1 bg-emerald-600 rounded text-white hover:bg-emerald-700"><Save className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Method:</span>
                                                        <span className="font-medium text-slate-800">{viewingItem.design_details?.primary_method || '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Data:</span>
                                                        <span className="font-medium text-slate-800">{viewingItem.design_details?.data_type || '-'}</span>
                                                    </div>
                                                    <div className="pt-2 flex flex-wrap gap-2">
                                                        {viewingItem.design_details?.is_empirical && (
                                                            <span className="px-2 py-1 bg-white text-emerald-700 text-xs rounded border border-emerald-200 flex items-center">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Empirical
                                                            </span>
                                                        )}
                                                        {viewingItem.design_details?.replication_available && (
                                                            <span className="px-2 py-1 bg-white text-emerald-700 text-xs rounded border border-emerald-200 flex items-center">
                                                                <Download className="w-3 h-3 mr-1" /> Replicable
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>

                                        {/* Authors List */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                <span>Authors ({viewingItem.metrics?.totalAuthors})</span>
                                                <Users className="w-3 h-3" />
                                            </h4>
                                            <div className="space-y-2">
                                                {viewingItem.authors_list && viewingItem.authors_list.length > 0 ? (
                                                    viewingItem.authors_list.map((author, i) => (
                                                        <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg hover:shadow-md transition-shadow">
                                                            <div className="flex items-center mb-1">
                                                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 mr-2 border border-slate-200">
                                                                    {author.full_name.charAt(0)}
                                                                </div>
                                                                <div className="truncate flex-1">
                                                                    <p className="text-sm font-bold text-slate-800 truncate">{author.full_name}</p>
                                                                </div>
                                                                {author.gender === 'F' && <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 rounded-full ml-1">F</span>}
                                                            </div>
                                                            <p className="text-xs text-slate-500 flex items-center truncate mb-2">
                                                                <Landmark className="w-3 h-3 mr-1 text-slate-400" />
                                                                {author.institution_name || 'Inst. N/A'}
                                                            </p>

                                                            <div className="flex items-center space-x-3 border-t border-slate-50 pt-2">
                                                                <div className="text-[10px] text-slate-500 flex items-center" title="Experience">
                                                                    <GraduationCap className="w-3 h-3 mr-1 text-slate-400" />
                                                                    <span className="font-semibold text-slate-700 mr-1">{author.experience || 0}</span> yrs
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 flex items-center" title="Citations">
                                                                    <Award className="w-3 h-3 mr-1 text-slate-400" />
                                                                    <span className="font-semibold text-slate-700 mr-1">{author.citations || 0}</span> cits
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">No authors linked</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Statistics */}
                                    <div className="md:col-span-2">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                                                <Binary className="w-3 h-3 mr-2" />
                                                Statistical Evidence
                                            </h4>
                                            {!editingSection && (
                                                <button onClick={() => handleStartEditSection('stats')} className="text-blue-600 hover:text-blue-800">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                            )}
                                            {editingSection === 'stats' && (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => setEditingSection(null)} className="p-1 bg-white rounded border hover:bg-slate-50 text-slate-500"><XCircle className="w-4 h-4" /></button>
                                                    <button onClick={handleSavePopupEdit} className="p-1 bg-blue-600 rounded text-white hover:bg-blue-700"><Save className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-slate-600">Test</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Mu</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">SD</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Coeff</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">P-Value</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-600 text-center">Sig.</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {editingSection === 'stats' ? (
                                                        editData.map((stat, i) => (
                                                            <tr key={i} className="hover:bg-slate-50">
                                                                <td className="px-2 py-2">
                                                                    <input name="test_name" value={stat.test_name || ''} onChange={(e) => handlePopupInputChange(e, i)} className="w-full text-xs p-1 border rounded" placeholder="Test" />
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <input name="mu" type="number" step="0.0001" value={stat.mu || ''} onChange={(e) => handlePopupInputChange(e, i)} className="w-full text-xs p-1 border rounded text-right" placeholder="Mu" />
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <input name="sd" type="number" step="0.0001" value={stat.sd || ''} onChange={(e) => handlePopupInputChange(e, i)} className="w-full text-xs p-1 border rounded text-right" placeholder="SD" />
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <input name="coefficient" type="number" step="0.0001" value={stat.coefficient || ''} onChange={(e) => handlePopupInputChange(e, i)} className="w-full text-xs p-1 border rounded text-right" placeholder="Coeff" />
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <input name="p_value_reported" type="number" step="0.0001" value={stat.p_value_reported || ''} onChange={(e) => handlePopupInputChange(e, i)} className="w-full text-xs p-1 border rounded text-right" placeholder="P-Val" />
                                                                </td>
                                                                <td className="px-4 py-2 text-center text-xs text-slate-400">
                                                                    auto
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        viewingItem.stats_list && viewingItem.stats_list.length > 0 ? (
                                                            viewingItem.stats_list.map((stat, i) => {
                                                                const pVal = parseFloat(stat.p_value_reported);
                                                                const isSig = !isNaN(pVal) && pVal < 0.05;
                                                                const isHighSig = !isNaN(pVal) && pVal < 0.01;

                                                                return (
                                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="px-4 py-2 font-medium text-slate-700">{stat.test_name || '-'}</td>
                                                                        <td className="px-4 py-2 text-slate-600 font-mono text-xs text-right">{stat.mu || '-'}</td>
                                                                        <td className="px-4 py-2 text-slate-600 font-mono text-xs text-right">{stat.sd || '-'}</td>
                                                                        <td className="px-4 py-2 text-slate-600 font-mono text-xs text-right">{stat.coefficient || '-'}</td>
                                                                        <td className="px-4 py-2 text-slate-600 font-mono text-xs text-right">{stat.p_value_reported || '-'}</td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            {isHighSig ? (
                                                                                <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">***</span>
                                                                            ) : isSig ? (
                                                                                <span className="inline-block px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded">**</span>
                                                                            ) : (
                                                                                <span className="text-slate-300 text-[10px]">ns</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="px-4 py-12 text-center text-slate-400 italic">
                                                                    No statistics recorded for this article.
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                </div>
            </div>
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmModalConfig.onConfirm}
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
