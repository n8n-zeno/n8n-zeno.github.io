import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Terminal, Copy, Check, ArrowRight, Loader2, Sparkles, LogOut, Key, Info } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Components
import { Features } from './components/blocks/features-8';
import AnimatedTextCycle from './components/ui/animated-text-cycle';
import FeaturedSectionStats from './components/ui/featured-section-stats';
import { Pricing } from './components/ui/single-pricing-card-1';
import { Faq } from './components/ui/faq';
import { Footer } from './components/ui/footer';

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

  const [showTokenInput, setShowTokenInput] = useState(user ? !user.figmaToken : false);
  const [newToken, setNewToken] = useState('');

  useEffect(() => {
    return () => {
      if ((window as any)._zeno_poll) clearInterval((window as any)._zeno_poll);
      if ((window as any)._zeno_msg) clearInterval((window as any)._zeno_msg);
      (window as any)._zeno_fetching = false;
    };
  }, []);

  const handleUpdateToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newToken.trim()) return;
    
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/user/figma-token`, { figmaToken: newToken }, {
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

    const messages = ['Extracting Nodes...', 'Compiling JSX...', 'Optimizing Layout...', 'Generating Components...', 'Finalizing Output...'];
    let msgIndex = 0;
    
    if ((window as any)._zeno_msg) clearInterval((window as any)._zeno_msg);
    const msgInterval = setInterval(() => {
      setLoadingMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 3000);
    (window as any)._zeno_msg = msgInterval;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/compile`, {
        url,
        outputFormat,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { jobId } = response.data;
      (window as any)._zeno_fetching = false;

      if ((window as any)._zeno_poll) clearInterval((window as any)._zeno_poll);
      const pollInterval = setInterval(async () => {
        if ((window as any)._zeno_fetching) return; 
        (window as any)._zeno_fetching = true;

        try {
          const statusRes = await axios.get(`${import.meta.env.VITE_API_URL}/compile/status/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const { status, result, error: jobError } = statusRes.data;
          
          if (status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(msgInterval);
            setIsLoading(false);
            
            let finalCode = '';
            
            if (typeof result === 'string') {
              if (result.trim().startsWith('{') || result.trim().startsWith('[')) {
                try {
                  const parsed = JSON.parse(result);
                  finalCode = parsed.data || parsed.rawCode || parsed.code || result;
                } catch(e) {
                  finalCode = result;
                }
              } else {
                finalCode = result;
              }
            } else if (result && typeof result === 'object') {
              finalCode = result.data || result.rawCode || result.code || result.text || result.reactCode || '';
            }

            if (typeof finalCode === 'string' && finalCode.startsWith('"') && finalCode.endsWith('"')) {
              try { finalCode = JSON.parse(finalCode); } catch(e) {}
            }

            if (finalCode) {
              setOutputCode(finalCode);
            } else {
              setError('Invalid response structure from compiler.');
            }
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            clearInterval(msgInterval);
            setIsLoading(false);
            
            const errorStr = (jobError || '').toLowerCase();
            if (errorStr.includes('token') || errorStr.includes('unauthorized') || errorStr.includes('403') || errorStr.includes('401')) {
              setError('Your Figma token has expired or is invalid. Please update it below.');
              setShowTokenInput(true);
            } else {
              setError(jobError || 'Compilation failed on the engine.');
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        } finally {
          (window as any)._zeno_fetching = false; 
        }
      }, 5000);
      
      (window as any)._zeno_poll = pollInterval;

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

  const MAX_DISPLAY_LENGTH = 15000;
  const displayCode = outputCode.length > MAX_DISPLAY_LENGTH 
    ? outputCode.slice(0, MAX_DISPLAY_LENGTH) + '\n\n// ... \n// [Click "Copy Code" to copy the ENTIRE file!] \n// ...'
    : outputCode;

  return (
    <div className="min-h-screen bg-[#000] text-[#EAEAEA] selection:bg-[#333] selection:text-white font-sans overflow-x-hidden">
      <Helmet>
        <title>ZENO Compiler | Figma to Code</title>
        <meta name="description" content="ZENO is a deterministic Figma-to-code compiler that generates pixel-perfect React and HTML from your designs instantly." />
      </Helmet>
      
      <div className="fixed inset-0 grid-background pointer-events-none"></div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/Z.png" alt="ZENO Logo" className="w-full h-full object-contain" />
          </div>
          <span>ZENO</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#888]">
          <a href="#compiler" className="hover:text-white transition-colors">Compiler</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
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

      <main id="compiler" className="relative z-10 flex flex-col items-center pt-16 pb-32 px-6">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-[#888] text-[11px] font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Zeno Engine v2.0 Online
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-[#888]">
            Figma to Code,{" "}
            <br />
            <AnimatedTextCycle
              words={[
                "Instantly.",
                "Precisely.",
                "Perfectly.",
                "Securely.",
                "Blazingly.",
                "Natively.",
              ]}
              interval={2500}
              className="bg-clip-text text-transparent bg-gradient-to-b from-white to-[#888]"
            />
          </h1>

          <p className="text-[#888] text-lg max-w-lg mx-auto">
            Generate pixel-perfect frontends instantly HTML or React. No AI guesswork, no hallucinations—just exact UI replication.
          </p>
        </div>

        <div className="relative w-full max-w-[720px] mb-24 group p-[1px] rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-white/[0.04] transition-all duration-700">
          
          <div className="absolute inset-[-100%] z-0 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_0%,#00000000_60%,#444444_85%,#ffffff_100%)] opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="absolute inset-[-100%] z-0 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_0%,#00000000_60%,#444444_85%,#ffffff_100%)] blur-lg opacity-0 group-hover:opacity-80 transition-opacity duration-1000"></div>

          <div className="relative z-10 h-full w-full bg-[#050505] rounded-[31px] flex flex-col overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            
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
                  <div className="flex flex-col gap-1">
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
                    <p className="text-[11px] text-[#666] pl-1">
                      Tip: Please ensure you select <strong>"File content: Read"</strong> when creating your token.
                    </p>
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
                  
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-white/[0.02] rounded-[20px] transition-all group-focus-within/input:bg-white/[0.05]"></div>
                    <div className="relative flex items-center">
                      <div className="absolute left-5 text-[#444] group-focus-within/input:text-[#888] transition-colors">
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
                            <span className="animate-pulse">{loadingMessage.split(' ')[0]}</span>
                          </>
                        ) : (
                          <>
                            Compile <ArrowRight size={16} strokeWidth={3} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 px-2 mt-1 opacity-80">
                    <Info size={12} className="text-[#666] mt-[2px] flex-shrink-0" />
                    <span className="text-[11px] text-[#666] leading-relaxed">
                      <strong>Tip:</strong> Make sure to click on the specific UI screen or frame in your Figma canvas <em>before</em> copying the link.
                    </span>
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
                      {copied ? 'Copied Full File!' : 'Copy Full Code'}
                    </button>
                  </div>
                  
                  <div className="relative w-full rounded-[20px] border border-[#222] bg-[#1e1e1e] overflow-hidden group/output">
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
                        {displayCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Stats Section */}
      <div className="relative z-10 border-t border-[#111]">
        <FeaturedSectionStats />
      </div>

      <div id="features" className="relative z-10">
        <Features />
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 border-t border-[#111]">
        <Pricing />
      </div>

      {/* FAQ Section */}
      <div id="faq" className="relative z-10 border-t border-[#111]">
        <Faq />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}