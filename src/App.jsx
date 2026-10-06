import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  Gift, 
  Heart, 
  Share2, 
  Sparkles, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Users, 
  Lock, 
  Copy, 
  Search, 
  DollarSign, 
  X,
  MessageCircle,
  ShoppingBag,
  RefreshCw,
  Check,
  Globe,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  LogOut,
  Smile,
  ShieldCheck,
  ChevronRight,
  Camera,
  Phone,
  MapPin
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyATNwJ2CFzOdDBn6i5Og-fk71T7kOwCbiI",
  authDomain: "lista-presentes-amiga.firebaseapp.com",
  projectId: "lista-presentes-amiga",
  storageBucket: "lista-presentes-amiga.firebasestorage.app",
  messagingSenderId: "215917694181",
  appId: "1:215917694181:web:e0a8c91d534aece02d980c",
  measurementId: "G-TS246BJL3Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'amigas-wishlist';

// Chave para persistir qual amiga está acessando neste celular/computador
const STORAGE_PROFILE_KEY = 'lista_presentes_amigas_active_id';

const AVATAR_COLORS = [
  { name: 'Pink Choque', bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-300', dot: 'bg-pink-500' },
  { name: 'Fúcsia Vibrante', bg: 'bg-fuchsia-600', text: 'text-white', border: 'border-fuchsia-300', dot: 'bg-fuchsia-600' },
  { name: 'Rosa Carmim', bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-300', dot: 'bg-rose-500' },
  { name: 'Roxo Elétrico', bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-300', dot: 'bg-purple-600' },
  { name: 'Violeta Intenso', bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-300', dot: 'bg-violet-600' },
  { name: 'Azul Royal', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-300', dot: 'bg-blue-600' },
  { name: 'Índigo Profundo', bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-300', dot: 'bg-indigo-600' },
  { name: 'Azul Celeste Vivo', bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-300', dot: 'bg-sky-500' },
  { name: 'Ciano Neon', bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  { name: 'Verde Tiffany', bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-300', dot: 'bg-teal-500' },
  { name: 'Verde Esmeralda', bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  { name: 'Verde Bandeira', bg: 'bg-green-600', text: 'text-white', border: 'border-green-300', dot: 'bg-green-600' },
  { name: 'Verde Limão Vivo', bg: 'bg-lime-600', text: 'text-white', border: 'border-lime-300', dot: 'bg-lime-600' },
  { name: 'Amarelo Ouro Solar', bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-300', dot: 'bg-amber-500' },
  { name: 'Laranja Fogo', bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-300', dot: 'bg-orange-500' },
  { name: 'Coral Radiante', bg: 'bg-red-500', text: 'text-white', border: 'border-red-300', dot: 'bg-red-500' },
  { name: 'Vermelho Cereja', bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-400', dot: 'bg-rose-600' },
  { name: 'Vermelho Paixão', bg: 'bg-red-600', text: 'text-white', border: 'border-red-400', dot: 'bg-red-600' },
  { name: 'Púrpura Glamour', bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-400', dot: 'bg-purple-700' },
  { name: 'Azul Meia-Noite', bg: 'bg-blue-700', text: 'text-white', border: 'border-blue-400', dot: 'bg-blue-700' },
];

function Avatar({ profile, size = "md", className = "" }) {
  const color = AVATAR_COLORS[profile?.colorIndex || 0] || AVATAR_COLORS[0];
  const sizeClasses = {
    sm: "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs",
    md: "w-9 h-9 rounded-xl text-xs",
    lg: "w-12 h-12 rounded-2xl text-base",
    xl: "w-14 h-14 rounded-2xl text-xl",
  }[size] || "w-10 h-10 rounded-2xl text-sm";

  if (profile?.photoUrl) {
    return (
      <div className={`${sizeClasses} overflow-hidden border-2 ${color.border} shadow-sm flex-shrink-0 relative ${className}`}>
        <img 
          src={profile.photoUrl} 
          alt={profile.name || 'Amiga'} 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} flex items-center justify-center font-bold uppercase shadow-sm ${color.bg} ${color.text} border-2 ${color.border} flex-shrink-0 ${className}`}>
      {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'AM'}
    </div>
  );
}

const CATEGORIES = [
  'Roupas & Acessórios',
  'Beleza & Maquiagem',
  'Livros & Papelaria',
  'Decoração & Casa',
  'Calçados & Bolsas',
  'Tecnologia & Gadgets',
  'Experiências & Comidinhas',
  'Outros Desejos'
];

const OCCASIONS = [
  { id: 'aniversario', label: 'Aniversário 🎂', badge: 'bg-pink-100 text-pink-700 border-pink-200', icon: '🎂' },
  { id: 'natal', label: 'Amigo Oculto de Natal 🎄', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🎄' },
  { id: 'ambas', label: 'Ambas as Listas ✨', badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: '✨' }
];

const PRIORITIES = [
  { id: 'alta', label: 'Muito Desejado ❤️‍🔥', badge: 'bg-rose-500 text-white' },
  { id: 'media', label: 'Quero Muito ✨', badge: 'bg-amber-500 text-white' },
  { id: 'baixa', label: 'Legal Ter 🎈', badge: 'bg-purple-500 text-white' }
];

// -------------------------------------------------------------
// Funções Utilitárias: Análise e Notificação de Aniversário
// -------------------------------------------------------------
export function parseBirthday(str) {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim().toLowerCase();
  if (!s) return null;

  const monthMap = {
    'jan': 1, 'janeiro': 1,
    'fev': 2, 'fevereiro': 2,
    'mar': 3, 'marco': 3, 'março': 3,
    'abr': 4, 'abril': 4,
    'mai': 5, 'maio': 5,
    'jun': 6, 'junho': 6,
    'jul': 7, 'julho': 7,
    'ago': 8, 'agosto': 8,
    'set': 9, 'setembro': 9,
    'out': 10, 'outubro': 10,
    'nov': 11, 'novembro': 11,
    'dez': 12, 'dezembro': 12,
  };

  // 1. Tenta formato com nome do mês por extenso ou abreviado:
  // Ex: "14 de Outubro", "14 de out", "14/out", "05 de Agosto", "1º de maio", "14-outubro"
  const textMatch = s.match(/(\d{1,2})(?:º|o|°)?\s*(?:de\s*|\/|\-)?\s*([a-zçãéíóú]+)/i);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const rawMonth = textMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const month = monthMap[rawMonth] || monthMap[rawMonth.slice(0, 3)];
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }

  // 2. Tenta formato numérico DD/MM ou DD/MM/AAAA (com /, - ou .)
  const numMatch = s.match(/^(\d{1,2})[\/\.-](\d{1,2})(?:[\/\.-]\d{2,4})?$/);
  if (numMatch) {
    const p1 = parseInt(numMatch[1], 10);
    const p2 = parseInt(numMatch[2], 10);
    if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
      return { day: p1, month: p2 };
    }
    if (p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      return { day: p2, month: p1 };
    }
  }

  // 3. Formato ISO AAAA-MM-DD
  const isoMatch = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (isoMatch) {
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }

  return null;
}

export function getUpcomingBirthdayInfo(birthdayStr) {
  const parsed = parseBirthday(birthdayStr);
  if (!parsed) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentYear = today.getFullYear();

  // Data do aniversário no ano corrente
  let targetDate = new Date(currentYear, parsed.month - 1, parsed.day);
  targetDate.setHours(0, 0, 0, 0);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  let diffDays = Math.round((targetDate.getTime() - today.getTime()) / MS_PER_DAY);

  // Se o aniversário já passou no ano corrente, calcula para o próximo ano
  if (diffDays < 0) {
    targetDate = new Date(currentYear + 1, parsed.month - 1, parsed.day);
    diffDays = Math.round((targetDate.getTime() - today.getTime()) / MS_PER_DAY);
  }

  // Regra: notificação ativa 1 mês antes da data (até 30 dias de antecedência)
  if (diffDays >= 0 && diffDays <= 30) {
    return {
      day: parsed.day,
      month: parsed.month,
      daysLeft: diffDays,
      isToday: diffDays === 0,
      isTomorrow: diffDays === 1,
    };
  }

  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [firestoreError, setFirestoreError] = useState(null);

  // Perfil ativo persistido no LocalStorage do navegador
  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_PROFILE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [profilesList, setProfilesList] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  // Modais
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Controle detalhado do modal de perfil: criar novo vs editar
  const [profileModalState, setProfileModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    profileData: null
  });
  
  const [switchProfileModalOpen, setSwitchProfileModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [firebaseHelpModalOpen, setFirebaseHelpModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filtros
  const [activeOccasion, setActiveOccasion] = useState('todas');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [showOnlyUnreserved, setShowOnlyUnreserved] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Atualiza activeProfileId e salva no localStorage
  const handleSetActiveProfile = (profileId) => {
    setActiveProfileId(profileId);
    try {
      if (profileId) {
        localStorage.setItem(STORAGE_PROFILE_KEY, profileId);
      } else {
        localStorage.removeItem(STORAGE_PROFILE_KEY);
      }
    } catch (e) {
      console.warn("Não foi possível acessar localStorage:", e);
    }
  };

  // Inicialização de Autenticação Firebase
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
        setAuthError(null);
      } catch (err) {
        console.warn("Aviso de Auth no Firebase:", err);
        if (isMounted) {
          setAuthError(err.code || err.message || 'Falha ao autenticar anonimamente');
        }
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) setUser(currentUser);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Listeners em tempo real do Firestore (rodando mesmo se auth estiver demorando, permitindo maior resiliência)
  useEffect(() => {
    // Coleção pública de perfis
    const profilesCol = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    const unsubProfiles = onSnapshot(profilesCol, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProfilesList(docs);
      setFirestoreError(null);

      // Validação do perfil ativo: se ainda existe na lista do banco
      setActiveProfileId(prevId => {
        if (prevId && docs.some(p => p.id === prevId)) {
          return prevId;
        }
        // Se o id salvo não existe mais nos docs, limpa
        if (prevId && docs.length > 0 && !docs.some(p => p.id === prevId)) {
          try { localStorage.removeItem(STORAGE_PROFILE_KEY); } catch {}
          return null;
        }
        return prevId || null;
      });
    }, (error) => {
      console.error("Erro ao carregar perfis:", error);
      setFirestoreError(error.message || 'Erro de permissão no Firestore');
    });

    // Coleção pública de presentes
    const itemsCol = collection(db, 'artifacts', appId, 'public', 'data', 'gifts');
    const unsubItems = onSnapshot(itemsCol, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setWishlists(items);
    }, (error) => {
      console.error("Erro ao carregar presentes:", error);
    });

    return () => {
      unsubProfiles();
      unsubItems();
    };
  }, []);

  // Perfil ativo atual
  const currentProfile = useMemo(() => {
    if (!activeProfileId) return null;
    return profilesList.find(p => p.id === activeProfileId) || null;
  }, [profilesList, activeProfileId]);

  // Contagem de amigas com aniversário nos próximos 30 dias (1 mês de antecedência)
  const upcomingBirthdaysCount = useMemo(() => {
    return profilesList.filter(p => getUpcomingBirthdayInfo(p.birthday) !== null).length;
  }, [profilesList]);

  // Abertura explícita do modal para NOVO PERFIL
  const handleOpenCreateProfile = () => {
    setProfileModalState({
      isOpen: true,
      mode: 'create',
      profileData: null
    });
  };

  // Abertura explícita do modal para EDITAR PERFIL
  const handleOpenEditProfile = (profileToEdit = currentProfile) => {
    if (!profileToEdit) {
      handleOpenCreateProfile();
      return;
    }
    setProfileModalState({
      isOpen: true,
      mode: 'edit',
      profileData: profileToEdit
    });
  };

  // Salvamento de Perfil (Criação de NOVO ou Atualização de EXISTENTE)
  const handleSaveProfile = async (formData, mode, profileId) => {
    try {
      const profilesCol = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
      const cleanName = formData.name.trim();

      if (mode === 'create') {
        // CRIAÇÃO REAL DE UM NOVO PERFIL NO FIRESTORE
        const newProfileData = {
          name: cleanName || 'Amiga',
          birthday: formData.birthday?.trim() || '',
          notes: formData.notes?.trim() || '',
          phone: formData.phone?.trim() || '',
          address: formData.address?.trim() || '',
          colorIndex: Number.isInteger(formData.colorIndex) ? formData.colorIndex : 0,
          photoUrl: formData.photoUrl || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const newDocRef = await addDoc(profilesCol, newProfileData);
        
        // Define o perfil recém-criado como o perfil ativo deste usuário
        handleSetActiveProfile(newDocRef.id);
        setProfileModalState({ isOpen: false, mode: 'create', profileData: null });
        showToast(`Bem-vinda, ${cleanName}! Seu perfil foi criado com sucesso! 🎉`);
      } else {
        // EDIÇÃO DO PERFIL SELECIONADO
        const targetId = profileId || currentProfile?.id;
        if (!targetId) {
          showToast('Erro: Nenhum perfil selecionado para edição.');
          return;
        }

        const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', targetId);
        await updateDoc(profileRef, {
          name: cleanName || 'Amiga',
          birthday: formData.birthday?.trim() || '',
          notes: formData.notes?.trim() || '',
          phone: formData.phone?.trim() || '',
          address: formData.address?.trim() || '',
          colorIndex: Number.isInteger(formData.colorIndex) ? formData.colorIndex : 0,
          photoUrl: formData.photoUrl || '',
          updatedAt: new Date().toISOString()
        });

        // Também atualiza o nome do autor nos presentes que ela já cadastrou
        const myItems = wishlists.filter(w => w.userId === targetId);
        myItems.forEach(async (item) => {
          if (item.authorName !== cleanName) {
            try {
              const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'gifts', item.id);
              await updateDoc(itemRef, { authorName: cleanName });
            } catch {}
          }
        });

        setProfileModalState({ isOpen: false, mode: 'edit', profileData: null });
        showToast(`Perfil de ${cleanName} atualizado com sucesso! ✨`);
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      showToast('Erro ao salvar no Firebase. Verifique sua conexão ou permissões.');
      if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
        setFirebaseHelpModalOpen(true);
      }
    }
  };

  // Exclusão de um perfil
  const handleDeleteProfile = async (profileId) => {
    try {
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profileId);
      await deleteDoc(profileRef);

      // Deleta presentes vinculados
      const associatedGifts = wishlists.filter(g => g.userId === profileId);
      for (const gift of associatedGifts) {
        try {
          const giftRef = doc(db, 'artifacts', appId, 'public', 'data', 'gifts', gift.id);
          await deleteDoc(giftRef);
        } catch {}
      }

      // Se apagou o perfil ativo, limpa
      if (activeProfileId === profileId) {
        handleSetActiveProfile(null);
      }

      setDeleteConfirmProfile(null);
      setProfileModalState({ isOpen: false, mode: 'create', profileData: null });
      showToast('Perfil removido com sucesso.');
    } catch (err) {
      console.error("Erro ao excluir perfil:", err);
      showToast('Erro ao excluir perfil.');
    }
  };

  // Salvamento de Presente
  const handleSaveGift = async (itemData) => {
    if (!currentProfile) {
      handleOpenCreateProfile();
      showToast('Cadastre ou selecione seu perfil primeiro para montar sua lista!');
      return;
    }

    try {
      if (editingItem && editingItem.id) {
        const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'gifts', editingItem.id);
        await updateDoc(itemRef, {
          ...itemData,
          updatedAt: new Date().toISOString()
        });
        showToast('Item atualizado com sucesso! 🎁');
      } else {
        const itemsCol = collection(db, 'artifacts', appId, 'public', 'data', 'gifts');
        await addDoc(itemsCol, {
          ...itemData,
          userId: currentProfile.id,
          authorName: currentProfile.name,
          reservedBy: null,
          reservedByName: null,
          createdAt: new Date().toISOString()
        });
        showToast('Novo desejo adicionado! ✨');
      }
      setItemModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Erro ao salvar presente:", err);
      showToast('Erro ao salvar item.');
      if (err.message && (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED'))) {
        setFirebaseHelpModalOpen(true);
      }
    }
  };

  // Exclusão de Presente
  const handleDeleteGift = async (itemId) => {
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'gifts', itemId);
      await deleteDoc(itemRef);
      setDeleteConfirmItem(null);
      showToast('Item removido com sucesso.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir item.');
    }
  };

  // Reserva Secreta de Presente
  const handleToggleReserve = async (item) => {
    if (!currentProfile) {
      setSwitchProfileModalOpen(true);
      showToast('Identifique-se primeiro para reservar presentes para suas amigas! 💕');
      return;
    }

    if (item.userId === currentProfile.id) {
      showToast('Você não pode reservar um presente da sua própria lista! 😉');
      return;
    }

    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'gifts', item.id);
      const isAlreadyReservedByMe = item.reservedBy === currentProfile.id;

      if (isAlreadyReservedByMe) {
        await updateDoc(itemRef, {
          reservedBy: null,
          reservedByName: null
        });
        showToast('Reserva cancelada. O presente voltou a ficar disponível.');
      } else {
        await updateDoc(itemRef, {
          reservedBy: currentProfile.id,
          reservedByName: currentProfile.name || 'Uma amiga secreta'
        });
        showToast('Presente reservado! A dona da lista não saberá quem reservou! 🤫🎁');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar reserva.');
    }
  };

  // Presentes do perfil ativo
  const myItems = useMemo(() => {
    if (!currentProfile) return [];
    return wishlists.filter(item => item.userId === currentProfile.id);
  }, [wishlists, currentProfile]);

  // Amiga selecionada no mural
  const activeFriend = useMemo(() => {
    if (!selectedFriendId) return null;
    return profilesList.find(p => p.id === selectedFriendId) || null;
  }, [selectedFriendId, profilesList]);

  const activeFriendItems = useMemo(() => {
    if (!selectedFriendId) return [];
    return wishlists.filter(item => item.userId === selectedFriendId);
  }, [selectedFriendId, wishlists]);

  // Filtros de presentes
  const filteredActiveItems = useMemo(() => {
    const source = selectedFriendId ? activeFriendItems : wishlists;
    return source.filter(item => {
      const itemOccasion = item.listType || 'aniversario';
      const matchesOccasion = activeOccasion === 'todas' || 
        itemOccasion === 'ambas' || 
        itemOccasion === activeOccasion;

      const matchesSearch = !searchFilter || 
        item.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.authorName?.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCategory = categoryFilter === 'Todas' || item.category === categoryFilter;
      const matchesPriority = priorityFilter === 'Todas' || item.priority === priorityFilter;
      const matchesReserve = !showOnlyUnreserved || !item.reservedBy;

      return matchesOccasion && matchesSearch && matchesCategory && matchesPriority && matchesReserve;
    });
  }, [selectedFriendId, activeFriendItems, wishlists, activeOccasion, searchFilter, categoryFilter, priorityFilter, showOnlyUnreserved]);

  if (loadingAuth && profilesList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin mb-4 shadow-sm"></div>
        <h2 className="text-xl font-bold text-slate-800 font-serif">Conectando às listas das amigas...</h2>
        <p className="text-xs text-rose-500 mt-2">Carregando desejos e aniversários ✨</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-purple-50/50 to-pink-50/70 text-slate-800 flex flex-col font-sans selection:bg-rose-200">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-3 transition-all border border-slate-700/50 animate-bounce-once max-w-sm">
          <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Alerta de Configuração Firebase (se houver erro ou aviso) */}
      {(authError || firestoreError) && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Aviso de Conexão:</strong> O Firebase pode precisar de configuração (Login Anônimo ou Regras do Firestore).
            </span>
          </div>
          <button
            onClick={() => setFirebaseHelpModalOpen(true)}
            className="underline font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1"
          >
            <span>Como Configurar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-2">
          
          {/* Logo e Nome */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => { setActiveTab('feed'); setSelectedFriendId(null); }}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-700 via-pink-700 to-purple-800 bg-clip-text text-transparent font-serif tracking-tight">
                  Lista de Presentes das Luluzinhas
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full hidden md:inline-block">
                  Clube VIP
                </span>
              </div>
              <p className="text-[11px] text-rose-500 font-medium hidden sm:block">
                Aniversários 🎂 & Amigo Oculto de Natal 🎄
              </p>
            </div>
          </div>

          {/* Ações do Topo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Botão Enviar Link */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition flex items-center space-x-1.5 active:scale-95"
              title="Compartilhar aplicativo com as amigas"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden xs:inline">Enviar Link</span>
            </button>

            {/* Perfil Ativo / Trocar Perfil / Criar Perfil */}
            {currentProfile ? (
              <div className="flex items-center bg-white border border-rose-200 rounded-full shadow-sm p-1 pr-2 sm:pr-3 space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => handleOpenEditProfile(currentProfile)}
                  className="flex items-center space-x-2 hover:opacity-85 transition"
                  title="Editar meus dados e preferências"
                >
                  <Avatar profile={currentProfile} size="sm" />
                  <span className="text-xs font-bold text-slate-800 max-w-[70px] sm:max-w-[120px] truncate text-left">
                    {currentProfile.name}
                  </span>
                </button>

                <div className="h-4 w-[1px] bg-slate-200"></div>

                <button
                  onClick={() => setSwitchProfileModalOpen(true)}
                  className="text-slate-400 hover:text-purple-600 p-1 rounded-full transition hover:bg-purple-50"
                  title="Trocar quem está usando ou cadastrar nova amiga"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleOpenCreateProfile}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition flex items-center space-x-1.5 active:scale-95 animate-pulse"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Meu Perfil</span>
                </button>
                {profilesList.length > 0 && (
                  <button
                    onClick={() => setSwitchProfileModalOpen(true)}
                    className="px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition"
                    title="Selecione seu nome se já estiver cadastrada"
                  >
                    <span>Já tenho perfil</span>
                  </button>
                )}
              </div>
            )}

            {/* Botão de Ajuda / Firebase Config */}
            <button
              onClick={() => setFirebaseHelpModalOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition hidden sm:flex items-center justify-center"
              title="Ajuda e Configuração do Firebase"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Navegação (Mural vs Minha Lista) */}
        <div className="max-w-6xl mx-auto px-4 flex border-t border-rose-100/60 space-x-2 sm:space-x-4 pt-1">
          <button
            onClick={() => { setActiveTab('feed'); setSelectedFriendId(null); }}
            className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'feed' && !selectedFriendId
                ? 'border-rose-500 text-rose-700 bg-rose-50/60'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mural das Luluzinhas</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
              {profilesList.length}
            </span>
            {upcomingBirthdaysCount > 0 && (
              <span 
                className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black flex items-center space-x-1 shadow-sm animate-pulse ml-1" 
                title={`${upcomingBirthdaysCount} amiga(s) fazendo aniversário nos próximos 30 dias!`}
              >
                <span>🎂</span>
                <span>{upcomingBirthdaysCount}</span>
              </span>
            )}
          </button>

          <button
            onClick={() => { 
              if (!currentProfile) {
                setSwitchProfileModalOpen(true);
                showToast('Cadastre ou selecione quem você é para gerenciar suas listas! 💕');
                return;
              }
              setActiveTab('my-list'); 
              setSelectedFriendId(null); 
            }}
            className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'my-list'
                ? 'border-rose-500 text-rose-700 bg-rose-50/60'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Minhas Listas</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
              {myItems.length}
            </span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Banner de Boas-Vindas */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-rose-200/50 mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-rose-100 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Presentes & Surpresas Secretas</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-serif">
                {currentProfile ? `Oi, ${currentProfile.name}! 💖` : 'Bem-vindas ao Clube de Presentes! 🎁'}
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 mt-1 leading-relaxed">
                {currentProfile 
                  ? 'Organize seus desejos de Aniversário e Natal, e reserve presentes para suas amigas em segredo!'
                  : 'Cada amiga tem seu próprio espaço com suas listas. Cadastre-se ou escolha seu nome para começar!'}
              </p>
            </div>
            
            <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
              {currentProfile ? (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemModalOpen(true);
                  }}
                  className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center space-x-2 transition active:scale-95"
                >
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>Adicionar Novo Desejo</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenCreateProfile}
                  className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center space-x-2 transition active:scale-95"
                >
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>Cadastrar Meu Perfil</span>
                </button>
              )}

              <button
                onClick={handleOpenCreateProfile}
                className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition border border-white/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Cadastrar Nova Amiga</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navegação entre Visualizações */}
        {activeTab === 'my-list' ? (
          <MyListView 
            myItems={myItems}
            profile={currentProfile}
            onOpenAddModal={() => { setEditingItem(null); setItemModalOpen(true); }}
            onEditItem={(item) => { setEditingItem(item); setItemModalOpen(true); }}
            onDeleteItem={(itemId) => setDeleteConfirmItem(itemId)}
            onOpenIdentify={() => setSwitchProfileModalOpen(true)}
            onOpenCreateProfile={handleOpenCreateProfile}
          />
        ) : selectedFriendId && activeFriend ? (
          <FriendDetailView 
            friend={activeFriend}
            items={filteredActiveItems}
            currentProfileId={currentProfile?.id}
            onBack={() => setSelectedFriendId(null)}
            onToggleReserve={handleToggleReserve}
            activeOccasion={activeOccasion}
            setActiveOccasion={setActiveOccasion}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            showOnlyUnreserved={showOnlyUnreserved}
            setShowOnlyUnreserved={setShowOnlyUnreserved}
          />
        ) : (
          <FriendsFeedView 
            profiles={profilesList}
            wishlists={wishlists}
            currentProfileId={currentProfile?.id}
            onSelectFriend={(fId) => setSelectedFriendId(fId)}
            onOpenCreateProfile={handleOpenCreateProfile}
            onEditProfile={handleOpenEditProfile}
            onSwitchProfile={(fId) => {
              handleSetActiveProfile(fId);
              const found = profilesList.find(p => p.id === fId);
              showToast(`Conectada como ${found?.name || 'Amiga'}! ✨`);
            }}
          />
        )}
      </main>

      {/* Modal de Item (Novo ou Edição) */}
      {itemModalOpen && (
        <ItemModal 
          isOpen={itemModalOpen}
          initialData={editingItem}
          onClose={() => { setItemModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveGift}
        />
      )}

      {/* Modal de Perfil (Criação ou Edição) */}
      {profileModalState.isOpen && (
        <ProfileModal 
          isOpen={profileModalState.isOpen}
          mode={profileModalState.mode}
          profileData={profileModalState.profileData}
          onClose={() => setProfileModalState({ isOpen: false, mode: 'create', profileData: null })}
          onSave={handleSaveProfile}
          onDeleteProfile={(profileId) => {
            const p = profilesList.find(item => item.id === profileId);
            setDeleteConfirmProfile(p || { id: profileId, name: 'este perfil' });
          }}
        />
      )}

      {/* Modal de Troca / Seleção de Perfil */}
      {switchProfileModalOpen && (
        <SwitchProfileModal 
          isOpen={switchProfileModalOpen}
          profiles={profilesList}
          currentProfileId={currentProfile?.id}
          onClose={() => setSwitchProfileModalOpen(false)}
          onSelectProfile={(pId) => {
            handleSetActiveProfile(pId);
            setSwitchProfileModalOpen(false);
            const p = profilesList.find(x => x.id === pId);
            showToast(`Conectada como ${p?.name || 'Amiga'}! 💖`);
          }}
          onOpenCreateProfile={() => {
            setSwitchProfileModalOpen(false);
            handleOpenCreateProfile();
          }}
          onLogout={() => {
            handleSetActiveProfile(null);
            setSwitchProfileModalOpen(false);
            showToast('Você desconectou. Navegando como visitante.');
          }}
        />
      )}

      {/* Modal de Confirmação para Excluir Presente */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-rose-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-serif">Excluir presente?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Este item será removido definitivamente da sua lista.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteGift(deleteConfirmItem)}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition shadow-md"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Excluir Perfil */}
      {deleteConfirmProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-rose-100 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-serif">
              Excluir perfil de {deleteConfirmProfile.name}?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
              Tem certeza? Todos os presentes cadastrados por este perfil também serão removidos.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeleteConfirmProfile(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProfile(deleteConfirmProfile.id)}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition shadow-md"
              >
                Sim, Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuda de Compartilhamento */}
      {shareModalOpen && (
        <ShareGuideModal 
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          showToast={showToast}
        />
      )}

      {/* Modal de Instruções Firebase */}
      {firebaseHelpModalOpen && (
        <FirebaseHelpModal 
          isOpen={firebaseHelpModalOpen}
          onClose={() => setFirebaseHelpModalOpen(false)}
          showToast={showToast}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-rose-100/80 py-6 text-center text-xs text-rose-400 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Feito com carinho para o clube das amigas • Dados sincronizados em tempo real 💖</p>
          <button
            onClick={() => setFirebaseHelpModalOpen(true)}
            className="text-[11px] text-slate-400 hover:text-purple-600 underline flex items-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Status do Banco de Dados & Ajuda</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Mural das Luluzinhas (Feed)
// -------------------------------------------------------------
function FriendsFeedView({ 
  profiles, 
  wishlists, 
  currentProfileId, 
  onSelectFriend, 
  onOpenCreateProfile,
  onEditProfile,
  onSwitchProfile 
}) {
  const [friendSearch, setFriendSearch] = useState('');

  const filteredFriends = useMemo(() => {
    if (!friendSearch.trim()) return profiles;
    return profiles.filter(p => 
      p.name?.toLowerCase().includes(friendSearch.toLowerCase()) ||
      p.notes?.toLowerCase().includes(friendSearch.toLowerCase()) ||
      p.birthday?.toLowerCase().includes(friendSearch.toLowerCase())
    );
  }, [profiles, friendSearch]);

  // Lista de amigas com aniversário nos próximos 30 dias (1 mês de antecedência)
  const upcomingBirthdays = useMemo(() => {
    return profiles
      .map(p => ({ profile: p, info: getUpcomingBirthdayInfo(p.birthday) }))
      .filter(item => item.info !== null)
      .sort((a, b) => a.info.daysLeft - b.info.daysLeft);
  }, [profiles]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-serif">
            Mural das Luluzinhas ({profiles.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Clique na amiga para ver a lista de presentes ou clique em "Sou eu" para alternar seu acesso.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {profiles.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar amiga..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-rose-400"
              />
            </div>
          )}

          <button
            onClick={onOpenCreateProfile}
            className="bg-white border-2 border-rose-300 hover:border-rose-500 text-rose-700 hover:bg-rose-50 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5 whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Cadastrar Nova Amiga</span>
          </button>
        </div>
      </div>

      {/* Banner de Celebração de Aniversários Próximos (1 mês antes) */}
      {upcomingBirthdays.length > 0 && !friendSearch.trim() && (
        <div className="mb-6 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-rose-500/20 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
              🎂
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/30 text-white px-2 py-0.5 rounded-full">
                  Festa Chegando
                </span>
                <span className="text-xs text-rose-100 font-medium">
                  {upcomingBirthdays.length === 1 ? '1 amiga faz aniversário este mês' : `${upcomingBirthdays.length} aniversários próximos`}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold mt-0.5 text-white">
                {upcomingBirthdays.map(({ profile, info }) => 
                  info.isToday 
                    ? `🎉 ${profile.name} (É HOJE!)` 
                    : info.isTomorrow
                      ? `🎈 ${profile.name} (Amanhã!)`
                      : `🎂 ${profile.name} (em ${info.daysLeft} dias)`
                ).join(' • ')}
              </h4>
              <p className="text-xs text-rose-100/90 mt-0.5">
                Confira a lista de presentes e prepare as surpresas com antecedência! 🎁✨
              </p>
            </div>
          </div>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-rose-200 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 font-serif">Nenhuma amiga cadastrada ainda</h4>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            Seja a primeira a cadastrar seu perfil! Em seguida, compartilhe o link no grupo do WhatsApp para as outras amigas adicionarem seus nomes.
          </p>
          <button
            onClick={onOpenCreateProfile}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-md transition"
          >
            + Cadastrar Meu Perfil Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          
          {/* Card de Adição Rápida de Nova Amiga */}
          <div 
            onClick={onOpenCreateProfile}
            className="bg-white/60 hover:bg-white rounded-3xl p-5 border-2 border-dashed border-rose-200 hover:border-rose-400 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center group min-h-[190px] shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition">
              Cadastrar Nova Amiga
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Clique aqui para adicionar mais uma amiga ao clube
            </p>
          </div>

          {filteredFriends.map(friend => {
            const friendItems = wishlists.filter(w => w.userId === friend.id);
            const niverCount = friendItems.filter(i => !i.listType || i.listType === 'aniversario' || i.listType === 'ambas').length;
            const natalCount = friendItems.filter(i => i.listType === 'natal' || i.listType === 'ambas').length;
            const color = AVATAR_COLORS[friend.colorIndex || 0] || AVATAR_COLORS[0];
            const isMe = friend.id === currentProfileId;
            const bdayInfo = getUpcomingBirthdayInfo(friend.birthday);

            return (
              <div 
                key={friend.id}
                className={`group bg-white rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between relative ${
                  bdayInfo 
                    ? 'border-rose-300 ring-2 ring-rose-400/50 shadow-md hover:shadow-xl' 
                    : 'border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-xl'
                }`}
              >
                {/* Notificação Flutuante de Aniversário Próximo (1 mês de antecedência) */}
                {bdayInfo && (
                  <div className="absolute -top-3.5 right-4 z-20 pointer-events-none">
                    {bdayInfo.isToday ? (
                      <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-lg shadow-rose-500/40 border-2 border-white animate-bounce tracking-wide">
                        <span className="text-sm">🎉</span>
                        <span>É HOJE! PARABÉNS!</span>
                        <span className="text-sm">🎂</span>
                      </div>
                    ) : bdayInfo.isTomorrow ? (
                      <div className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-md shadow-pink-500/30 border-2 border-white animate-pulse tracking-wide">
                        <span className="text-sm">🎂</span>
                        <span>É AMANHÃ!</span>
                        <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-black">24h</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-md shadow-pink-500/25 border-2 border-white group-hover:scale-105 transition-transform tracking-wide">
                        <span className="text-xs">🎂</span>
                        <span>Níver em {bdayInfo.daysLeft} {bdayInfo.daysLeft === 1 ? 'dia' : 'dias'}!</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-extrabold">🎈</span>
                      </div>
                    )}
                  </div>
                )}

                <div className={`absolute top-0 left-0 right-0 h-2.5 rounded-t-3xl ${color.bg}`} />
                
                <div>
                  <div className="flex items-start justify-between mb-3 mt-1.5">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => onSelectFriend(friend.id)}
                    >
                      <Avatar profile={friend} size="lg" />
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-slate-800 text-base group-hover:text-rose-600 transition truncate">
                            {friend.name}
                          </h4>
                          {isMe && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                              Você
                            </span>
                          )}
                        </div>
                        {friend.birthday && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                            <Calendar className="w-3 h-3 text-rose-400 flex-shrink-0" />
                            <span className="truncate">Niver: {friend.birthday}</span>
                            {bdayInfo && (
                              <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                                bdayInfo.isToday 
                                  ? 'bg-amber-100 text-amber-800 animate-pulse font-extrabold' 
                                  : 'bg-rose-100 text-rose-700'
                              }`}>
                                {bdayInfo.isToday ? 'Hoje!' : `em ${bdayInfo.daysLeft}d`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isMe ? (
                      <button
                        onClick={() => onEditProfile(friend)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                        title="Editar meus dados"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSwitchProfile(friend.id)}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl transition flex-shrink-0"
                        title="Se você é essa amiga, clique para assumir este perfil"
                      >
                        Sou eu
                      </button>
                    )}
                  </div>

                  {friend.notes && (
                    <p className="text-xs text-slate-600 italic bg-rose-50/40 p-2.5 rounded-xl border border-rose-100/50 mb-3 line-clamp-2">
                      "{friend.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 font-medium border border-pink-100 flex items-center space-x-1">
                      <span>🎂</span>
                      <span>{niverCount} niver</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100 flex items-center space-x-1">
                      <span>🎄</span>
                      <span>{natalCount} natal</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                    <Gift className="w-4 h-4 text-rose-500" />
                    <span>{friendItems.length} {friendItems.length === 1 ? 'presente' : 'presentes'}</span>
                  </div>
                  
                  <button 
                    onClick={() => onSelectFriend(friend.id)}
                    className="text-xs font-bold text-rose-600 flex items-center space-x-1 group-hover:translate-x-1 transition"
                  >
                    <span>Ver lista</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Lista Detalhada de uma Amiga
// -------------------------------------------------------------
function FriendDetailView({ 
  friend, 
  items, 
  currentProfileId, 
  onBack, 
  onToggleReserve,
  activeOccasion,
  setActiveOccasion,
  searchFilter,
  setSearchFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  showOnlyUnreserved,
  setShowOnlyUnreserved
}) {
  const color = AVATAR_COLORS[friend.colorIndex || 0] || AVATAR_COLORS[0];
  const isMe = friend.id === currentProfileId;
  const bdayInfo = getUpcomingBirthdayInfo(friend.birthday);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition font-semibold text-xs sm:text-sm flex items-center space-x-1"
          >
            <span>← Voltar</span>
          </button>
          
          <Avatar profile={friend} size="xl" />

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Lista de {friend.name}
              </h2>
              {isMe && (
                <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Sua Lista
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              {friend.birthday && (
                <span className="flex items-center space-x-1.5 bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-lg font-semibold border border-rose-200">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Aniversário: {friend.birthday}</span>
                  {bdayInfo && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm ${
                      bdayInfo.isToday ? 'bg-amber-500 animate-bounce' : 'bg-rose-500'
                    }`}>
                      {bdayInfo.isToday ? '🎉 É HOJE!' : `🎂 em ${bdayInfo.daysLeft}d`}
                    </span>
                  )}
                </span>
              )}
              <span>{items.length} presentes cadastrados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {friend.notes && (
            <div className="text-xs bg-amber-50/90 border border-amber-200 text-amber-900 p-3.5 rounded-2xl max-w-sm">
              <span className="font-bold block mb-0.5 text-amber-950">Dicas & Tamanhos de {friend.name}:</span>
              <p className="italic leading-relaxed">"{friend.notes}"</p>
            </div>
          )}

          {(friend.phone || friend.address) && (
            <div className="text-xs bg-purple-50/90 border border-purple-200 text-purple-950 p-3.5 rounded-2xl max-w-sm space-y-2">
              <span className="font-bold block text-purple-900">📦 Dados para Entrega & Contato:</span>
              {friend.phone && (
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800">{friend.phone}</span>
                </div>
              )}
              {friend.address && (
                <div className="flex items-start space-x-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Endereço de entrega:</span>
                    <p className="leading-relaxed select-all font-medium text-[11px] bg-white/80 p-2 rounded-xl border border-purple-100">
                      {friend.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banner de Celebração de Aniversário Próximo (1 mês antes) */}
      {bdayInfo && (
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white rounded-3xl p-4 sm:p-5 shadow-lg shadow-rose-500/20 border border-white/20 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
              {bdayInfo.isToday ? '🎉' : '🎂'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/30 text-white px-2 py-0.5 rounded-full">
                  {bdayInfo.isToday ? 'É Hoje!' : 'Aniversário Chegando'}
                </span>
                <span className="text-xs text-rose-100 font-medium">
                  {bdayInfo.isToday 
                    ? 'Dia de muita festa!' 
                    : bdayInfo.isTomorrow 
                      ? 'Faltam menos de 24h!' 
                      : `Faltam ${bdayInfo.daysLeft} dias`}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base mt-0.5">
                {bdayInfo.isToday 
                  ? `Hoje é o dia de ${friend.name}! Parabéns! 🥳` 
                  : bdayInfo.isTomorrow
                    ? `Amanhã é o aniversário de ${friend.name}! 🎈`
                    : `O aniversário de ${friend.name} é em ${bdayInfo.daysLeft} dias! 🎈`}
              </h4>
              <p className="text-xs text-rose-100 mt-0.5">
                {isMe 
                  ? 'Seu aniversário está pertinho! Mantenha seus presentes favoritos atualizados para suas amigas.'
                  : 'Falta menos de 1 mês! Aproveite para escolher e reservar o presente dela abaixo.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Abas de Ocasião */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-rose-100 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveOccasion('todas')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            activeOccasion === 'todas'
              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎁 Todas as Listas</span>
        </button>

        <button
          onClick={() => setActiveOccasion('aniversario')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            activeOccasion === 'aniversario'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-rose-50'
          }`}
        >
          <span>🎂 Lista de Aniversário</span>
        </button>

        <button
          onClick={() => setActiveOccasion('natal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            activeOccasion === 'natal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <span>🎄 Amigo Oculto de Natal</span>
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por presente ou detalhe..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-400"
          >
            <option value="Todas">Todas Categorias</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-rose-400"
          >
            <option value="Todas">Todas Prioridades</option>
            {PRIORITIES.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          {!isMe && (
            <label className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-100 select-none">
              <input
                type="checkbox"
                checked={showOnlyUnreserved}
                onChange={(e) => setShowOnlyUnreserved(e.target.checked)}
                className="rounded text-rose-500 focus:ring-rose-400"
              />
              <span>Apenas disponíveis</span>
            </label>
          )}
        </div>
      </div>

      {/* Grid de Presentes */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-rose-200">
          <Gift className="w-12 h-12 text-rose-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700 font-serif">Nenhum item encontrado</h4>
          <p className="text-xs text-slate-500 mt-1">Essa lista ainda está vazia para esta ocasião ou com esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => {
            const isReserved = Boolean(item.reservedBy);
            const isReservedByMe = item.reservedBy === currentProfileId;
            const priorityObj = PRIORITIES.find(p => p.id === item.priority) || PRIORITIES[1];
            const occasionObj = OCCASIONS.find(o => o.id === item.listType) || OCCASIONS[0];

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isReserved && !isMe 
                    ? 'border-purple-200 bg-purple-50/20' 
                    : 'border-rose-100'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${occasionObj.badge}`}>
                      {occasionObj.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityObj.badge}`}>
                      {priorityObj.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    {item.category || 'Geral'}
                  </span>

                  <h3 className="font-bold text-slate-800 text-base leading-snug mb-1">
                    {item.title}
                  </h3>

                  {item.price && (
                    <div className="text-xs font-semibold text-emerald-700 mb-2 flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{item.price}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 mb-3">
                      <span className="font-semibold block text-[10px] uppercase text-slate-400">Detalhes / Tamanho / Cor:</span>
                      <p className="leading-relaxed">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col space-y-3">
                  {item.link && (
                    <a
                      href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold bg-rose-50/80 hover:bg-rose-100 py-1.5 px-3 rounded-xl transition"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ver link do presente</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}

                  {!isMe ? (
                    <div className="pt-1">
                      {isReserved ? (
                        <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-2.5">
                          <div className="flex items-center space-x-1.5 text-xs text-purple-900">
                            <Lock className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span className="font-semibold">
                              {isReservedByMe ? 'Você reservou este presente! 🎁' : 'Reservado em segredo! 🤫'}
                            </span>
                          </div>
                          {isReservedByMe && (
                            <button
                              onClick={() => onToggleReserve(item)}
                              className="text-[11px] font-bold text-rose-600 hover:underline ml-2"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onToggleReserve(item)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 active:scale-95"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Vou dar esse presente! (Reservar)</span>
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400 text-center mt-1">
                        * {friend.name} não verá quem reservou para não estragar a surpresa!
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400 italic pt-1">
                      <span>Este é um item da sua própria lista.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Minhas Listas
// -------------------------------------------------------------
function MyListView({ 
  myItems, 
  profile, 
  onOpenAddModal, 
  onEditItem, 
  onDeleteItem, 
  onOpenIdentify,
  onOpenCreateProfile 
}) {
  const [selectedListTab, setSelectedListTab] = useState('todas');

  const filteredMyItems = useMemo(() => {
    if (selectedListTab === 'todas') return myItems;
    return myItems.filter(item => {
      const type = item.listType || 'aniversario';
      return type === 'ambas' || type === selectedListTab;
    });
  }, [myItems, selectedListTab]);

  const niverTotal = myItems.filter(i => !i.listType || i.listType === 'aniversario' || i.listType === 'ambas').length;
  const natalTotal = myItems.filter(i => i.listType === 'natal' || i.listType === 'ambas').length;

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-rose-200 shadow-sm max-w-md mx-auto my-8">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-serif">Quem é você? 💕</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
          Para ver ou adicionar presentes na sua lista, selecione seu perfil existente ou cadastre um novo!
        </p>
        <div className="space-y-2">
          <button
            onClick={onOpenCreateProfile}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs py-3 rounded-2xl shadow-md transition"
          >
            + Cadastrar Meu Perfil Agora
          </button>
          <button
            onClick={onOpenIdentify}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-2xl transition"
          >
            Já estou na lista (Escolher meu nome)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            Minhas Listas de Desejos ({profile.name})
          </h2>
          <p className="text-xs text-slate-500">
            Adicione e organize o que você quer ganhar no seu Aniversário e no Natal ✨
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Desejo</span>
        </button>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-white border border-rose-100 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setSelectedListTab('todas')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            selectedListTab === 'todas'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Todos os Desejos</span>
          <span className="bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
            {myItems.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedListTab('aniversario')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            selectedListTab === 'aniversario'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-rose-50'
          }`}
        >
          <span>🎂 Lista de Aniversário</span>
          <span className="bg-rose-200 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
            {niverTotal}
          </span>
        </button>

        <button
          onClick={() => setSelectedListTab('natal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            selectedListTab === 'natal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <span>🎄 Amigo Oculto de Natal</span>
          <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
            {natalTotal}
          </span>
        </button>
      </div>

      {filteredMyItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-rose-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-serif">Sua lista está vazia por enquanto</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Cadastre os mimos que você gostaria de ganhar para que suas amigas saibam exatamente o que te dar!
          </p>
          <button
            onClick={onOpenAddModal}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition shadow-md"
          >
            Adicionar meu primeiro presente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMyItems.map(item => {
            const priorityObj = PRIORITIES.find(p => p.id === item.priority) || PRIORITIES[1];
            const occasionObj = OCCASIONS.find(o => o.id === item.listType) || OCCASIONS[0];

            return (
              <div 
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${occasionObj.badge}`}>
                      {occasionObj.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityObj.badge}`}>
                      {priorityObj.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    {item.category || 'Geral'}
                  </span>

                  <h3 className="font-bold text-slate-800 text-base leading-snug mb-1">
                    {item.title}
                  </h3>

                  {item.price && (
                    <div className="text-xs font-semibold text-emerald-700 mb-2 flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{item.price}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 mb-3">
                      <span className="font-semibold block text-[10px] uppercase text-slate-400">Detalhes / Tamanho / Cor:</span>
                      <p className="leading-relaxed">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {item.link && (
                    <a
                      href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold bg-rose-50/80 hover:bg-rose-100 py-1.5 px-3 rounded-xl transition w-full"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ver link cadastrado</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition text-xs font-semibold flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-semibold flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Modal de Perfil (CRIAR NOVO vs EDITAR)
// -------------------------------------------------------------
function ProfileModal({ isOpen, mode, profileData, onClose, onSave, onDeleteProfile }) {
  const isCreate = mode === 'create';
  
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa o formulário de acordo com o modo
  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        setName('');
        setBirthday('');
        setPhone('');
        setAddress('');
        setNotes('');
        setColorIndex(Math.floor(Math.random() * AVATAR_COLORS.length));
        setPhotoUrl('');
      } else {
        setName(profileData?.name || '');
        setBirthday(profileData?.birthday || '');
        setPhone(profileData?.phone || '');
        setAddress(profileData?.address || '');
        setNotes(profileData?.notes || '');
        setColorIndex(profileData?.colorIndex || 0);
        setPhotoUrl(profileData?.photoUrl || '');
      }
      setIsSubmitting(false);
    }
  }, [isOpen, isCreate, profileData]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoUrl(compressed);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ name, birthday, notes, colorIndex, photoUrl, phone, address }, mode, profileData?.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-rose-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-rose-100">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isCreate ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'}`}>
              {isCreate ? <Plus className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">
                {isCreate ? 'Cadastrar Novo Perfil' : 'Editar Meus Dados'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isCreate ? 'Crie seu perfil para montar sua lista de desejos' : 'Atualize suas informações e preferências'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* Seção de Foto de Perfil */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Sua Foto de Perfil
            </label>
            <div className="flex items-center space-x-3.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="relative flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm overflow-hidden border-2 ${AVATAR_COLORS[colorIndex]?.border || 'border-pink-300'} ${!photoUrl ? (AVATAR_COLORS[colorIndex]?.bg || 'bg-pink-500') + ' ' + (AVATAR_COLORS[colorIndex]?.text || 'text-white') : 'bg-slate-200'}`}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span>{name.trim() ? name.trim().slice(0, 2).toUpperCase() : 'AM'}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer bg-white border border-rose-200 hover:border-rose-400 text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95">
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>{photoUrl ? 'Trocar Foto' : 'Escolher Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition font-semibold"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {photoUrl ? 'Foto selecionada! Ela aparecerá no seu avatar.' : 'Escolha uma foto da sua galeria ou use o avatar colorido'}
                </span>
              </div>
            </div>
          </div>

          {/* Campo Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Como suas amigas te chamam? *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bia, Carol, Mari, Ju..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white transition"
              autoFocus
            />
          </div>

          {/* Campo Aniversário */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Data de Aniversário (Dia e Mês)
            </label>
            <input
              type="text"
              placeholder="Ex: 14 de Outubro ou 25/11"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white transition"
            />
          </div>

          {/* Campo Telefone / WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span>Telefone / WhatsApp</span>
              <span className="text-[10px] text-slate-400 font-normal">opcional</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="Ex: (11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Campo Endereço Completo para Entrega */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span>Endereço Completo para Entregas</span>
              <span className="text-[10px] text-rose-500 font-semibold">para entrega de mimos</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <textarea
                rows={2}
                placeholder="Rua, Número, Complemento, Bairro, Cidade - UF, CEP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white transition"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              💡 Suas amigas verão esse endereço quando forem comprar e enviar presentes para você!
            </span>
          </div>

          {/* Seletor de Cor do Avatar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Cor de destaque ({AVATAR_COLORS.length} opções)
              </label>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {AVATAR_COLORS[colorIndex]?.name || 'Personalizado'}
              </span>
            </div>

            {/* Grade de 20 Cores Vivas */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto">
              {AVATAR_COLORS.map((col, idx) => (
                <button
                  type="button"
                  key={col.name}
                  onClick={() => setColorIndex(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${col.bg} border-2 flex items-center justify-center transition-all mx-auto shadow-sm ${
                    colorIndex === idx ? 'border-slate-900 scale-125 shadow-md ring-2 ring-white' : 'border-white/60 hover:scale-115'
                  }`}
                  title={col.name}
                >
                  {colorIndex === idx && <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Campo Dicas e Medidas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Dicas gerais / Medidas / O que você ama
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Calço 36, blusa M. Amo livros, papelaria fofa e maquiagem!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white transition"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {!isCreate && onDeleteProfile ? (
              <button
                type="button"
                onClick={() => onDeleteProfile(profileData?.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Perfil</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>Salvando...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>{isCreate ? 'Cadastrar Perfil ✨' : 'Salvar Alterações'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Modal de Troca / Seleção de Perfil
// -------------------------------------------------------------
function SwitchProfileModal({ 
  isOpen, 
  profiles, 
  currentProfileId, 
  onClose, 
  onSelectProfile, 
  onOpenCreateProfile,
  onLogout 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">Quem está usando agora?</h3>
              <p className="text-[11px] text-slate-500">Selecione o seu nome na lista:</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {profiles.map(p => {
              const color = AVATAR_COLORS[p.colorIndex || 0] || AVATAR_COLORS[0];
              const isCurrent = p.id === currentProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between transition ${
                    isCurrent
                      ? 'border-purple-500 bg-purple-50/60 shadow-sm ring-1 ring-purple-300'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar profile={p} size="md" />
                    <div className="text-left">
                      <span className="font-bold text-sm text-slate-800 block">{p.name}</span>
                      {p.birthday && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                          <span>🎂 {p.birthday}</span>
                          {(() => {
                            const info = getUpcomingBirthdayInfo(p.birthday);
                            if (!info) return null;
                            return (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                info.isToday ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {info.isToday ? 'Hoje!' : `em ${info.daysLeft}d`}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Você está aqui ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={onOpenCreateProfile}
              className="w-full py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Sou nova por aqui (Cadastrar Novo Perfil)</span>
            </button>

            {currentProfileId && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar (Navegar como visitante)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Modal de Item (Presente)
// -------------------------------------------------------------
function ItemModal({ isOpen, initialData, onClose, onSave }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [listType, setListType] = useState(initialData?.listType || 'aniversario');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [price, setPrice] = useState(initialData?.price || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [priority, setPriority] = useState(initialData?.priority || 'alta');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setListType(initialData?.listType || 'aniversario');
      setCategory(initialData?.category || CATEGORIES[0]);
      setPrice(initialData?.price || '');
      setLink(initialData?.link || '');
      setNotes(initialData?.notes || '');
      setPriority(initialData?.priority || 'alta');
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        listType,
        category,
        price: price.trim(),
        link: link.trim(),
        notes: notes.trim(),
        priority
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-rose-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-serif">
              {initialData ? 'Editar Presente' : 'Novo Desejo de Presente'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Para qual lista é esse desejo? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OCCASIONS.map(occ => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setListType(occ.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition flex flex-col items-center justify-center space-y-0.5 ${
                    listType === occ.id
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-300 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{occ.icon}</span>
                  <span className="text-[11px] leading-tight">{occ.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome do Presente / Produto *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Livro, Perfume, Calçado..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Prioridade de Desejo
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Valor Estimado (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: R$ 80,00 ou até R$ 100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Link da Loja (opcional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Observações (Tamanho, Cor, Especificação)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Tamanho M, cor bege ou verde oliva. Se não achar essa marca, pode ser similar!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Modal de Compartilhamento do Link
// -------------------------------------------------------------
function ShareGuideModal({ isOpen, onClose, showToast }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const isInternalPreview = useMemo(() => {
    try {
      const href = window.location.href.toLowerCase();
      return (
        href.includes('googleusercontent.com') ||
        href.includes('blob:') ||
        href.includes('/proxy') ||
        href.includes('preview')
      );
    } catch {
      return true;
    }
  }, []);

  const safeShareUrl = useMemo(() => {
    if (customUrl.trim()) return customUrl.trim();
    try {
      if (window.top && window.top.location.href && !isInternalPreview) {
        return window.top.location.href.split('#')[0];
      }
    } catch {}
    return window.location.href.split('?')[0].split('#')[0];
  }, [customUrl, isInternalPreview]);

  const copyToClipboard = async (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast('Link copiado com sucesso! 🎉');
    } catch (err) {
      console.error(err);
      showToast('Por favor, selecione e copie o texto manualmente.');
    }
  };

  const handleWhatsapp = () => {
    const textToSend = `Meninas, criei nossa lista de presentes para Aniversários e Amigo Oculto de Natal! 🎁💖\n\nEntre pelo link para cadastrar seus pedidos e ver a lista de todo mundo:\n${safeShareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToSend)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-rose-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">Como Compartilhar o Link</h3>
              <p className="text-xs text-slate-500">Envie no grupo do WhatsApp das amigas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Link da Lista:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={safeShareUrl}
                value={customUrl || safeShareUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 text-slate-700 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(customUrl || safeShareUrl)}
                className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow transition flex items-center space-x-1"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleWhatsapp}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar no WhatsApp das Amigas</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente: Modal de Ajuda / Configuração do Firebase
// -------------------------------------------------------------
function FirebaseHelpModal({ isOpen, onClose, showToast }) {
  const [copiedRule, setCopiedRule] = useState(false);

  const rulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;

  const copyRules = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = rulesText;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopiedRule(true);
      setTimeout(() => setCopiedRule(false), 2500);
      showToast('Regras copiadas! Cole na aba Regras do Firestore.');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-rose-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">Configuração do Firebase</h3>
              <p className="text-xs text-slate-500">Como garantir que todas as amigas salvem e vejam em tempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-600">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-purple-900 text-sm">Passo 1: Ativar Login Anônimo</h4>
            <p className="leading-relaxed">
              No console do Firebase (<strong>Authentication → Sign-in method</strong>), ative o provedor <strong>"Anônimo" (Anonymous)</strong>. Isso permite que cada celular conecte com segurança sem precisar digitar senha.
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-rose-900 text-sm">Passo 2: Regras do Firestore</h4>
              <button
                type="button"
                onClick={copyRules}
                className="text-xs bg-rose-200 hover:bg-rose-300 text-rose-900 font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
              >
                {copiedRule ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRule ? 'Copiado!' : 'Copiar Regras'}</span>
              </button>
            </div>
            <p className="leading-relaxed">
              No menu <strong>Firestore Database → Regras (Rules)</strong>, cole o código abaixo e clique em <strong>Publicar</strong>:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              {rulesText}
            </pre>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Entendido!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
