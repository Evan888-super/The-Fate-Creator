import { useState, useEffect } from 'react';
import { generateAlternateHistory } from './grokApi';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null); // For title editing
  const [editTitle, setEditTitle] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, convId: null });

  useEffect(() => {
    const saved = localStorage.getItem('fateConversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    } else {
      createNewConversation();
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('fateConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    const handleGlobalClick = () => closeContextMenu();
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const createNewConversation = () => {
    const newConv = {
      id: uuidv4(),
      title: 'New Timeline',
      messages: []
    };
    setConversations(prev => [...prev, newConv]);
    setActiveId(newConv.id);
    setInput('');
  };

  const deleteConversation = (id) => {
    if (conversations.length === 1) return; // Prevent deleting the last one
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setActiveId(conversations[0].id); // Switch to first remaining
    }
  };

  const startEditingTitle = (conv) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveTitle = () => {
    setConversations(prev => prev.map(c =>
      c.id === editingId ? { ...c, title: editTitle || 'Untitled Timeline' } : c
    ));
    setEditingId(null);
  };

  const activeConv = conversations.find(c => c.id === activeId) || { messages: [], title: 'New Timeline' };

  const shouldAutoTitle = (currentTitle, messagesLengthBefore) => {
    return currentTitle === 'New Timeline' && messagesLengthBefore === 0;
  };

  const generateAutoTitle = (messages) => {
    if (messages.length > 0 && messages[0].role === 'user') {
      return messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '...' : '');
    }
    return 'New Timeline';
  };

  const handleContextMenu = (e, convId) => {
    e.preventDefault(); // Block browser menu
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      convId
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, convId: null });
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const messagesBefore = activeConv.messages.length;
    const updatedMessages = [...activeConv.messages, userMessage];

    // Only auto-update title on the VERY FIRST prompt
    const newTitle = shouldAutoTitle(activeConv.title, messagesBefore)
      ? generateAutoTitle(updatedMessages)
      : activeConv.title;

    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: updatedMessages, title: newTitle }
        : c
    ));
    setInput('');
    setLoading(true);
    setError('');
     
    try {
      const grokResponse = await generateAlternateHistory(updatedMessages.map(m => ({ role: m.role, content: m.content })));
      const assistantMessage = { role: 'assistant', content: grokResponse };

      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, messages: [...updatedMessages, assistantMessage] } : c
      ));
    } catch (err) {
      setError(`Error: ${err.message}`);
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: activeConv.messages } : c));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>THE FATE MASTER</h1>
        <p>Multiverse Control Panel</p>
        <div className="header-buttons">
          <button className="info-btn" onClick={createNewConversation}>
            + New Timeline
          </button>
          <button className="info-btn" onClick={() => setShowHelp(true)}>Help</button>
          <button className="info-btn" onClick={() => setShowAbout(true)}>About The Great Creator</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <h3>Your Timelines ({conversations.length})</h3>
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conv-item ${conv.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(conv.id)}
              onContextMenu={(e) => handleContextMenu(e, conv.id)} // Right-click trigger
            >
              <div className="conv-header" onClick={(e) => e.stopPropagation()}> {/* Prevent switch on edit */}
                {editingId === conv.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                    autoFocus
                    className="title-edit"
                  />
                ) : (
                  <div className="conv-title">
                    {conv.title}
                  </div>
                )}
              </div>
              <div className="conv-preview">
                {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content.slice(0, 60) + '...' : 'Empty timeline'}
              </div>
            </div>
          ))}
        </aside>

        <main className="chat-area">
          <div className="chat-history">
            {activeConv.messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.role === 'user' ? (
                  <div className="user-prompt">
                    <h3>Your Fate Prompt:</h3>
                    <div className="content">{msg.content}</div>
                  </div>
                ) : (
                  <div className="response">
                    <h2>{activeConv.title}</h2>
                    <div className="content">{msg.content}</div>
                  </div>
                )}
              </div>
            ))}

            {loading && <div className="loading">Rewriting reality for you, boss...</div>}
            {error && <p className="error">{error}</p>}
          </div>

          <div className="input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeConv.messages.length === 0
                ? "Start a new timeline... e.g., What if Vancouver led the AI revolution?"
                : "Continue this timeline..."}
              rows={4}
            />
            <button onClick={handleSubmit} disabled={loading || !input.trim()}>
              {loading ? 'Rewriting...' : activeConv.messages.length === 0 ? 'Create Timeline' : 'Continue Timeline'}
            </button>
          </div>
        </main>
      </div>

      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={closeContextMenu}
        >
          <div className="menu-item" onClick={(e) => { e.stopPropagation(); startEditingTitle(conversations.find(c => c.id === contextMenu.convId)); closeContextMenu(); }}>
            ✏️ Edit Title
          </div>
          <div className="menu-item delete" onClick={(e) => { e.stopPropagation(); deleteConversation(contextMenu.convId); closeContextMenu(); }}>
            🗑️ Delete Timeline
          </div>
        </div>
      )}

      

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>How to Use The Fate Master</h2>
            <div className="modal-content">
              <p><strong>Before Running:</strong> Please check if you have already have your Grok API!</p>
              <p><strong>Create Timelines:</strong> Click "+ New Timeline" to start fresh alternate histories.</p>
              <p><strong>Continue:</strong> Type your prompt and hit the button—Grok remembers everything in the thread.</p>
              <p><strong>Switch:</strong> Click any timeline in the sidebar.</p>
              <p><strong>Edit Title:</strong> Right click the title and select "Edit Title"</p>
              <p><strong>Delete:</strong> Right click the title and select "Delete Timeline" (keeps at least one timeline).</p>
              <p><strong>Persistence:</strong> All timelines save automatically in your browser.</p>
              <p>Built for exploring wild "what ifs"—from modern tech in WWII to Vancouver pioneering AI in the '80s. Let the Fate Master rewrite fate.</p>
            </div>
            <button onClick={() => setShowHelp(false)}>Close</button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>About The Great Evan</h2>
            <div className="modal-content">
              <p>Evan is a visionary builder who has created this project. He has cutting-edge ambition and vows to use technology to save humanity.</p>
              <p>Evan created The Fate Master to let the users explore infinite alternate histories, powered by the cosmic reasoning of advanced AI chatbots.</p>
              <p>After endless nights of building, Evan created this project by creating React multiverses, developing the API structure, and reimagining timelines.</p>
              <p>Inspired by the stars, built in the rain—rewriting fate, one thread at a time. Evan conquered the universe through ambition and determination. </p>
              <p>Please contact evanlin275282@gmail.com if you want to reach our great creator. </p>
            </div>
            <button onClick={() => setShowAbout(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;