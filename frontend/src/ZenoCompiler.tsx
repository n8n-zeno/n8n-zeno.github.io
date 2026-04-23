import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Copy, Check, ArrowRight, Loader2, Sparkles, LogOut, Key } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ZenoCompiler() {
  const { user, token, logout, updateUser } = useAuth();
  const [url, setUrl] = useState('');
  const [outputFormat, setOutputFormat] = useState<'react' | 'html'>('react');
  const [isLoading, setIsLoading] = useState(false);
  const [outputCode, setOutputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing compiler...');
  
  const navigate = useNavigate();

  // State for updating Figma token when missing or expired
  const [showTokenInput, setShowTokenInput] = useState(user ? !user.figmaToken : false);
  const [newToken, setNewToken] = useState('');

  const handleUpdateToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newToken.trim()) return;
    
    try {
      const res = await axios.put('http://localhost:3001/api/user/figma-token', { figmaToken: newToken }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(res.data.user);
      setShowTokenInput(false);
      setError(null);
    } catch (err) {
      setError('Failed to update Figma token.');
    }
  };

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!url.trim()) return;
    if (!user?.figmaToken && !showTokenInput) {
      setShowTokenInput(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputCode('');
    setLoadingMessage('Connecting to Figma...');

    const messages = [
      'Extracting Nodes...',
      'Compiling JSX...',
      'Optimizing Layout...',
      'Generating Components...',
      'Finalizing Output...'
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      setLoadingMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 3000);

    try {
      const response = await axios.post('http://localhost:3001/api/compile', {
        url,
        outputFormat,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { jobId } = response.data;
      
      // Start Polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`http://localhost:3001/api/compile/status/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const { status, result, error: jobError } = statusRes.data;
          
          if (status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(msgInterval);
            setIsLoading(false);
            
            const data = result;
            let finalCode = '';
            
            const deepSearchKey = (obj: any, targetKey: string): any => {
              if (typeof obj !== 'object' || obj === null) return undefined;
              if (targetKey in obj) return obj[targetKey];
              const lowerTarget = targetKey.toLowerCase();
              for (const key of Object.keys(obj)) {
                if (key.toLowerCase().includes(lowerTarget)) return obj[key];
              }
              for (const key of Object.keys(obj)) {
                const result = deepSearchKey(obj[key], targetKey);
                if (result !== undefined) return result;
              }
              return undefined;
            };

            if (outputFormat === 'html') {
              const htmlNodeOutput = deepSearchKey(data, 'html') || deepSearchKey(data, 'Deterministic Compiler Engine');
              if (htmlNodeOutput && typeof htmlNodeOutput !== 'string' && (htmlNodeOutput.rawCode || htmlNodeOutput.text || htmlNodeOutput.code)) {
                finalCode = htmlNodeOutput.rawCode || htmlNodeOutput.text || htmlNodeOutput.code;
              } else if (typeof htmlNodeOutput === 'string') {
                finalCode = htmlNodeOutput;
              } else if (data.rawCode || data.text || data.code) {
                finalCode = data.rawCode || data.text || data.code;
              }
            } else {
              const reactNodeOutput = deepSearchKey(data, 'react');
              if (reactNodeOutput && typeof reactNodeOutput !== 'string' && (reactNodeOutput.rawCode || reactNodeOutput.text || reactNodeOutput.code)) {
                finalCode = reactNodeOutput.rawCode || reactNodeOutput.text || reactNodeOutput.code;
              } else if (typeof reactNodeOutput === 'string') {
                finalCode = reactNodeOutput;
              } else if (data.rawCode || data.code || data.text || data.reactCode) {
                finalCode = data.rawCode || data.code || data.text || data.reactCode;
              }
            }

            if (finalCode) {
              setOutputCode(typeof finalCode === 'string' ? finalCode : JSON.stringify(finalCode, null, 2));
            } else {
              setError('Invalid response structure from compiler.');
            }
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(msgInterval);
            setIsLoading(false);
            setError(jobError || 'Compilation failed on the engine.');
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);

      // Cleanup on unmount (approximate)
      (window as any)._zeno_poll = pollInterval;
      (window as any)._zeno_msg = msgInterval;

    } catch (err: any) {
      clearInterval(msgInterval);
      setIsLoading(false);
      if (err.response?.data?.error === 'FIGMA_TOKEN_EXPIRED') {
        setError('Your Figma token has expired or is invalid. Please update it below.');
        setShowTokenInput(true);
      } else {
        setError(err.response?.data?.error || err.message || 'An unexpected error occurred.');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000] text-[#EAEAEA] selection:bg-[#333] selection:text-white font-sans overflow-x-hidden">
      
      <div className="fixed inset-0 grid-background pointer-events-none"></div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/Z.png" alt="ZENO Logo" className="w-full h-full object-contain" />
          </div>
          <span>ZENO</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#888]">
          {user && <span>{user.email}</span>}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 bg-[#222] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#333] transition-colors">
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-[#888] hover:text-white text-xs font-bold transition-colors">Sign In</Link>
              <Link to="/signup" className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-[#DDD] transition-colors">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center pt-16 pb-32 px-6">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-[#888] text-[11px] font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-[#888]">
            Figma to Code, <br/>Instantly.
          </h1>
          <p className="text-[#888] text-lg max-w-lg mx-auto">
            The world's fastest compiler engine for turning Figma designs into production-ready React components.
          </p>
        </div>

        <div className="relative w-full max-w-[720px] mb-24">
          
          <div className="absolute -inset-[1px] bg-gradient-to-b from-[#444] via-[#111] to-transparent rounded-[32px] blur-[2px] opacity-50 pointer-events-none"></div>
          
          <div className="relative glass border border-[#222] rounded-[32px] flex flex-col overflow-hidden shadow-2xl bg-[#050505]">
            
            <div className="h-14 border-b border-[#222] bg-white/[0.02] px-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#888]">
                <Terminal size={16} />
                <span className="text-[13px] font-semibold tracking-wide uppercase">Compiler Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#444] uppercase tracking-[0.2em]">Ready to Execute</span>
              </div>
            </div>

            <div className="p-8 flex flex-col gap-8">
              
              {showTokenInput && (
                <div className="bg-[#111] border border-[#333] p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Update Figma Token</span>
                    <a href="https://www.figma.com/settings" target="_blank" rel="noreferrer" className="text-[11px] text-[#888] hover:text-white transition-colors underline">Get PAT</a>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-3 text-[#666]"><Key size={14} /></div>
                      <input
                        type="password"
                        value={newToken}
                        onChange={(e) => setNewToken(e.target.value)}
                        placeholder="figd_..."
                        className="w-full bg-black border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-[#555] outline-none"
                      />
                    </div>
                    <button onClick={handleUpdateToken} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#ddd]">
                      Save
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleCompile} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">
                      Source Figma URL
                    </label>
                    <span className="text-[11px] text-[#444]">Node ID or Full Link</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/[0.02] rounded-[20px] transition-all group-focus-within:bg-white/[0.05]"></div>
                    <div className="relative flex items-center">
                      <div className="absolute left-5 text-[#444] group-focus-within:text-[#888] transition-colors">
                        <Sparkles size={16} />
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.figma.com/file/..."
                        className="w-full bg-transparent border border-[#222] rounded-[20px] pl-12 pr-36 py-4 text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#444] transition-all"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !url || (!!user && !user.figmaToken && !newToken)}
                        className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-[14px] text-[13px] font-bold hover:bg-[#DDD] transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg min-w-[140px] justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span className="animate-pulse">{loadingMessage}</span>
                          </>
                        ) : (
                          <>
                            Compile <ArrowRight size={16} strokeWidth={3} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('react')}
                    className={`flex-1 py-3 rounded-[16px] text-[12px] font-bold border transition-all ${
                      outputFormat === 'react' 
                        ? 'bg-white/10 text-white border-white/20' 
                        : 'bg-transparent text-[#666] border-transparent hover:text-[#888] hover:bg-white/5'
                    }`}
                  >
                    React Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('html')}
                    className={`flex-1 py-3 rounded-[16px] text-[12px] font-bold border transition-all ${
                      outputFormat === 'html' 
                        ? 'bg-white/10 text-white border-white/20' 
                        : 'bg-transparent text-[#666] border-transparent hover:text-[#888] hover:bg-white/5'
                    }`}
                  >
                    HTML
                  </button>
                </div>
              </form>

              {error && (
                <div className="px-5 py-4 bg-[#FF4444]/[0.05] border border-[#FF4444]/20 rounded-[16px] flex items-center gap-4 text-[#FF4444]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4444]"></div>
                  <span className="text-[13px] font-medium">{error}</span>
                </div>
              )}

              {outputCode && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>
                      <span className="text-[11px] font-bold text-[#555] uppercase tracking-widest">
                        {outputFormat === 'react' ? 'React' : 'HTML'} Output Generated
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-[#222] text-[11px] font-bold text-[#888] hover:text-white hover:border-[#444] transition-all"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  
                  <div className="relative w-full rounded-[20px] border border-[#222] bg-[#1e1e1e] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-10"></div>
                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                      <SyntaxHighlighter
                        language={outputFormat === 'react' ? 'tsx' : 'html'}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          background: 'transparent',
                          fontSize: '13px',
                          lineHeight: '1.5',
                        }}
                        wrapLines={true}
                      >
                        {outputCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
