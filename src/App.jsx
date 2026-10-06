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
  deleteDoc 
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
  AlertCircle
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

const AVATAR_COLORS = [
  { name: 'Rosa Pastel', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  { name: 'Lavanda', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { name: 'Pêssego', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { name: 'Menta', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  { name: 'Azul Céu', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  { name: 'Lilás', bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300' },
];

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

export default function App() {
  const [user, setUser] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [profilesList, setProfilesList] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [switchProfileModalOpen, setSwitchProfileModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [activeOccasion, setActiveOccasion] = useState('todas');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [showOnlyUnreserved, setShowOnlyUnreserved] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
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

  useEffect(() => {
    if (!user) return;

    // Strict path for public profiles
    const profilesCol = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    const unsubProfiles = onSnapshot(profilesCol, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProfilesList(docs);

      setActiveProfileId(prevId => {
        if (prevId && docs.some(p => p.id === prevId)) return prevId;
        const matched = docs.find(p => p.id === user.uid);
        if (matched) return matched.id;
        if (docs.length > 0 && !prevId) return docs[0].id;
        return null;
      });
    }, (error) => {
      console.error("Erro ao carregar perfis:", error);
    });

    // Strict path for public wishlists
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
  }, [user]);

  const currentProfile = useMemo(() => {
    return profilesList.find(p => p.id === activeProfileId) || null;
  }, [profilesList, activeProfileId]);

  const handleSaveProfile = async (formData) => {
    if (!user) return;
    try {
      const targetId = currentProfile?.id || user.uid;
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', targetId);
      const dataToSave = {
        name: formData.name.trim() || 'Amiga',
        birthday: formData.birthday || '',
        notes: formData.notes || '',
        colorIndex: formData.colorIndex || 0,
        updatedAt: new Date().toISOString()
      };
      await setDoc(profileRef, dataToSave, { merge: true });
      setActiveProfileId(targetId);
      setProfileModalOpen(false);
      showToast('Perfil salvo com sucesso! Seus dados estão seguros! ✨');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar perfil.');
    }
  };

  const handleSaveGift = async (itemData) => {
    if (!user) return;
    if (!currentProfile) {
      setProfileModalOpen(true);
      showToast('Crie seu perfil primeiro para associar seus presentes!');
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
      console.error("Erro ao salvar:", err);
      showToast('Erro ao salvar item.');
    }
  };

  const handleDeleteGift = async (itemId) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'gifts', itemId);
      await deleteDoc(itemRef);
      showToast('Item removido com sucesso.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir item.');
    }
  };

  const handleToggleReserve = async (item) => {
    if (!user || !currentProfile) return;
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
        showToast('Reserva cancelada.');
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

  const myItems = useMemo(() => {
    if (!currentProfile) return [];
    return wishlists.filter(item => item.userId === currentProfile.id);
  }, [wishlists, currentProfile]);

  const activeFriend = useMemo(() => {
    if (!selectedFriendId) return null;
    return profilesList.find(p => p.id === selectedFriendId) || null;
  }, [selectedFriendId, profilesList]);

  const activeFriendItems = useMemo(() => {
    if (!selectedFriendId) return [];
    return wishlists.filter(item => item.userId === selectedFriendId);
  }, [selectedFriendId, wishlists]);

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

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-rose-50/50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-full border-4 border-rose-300 border-t-rose-600 animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-rose-900 font-serif">Conectando às listas das amigas...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/60 via-purple-50/40 to-pink-50/60 text-slate-800 flex flex-col font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-3 transition-all">
          <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab('feed'); setSelectedFriendId(null); }}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-purple-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent font-serif tracking-tight">
                Wishlist das Amigas
              </h1>
              <p className="text-xs text-rose-500 font-medium hidden sm:block">Aniversários & Amigo Oculto de Natal ✨</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition flex items-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar Link</span>
            </button>

            {currentProfile ? (
              <div className="flex items-center bg-white border border-rose-200 rounded-full shadow-sm p-1 pr-3 space-x-2">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center space-x-2 hover:opacity-80 transition"
                  title="Editar meus dados"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${AVATAR_COLORS[currentProfile?.colorIndex || 0].bg} ${AVATAR_COLORS[currentProfile?.colorIndex || 0].text}`}>
                    {currentProfile.name.slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[85px] sm:max-w-[120px] truncate">
                    {currentProfile.name}
                  </span>
                </button>

                <button
                  onClick={() => setSwitchProfileModalOpen(true)}
                  className="text-slate-400 hover:text-purple-600 p-1 rounded-full transition"
                  title="Trocar quem está usando"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-full shadow hover:bg-rose-700 transition"
              >
                + Criar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 flex border-t border-rose-50 space-x-2 sm:space-x-4 pt-1">
          <button
            onClick={() => { setActiveTab('feed'); setSelectedFriendId(null); }}
            className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-t-lg transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'feed' && !selectedFriendId
                ? 'border-rose-500 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mural das Amigas</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {profilesList.length}
            </span>
          </button>

          <button
            onClick={() => { 
              if (!currentProfile) {
                setProfileModalOpen(true);
                showToast('Cadastre seu perfil para acessar sua lista!');
                return;
              }
              setActiveTab('my-list'); 
              setSelectedFriendId(null); 
            }}
            className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-t-lg transition flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'my-list'
                ? 'border-rose-500 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Minhas Listas</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {myItems.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Banner with direct link share help */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-3xl p-5 sm:p-7 text-white shadow-lg shadow-rose-200/50 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase text-rose-100 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Banco de Dados Online Ativo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif">
                {currentProfile ? `Oi, ${currentProfile.name}! Seus desejos estão salvos 💖` : 'Bem-vinda ao Clube de Presentes! 🎁'}
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 mt-1">
                Duas listas em um só lugar: 🎂 Aniversários e 🎄 Amigo Oculto de Natal. Os presentes reservados ficam em segredo!
              </p>
            </div>
            
            <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (!currentProfile) {
                    setProfileModalOpen(true);
                    return;
                  }
                  setEditingItem(null);
                  setItemModalOpen(true);
                }}
                className="bg-white text-rose-700 hover:bg-rose-50 font-semibold px-4 py-2.5 rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-rose-600" />
                <span>Adicionar Novo Desejo</span>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition border border-white/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Como Compartilhar o Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'my-list' ? (
          <MyListView 
            myItems={myItems}
            profile={currentProfile}
            onOpenAddModal={() => { setEditingItem(null); setItemModalOpen(true); }}
            onEditItem={(item) => { setEditingItem(item); setItemModalOpen(true); }}
            onDeleteItem={handleDeleteGift}
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
            onOpenMyProfile={() => setProfileModalOpen(true)}
            onSwitchProfile={(fId) => {
              setActiveProfileId(fId);
              showToast('Perfil alternado com sucesso!');
            }}
          />
        )}
      </main>

      {/* Item Modal */}
      {itemModalOpen && (
        <ItemModal 
          isOpen={itemModalOpen}
          initialData={editingItem}
          onClose={() => { setItemModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveGift}
        />
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <ProfileModal 
          isOpen={profileModalOpen}
          initialData={currentProfile}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Switch Profile Modal */}
      {switchProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-serif">Quem está usando agora?</h3>
              </div>
              <button 
                onClick={() => setSwitchProfileModalOpen(false)} 
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-500 mb-3">
                Selecione o seu nome para gerenciar suas listas:
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {profilesList.map(p => {
                  const color = AVATAR_COLORS[p.colorIndex || 0] || AVATAR_COLORS[0];
                  const isCurrent = p.id === currentProfile?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProfileId(p.id);
                        setSwitchProfileModalOpen(false);
                        showToast(`Conectada como ${p.name}! ✨`);
                      }}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between transition ${
                        isCurrent
                          ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${color.bg} ${color.text} border ${color.border}`}>
                          {p.name.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-sm text-slate-800 block">{p.name}</span>
                          {p.birthday && <span className="text-[11px] text-slate-400">🎂 {p.birthday}</span>}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Ativa
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSwitchProfileModalOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Perfil de Amiga</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share & Deployment Guide Modal */}
      {shareModalOpen && (
        <ShareGuideModal 
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          showToast={showToast}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-rose-100 py-6 text-center text-xs text-rose-400 bg-white/40">
        <p>Feito com amor para o clube das amigas • Dados sincronizados em tempo real 💖</p>
      </footer>
    </div>
  );
}

function ShareGuideModal({ isOpen, onClose, showToast }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Check if current location is an internal preview sandbox
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
    // In top frame or deployed link, window.top or parent href
    try {
      if (window.top && window.top.location.href && !isInternalPreview) {
        return window.top.location.href.split('#')[0];
      }
    } catch {
      // Cross-origin restriction fallback
    }
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
      showToast('Copiado para a área de transferência!');
    } catch (err) {
      console.error(err);
      showToast('Por favor, selecione e copie o texto manualmente.');
    }
  };

  const handleWhatsapp = () => {
    const textToSend = isInternalPreview && !customUrl
      ? `Meninas, criei nossa Lista de Desejos (Aniversário e Amigo Oculto de Natal)! Acessem nosso aplicativo para preencher!`
      : `Meninas, criei nossa lista de presentes para Aniversários e Amigo Oculto de Natal! 🎁💖\n\nEntre pelo link para cadastrar seus pedidos e ver a lista de todo mundo:\n${safeShareUrl}`;
    
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
              <p className="text-xs text-slate-500">Envie para o grupo das amigas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Explanation about preview 404 */}
          {isInternalPreview && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Por que deu o erro 404 ao abrir o link?</span>
              </div>
              <p className="leading-relaxed">
                Este ambiente é uma <strong>área de edição e visualização de código</strong>. O endereço interno termina em códigos protegidos que a Google não permite abrir em outra aba sem autenticação.
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 space-y-1">
                <span className="font-semibold block text-amber-950">Como ter o link público permanente para todas:</span>
                <p>
                  Basta você publicar este arquivo em qualquer hospedagem gratuita como <strong>Vercel</strong>, <strong>Netlify</strong> ou <strong>GitHub Pages</strong>. O aplicativo já tem o banco de dados online configurado!
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isInternalPreview ? 'Link da sua página (quando publicada):' : 'Link do Clube das Amigas:'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={isInternalPreview ? "Cole aqui o link do seu site (ex: https://minha-wishlist.vercel.app)" : safeShareUrl}
                value={customUrl || (!isInternalPreview ? safeShareUrl : '')}
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
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
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

function FriendsFeedView({ profiles, wishlists, currentProfileId, onSelectFriend, onOpenMyProfile, onSwitchProfile }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 font-serif">Mural de Amigas ({profiles.length})</h3>
          <p className="text-xs text-slate-500">Veja a lista de cada uma ou clique em "Sou eu" para alternar seu acesso</p>
        </div>

        <button
          onClick={onOpenMyProfile}
          className="bg-white border border-rose-200 hover:border-rose-400 text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-rose-600" />
          <span>Cadastrar Nova Amiga</span>
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-rose-200 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhuma amiga cadastrada ainda</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">Crie o seu perfil para começar a adicionar os presentes!</p>
          <button
            onClick={onOpenMyProfile}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Cadastrar Meu Perfil
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {profiles.map(friend => {
            const friendItems = wishlists.filter(w => w.userId === friend.id);
            const niverCount = friendItems.filter(i => !i.listType || i.listType === 'aniversario' || i.listType === 'ambas').length;
            const natalCount = friendItems.filter(i => i.listType === 'natal' || i.listType === 'ambas').length;
            const color = AVATAR_COLORS[friend.colorIndex || 0] || AVATAR_COLORS[0];
            const isMe = friend.id === currentProfileId;

            return (
              <div 
                key={friend.id}
                className="group bg-white rounded-3xl p-5 border border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-2 ${color.bg}`} />
                
                <div>
                  <div className="flex items-start justify-between mb-3 mt-1">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => onSelectFriend(friend.id)}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${color.bg} ${color.text} border ${color.border}`}>
                        {friend.name ? friend.name.slice(0, 2).toUpperCase() : 'AM'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-slate-800 text-base group-hover:text-rose-600 transition">
                            {friend.name}
                          </h4>
                          {isMe && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                              Você
                            </span>
                          )}
                        </div>
                        {friend.birthday && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            <span>Niver: {friend.birthday}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => onSwitchProfile(friend.id)}
                        className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl transition"
                        title="Se você é essa pessoa, clique para alternar"
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
                    className="text-xs font-semibold text-rose-600 flex items-center space-x-1 group-hover:translate-x-1 transition"
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition font-medium text-xs sm:text-sm"
          >
            ← Voltar
          </button>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${color.bg} ${color.text} border ${color.border}`}>
            {friend.name ? friend.name.slice(0, 2).toUpperCase() : 'AM'}
          </div>

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
                <span className="flex items-center space-x-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Aniversário: {friend.birthday}</span>
                </span>
              )}
              <span>{items.length} presentes cadastrados</span>
            </div>
          </div>
        </div>

        {friend.notes && (
          <div className="text-xs bg-amber-50/80 border border-amber-200 text-amber-900 p-3 rounded-2xl max-w-sm">
            <span className="font-semibold block mb-0.5">Dicas e tamanhos de {friend.name}:</span>
            <p className="italic">"{friend.notes}"</p>
          </div>
        )}
      </div>

      {/* Occasion Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-rose-100 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveOccasion('todas')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            activeOccasion === 'todas'
              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎁 Todas as Listas</span>
        </button>

        <button
          onClick={() => setActiveOccasion('aniversario')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            activeOccasion === 'aniversario'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-rose-50'
          }`}
        >
          <span>🎂 Lista de Aniversário</span>
        </button>

        <button
          onClick={() => setActiveOccasion('natal')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            activeOccasion === 'natal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <span>🎄 Amigo Oculto de Natal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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

      {/* Gifts Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-rose-200">
          <Gift className="w-12 h-12 text-rose-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700">Nenhum item encontrado</h4>
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
                      <p>{item.notes}</p>
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
                        <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-2">
                          <div className="flex items-center space-x-1.5 text-xs text-purple-800">
                            <Lock className="w-3.5 h-3.5 text-purple-600" />
                            <span className="font-semibold">
                              {isReservedByMe ? 'Você reservou este presente!' : `Reservado por ${item.reservedByName || 'uma amiga'}`}
                            </span>
                          </div>
                          {isReservedByMe && (
                            <button
                              onClick={() => onToggleReserve(item)}
                              className="text-[11px] font-bold text-rose-600 hover:underline"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onToggleReserve(item)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 active:scale-95"
                        >
                          <Gift className="w-3.5 h-3.5" />
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

function MyListView({ myItems, profile, onOpenAddModal, onEditItem, onDeleteItem }) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">Minhas Listas de Desejos</h2>
          <p className="text-xs text-slate-500">Adicione e organize o que você quer ganhar no seu Aniversário e no Natal</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Desejo</span>
        </button>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-white border border-rose-100 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setSelectedListTab('todas')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            selectedListTab === 'todas'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Todos os Desejos</span>
          <span className="bg-slate-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
            {myItems.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedListTab('aniversario')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            selectedListTab === 'aniversario'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-rose-50'
          }`}
        >
          <span>🎂 Lista de Aniversário</span>
          <span className="bg-rose-200 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
            {niverTotal}
          </span>
        </button>

        <button
          onClick={() => setSelectedListTab('natal')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 whitespace-nowrap ${
            selectedListTab === 'natal'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <span>🎄 Amigo Oculto de Natal</span>
          <span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
            {natalTotal}
          </span>
        </button>
      </div>

      {filteredMyItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-rose-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Sua lista está vazia por enquanto</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Cadastre os mimos que você gostaria de ganhar!
          </p>
          <button
            onClick={onOpenAddModal}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition"
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
                      <p>{item.notes}</p>
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
                      className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition text-xs font-medium flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-medium flex items-center space-x-1"
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

function ItemModal({ isOpen, initialData, onClose, onSave }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [listType, setListType] = useState(initialData?.listType || 'aniversario');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [price, setPrice] = useState(initialData?.price || '');
  const [link, setLink] = useState(initialData?.link || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [priority, setPriority] = useState(initialData?.priority || 'alta');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      listType,
      category,
      price: price.trim(),
      link: link.trim(),
      notes: notes.trim(),
      priority
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-rose-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-serif">
              {initialData ? 'Editar Presente' : 'Novo Desejo de Presente'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
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
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-300'
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
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
            >
              Salvar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfileModal({ isOpen, initialData, onClose, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [birthday, setBirthday] = useState(initialData?.birthday || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [colorIndex, setColorIndex] = useState(initialData?.colorIndex || 0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, birthday, notes, colorIndex });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-rose-100">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-serif">Meu Perfil de Amiga</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Como suas amigas te chamam? *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bia, Carol, Ju..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Data de Aniversário (Dia e Mês)
            </label>
            <input
              type="text"
              placeholder="Ex: 14 de Outubro"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Cor do seu Avatar
            </label>
            <div className="flex items-center space-x-2 pt-1">
              {AVATAR_COLORS.map((col, idx) => (
                <button
                  type="button"
                  key={col.name}
                  onClick={() => setColorIndex(idx)}
                  className={`w-7 h-7 rounded-full ${col.bg} border-2 transition ${
                    colorIndex === idx ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Dicas gerais / Medidas / O que você ama
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Calço 36, blusa M. Amo papelaria fofa e tons pastéis!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition"
            >
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
