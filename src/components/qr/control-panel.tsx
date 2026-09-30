import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QROptions, InputType, DotStyle, EyeFrameStyle, EyeBallStyle, GradientType } from '@/lib/types';
import { PRESETS } from '@/lib/presets';
import { 
  Link2, Wifi, UserCheck, MessageSquare, Share2, Image as ImageIcon, 
  Palette, Shapes, LayoutTemplate, Sparkles, Upload, Trash2, RotateCcw,
  TerminalSquare, SlidersHorizontal, Wand2, Layers3, ScanLine, Flame, FolderGit2, CheckCircle2, Cpu
} from 'lucide-react';

interface ControlPanelProps {
  options: QROptions;
  setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
  themeMode: 'dark' | 'light';
}

function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    isMouseDown.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  const onMouseUp = () => {
    isMouseDown.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  return {
    ref,
    isDragging,
    props: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
  };
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions, themeMode }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'content' | 'logo' | 'color' | 'shape' | 'frame'>('presets');
  const [activePresetNotification, setActivePresetNotification] = useState<string | null>(null);

  const isDark = themeMode === 'dark';
  const tabDragScroll = useDraggableScroll();
  const inputTypeDragScroll = useDraggableScroll();

  const updateOptions = (updates: Partial<QROptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateOptions({ logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (presetId: string) => {
    if (tabDragScroll.isDragging) return;
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      updateOptions(found.options);
      setActivePresetNotification(found.name);
      setTimeout(() => setActivePresetNotification(null), 2500);
    }
  };

  const cliString = `quarana --input ${options.inputType} --pattern ${options.dotStyle} --ecc ${options.logoUrl ? 'H' : 'M'}`;
  const [displayedCli, setDisplayedCli] = useState(cliString);

  useEffect(() => {
    let index = 0;
    setDisplayedCli('');
    const timer = setInterval(() => {
      if (index <= cliString.length) {
        setDisplayedCli(cliString.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [cliString]);

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 shadow-2xl font-sans backdrop-blur-xl ${
        isDark
          ? 'bg-black/40 border-emerald-500/25 text-zinc-100 shadow-[0_0_30px_rgba(16,185,129,0.1),0_20px_50px_rgba(0,0,0,0.8)]'
          : 'bg-white/60 border-emerald-500/30 text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.08),0_20px_50px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* 1. Terminal Window Titlebar */}
      <div className={`flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b select-none backdrop-blur-md ${
        isDark ? 'border-emerald-500/20 bg-black/20' : 'border-slate-200/80 bg-white/40'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 mr-1 sm:mr-2 shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 border border-rose-600/50 block shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 border border-amber-600/50 block shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50 block shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>

          <TerminalSquare className={`h-4 w-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span className={`font-mono text-[11px] sm:text-xs font-semibold tracking-wide truncate ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            quarana@terminal: ~/studio-controls
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CLI_ACTIVE</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => applyPreset('classic-standard')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-mono text-[11px] sm:text-xs font-semibold transition-all shadow-sm ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-200/80 hover:bg-slate-300/80 border border-slate-300 text-emerald-800'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">./reset-classic.sh</span>
            <span className="sm:hidden">Reset</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Motion Animated Typewriter CLI Prompt Banner */}
      <div className={`px-3.5 sm:px-5 py-2.5 sm:py-3 border-b font-mono text-[11px] sm:text-xs overflow-x-auto flex items-center justify-between gap-3 no-scrollbar select-none backdrop-blur-md ${
        isDark
          ? 'bg-black/40 border-emerald-500/20 text-zinc-300'
          : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-inner'
      }`}>
        <div className="flex items-center gap-2 truncate">
          <span className="text-emerald-400 font-bold">$</span>
          <motion.span
            key={displayedCli}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="text-emerald-300 font-semibold tracking-tight truncate"
          >
            {displayedCli}
          </motion.span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 shrink-0"
          />
        </div>
        
        {activePresetNotification && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap font-mono shrink-0"
          >
            {activePresetNotification}
          </motion.span>
        )}
      </div>

      {/* 3. Terminal Styled Category Tabs */}
      <div className="p-4 sm:p-6">
        <div
          ref={tabDragScroll.ref}
          {...tabDragScroll.props}
          className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-5 sm:mb-6 border-b no-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-x ${
            isDark ? 'border-emerald-500/20' : 'border-slate-200/80'
          }`}
        >
          {[
            { id: 'presets', label: '1. --presets-gallery', icon: Sparkles },
            { id: 'content', label: '2. --data-input', icon: Link2 },
            { id: 'logo', label: '3. --logo-image', icon: ImageIcon },
            { id: 'color', label: '4. --colors', icon: Palette },
            { id: 'shape', label: '5. --dots-eyes', icon: Shapes },
            { id: 'frame', label: '6. --cta-frame', icon: LayoutTemplate },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!tabDragScroll.isDragging) {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] backdrop-blur-md'
                      : 'bg-emerald-500 text-white border border-emerald-600 shadow-md'
                    : isDark
                    ? 'bg-black/30 hover:bg-black/50 text-zinc-400 border border-white/10 backdrop-blur-md'
                    : 'bg-white/60 hover:bg-white/80 text-slate-700 border border-white/70 backdrop-blur-md'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isSelected ? (isDark ? 'text-emerald-400' : 'text-white') : (isDark ? 'text-zinc-500' : 'text-slate-500')}`} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* 4. Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'presets' && (
            <motion.div
              key="presets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="space-y-3 font-mono"
            >
              <p className={`text-[11px] sm:text-xs mb-3 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>$ ./execute-preset-gallery.sh --select-one</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => applyPreset(preset.id)}
                    className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border text-left transition-all group backdrop-blur-md ${
                      isDark
                        ? 'border-emerald-500/20 bg-black/40 hover:border-emerald-500/60 hover:bg-black/60'
                        : 'border-white/70 bg-white/60 hover:border-emerald-500 shadow-sm'
                    }`}
                  >
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{ background: preset.previewColor }}
                    />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>./{preset.id}.sh</div>
                      <div className={`text-[10px] leading-tight truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{preset.name}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="space-y-5 sm:space-y-6"
            >
              <div
                ref={inputTypeDragScroll.ref}
                {...inputTypeDragScroll.props}
                className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none touch-pan-x pb-1"
              >
                {[
                  { id: 'url', label: 'URL / Text', icon: Link2 },
                  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                  { id: 'vcard', label: 'vCard', icon: UserCheck },
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'social', label: 'Social', icon: Share2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = options.inputType === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (!inputTypeDragScroll.isDragging) {
                          updateOptions({ inputType: item.id as InputType });
                        }
                      }}
                      className={`flex-shrink-0 sm:flex-shrink flex flex-col items-center justify-center p-2.5 sm:p-3 px-3.5 rounded-2xl border text-center transition-all min-w-[85px] backdrop-blur-md ${
                        isSelected
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 font-mono shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-800 font-mono font-bold shadow-sm'
                          : isDark
                          ? 'bg-black/30 border-white/10 hover:bg-black/50 text-zinc-400 font-mono'
                          : 'bg-white/60 border-white/70 hover:bg-white/80 text-slate-700 font-mono'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 mb-1" />
                      <span className="text-[11px] font-medium whitespace-nowrap">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {options.inputType === 'url' && (
                <div className="space-y-2">
                  <label className={`text-xs font-mono uppercase tracking-wider block ${isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-bold'}`}>
                    PARAM: --raw-text
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-mono text-emerald-500 font-bold">$</span>
                    <input
                      type="text"
                      value={options.rawText}
                      onChange={(e) => updateOptions({ rawText: e.target.value })}
                      placeholder="https://yourwebsite.com or text"
                      className={`w-full pl-8 pr-3.5 py-2.5 sm:py-3 rounded-xl border font-mono text-xs sm:text-sm outline-none transition-all backdrop-blur-md ${
                        isDark
                          ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                          : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600 focus:bg-white shadow-sm'
                      }`}
                    />
                  </div>
                </div>
              )}

              {options.inputType === 'wifi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-mono uppercase tracking-wider block ${isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-bold'}`}>
                      PARAM: --ssid
                    </label>
                    <input
                      type="text"
                      value={options.wifi.ssid}
                      onChange={(e) => updateOptions({ wifi: { ...options.wifi, ssid: e.target.value } })}
                      placeholder="MyHomeWifi"
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm outline-none transition-all backdrop-blur-md ${
                        isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-mono uppercase tracking-wider block ${isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-bold'}`}>
                      PARAM: --password
                    </label>
                    <input
                      type="text"
                      value={options.wifi.password}
                      onChange={(e) => updateOptions({ wifi: { ...options.wifi, password: e.target.value } })}
                      placeholder="WifiPassword123"
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm outline-none transition-all backdrop-blur-md ${
                        isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className={`text-xs font-mono uppercase tracking-wider block ${isDark ? 'text-emerald-400/90' : 'text-emerald-700 font-bold'}`}>
                      PARAM: --encryption
                    </label>
                    <select
                      value={options.wifi.encryption}
                      onChange={(e) => updateOptions({ wifi: { ...options.wifi, encryption: e.target.value as any } })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm outline-none transition-all backdrop-blur-md ${
                        isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                      }`}
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
              )}

              {options.inputType === 'vcard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 font-mono">
                  {['firstName', 'lastName', 'phone', 'email', 'company', 'title'].map((field) => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      placeholder={`--${field}`}
                      value={(options.vcard as any)[field]}
                      onChange={(e) => updateOptions({ vcard: { ...options.vcard, [field]: e.target.value } })}
                      className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border text-xs outline-none backdrop-blur-md ${
                        isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                      }`}
                    />
                  ))}
                </div>
              )}

              {options.inputType === 'whatsapp' && (
                <div className="space-y-3 font-mono">
                  <input
                    type="text"
                    placeholder="--phone (e.g. 628123456789)"
                    value={options.whatsapp.phone}
                    onChange={(e) => updateOptions({ whatsapp: { ...options.whatsapp, phone: e.target.value } })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none backdrop-blur-md ${
                      isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                  <textarea
                    placeholder="--default-message"
                    rows={3}
                    value={options.whatsapp.message}
                    onChange={(e) => updateOptions({ whatsapp: { ...options.whatsapp, message: e.target.value } })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none backdrop-blur-md ${
                      isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              )}

              {options.inputType === 'social' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 font-mono">
                  <select
                    value={options.social.platform}
                    onChange={(e) => updateOptions({ social: { ...options.social, platform: e.target.value as any } })}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs outline-none backdrop-blur-md ${
                      isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                    }`}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">X (Twitter)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="--username (e.g. @myuser)"
                    value={options.social.username}
                    onChange={(e) => updateOptions({ social: { ...options.social, username: e.target.value } })}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs outline-none backdrop-blur-md ${
                      isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100 focus:border-emerald-500' : 'border-slate-300 bg-white/80 text-slate-900 focus:border-emerald-600'
                    }`}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'logo' && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="space-y-5 sm:space-y-6 font-mono"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <label className={`flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all backdrop-blur-md ${
                  isDark
                    ? 'border-emerald-500/30 hover:border-emerald-500 bg-black/40 hover:bg-black/60'
                    : 'border-slate-300 hover:border-emerald-600 bg-white/60 hover:bg-white/80'
                }`}>
                  <Upload className={`h-5 w-5 sm:h-6 sm:w-6 mb-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>upload_logo.sh</span>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>PNG, JPG, SVG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                {options.logoUrl && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-zinc-700 p-1 bg-white">
                      <img src={options.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <button
                      onClick={() => updateOptions({ logoUrl: null })}
                      className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> rm -rf logo
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}>PARAM: --logo-scale</span>
                  <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{Math.round(options.logoSize * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.30"
                  step="0.02"
                  value={options.logoSize}
                  onChange={(e) => updateOptions({ logoSize: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}>PARAM: --logo-halo-margin</span>
                  <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{options.logoMargin}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={options.logoMargin}
                  onChange={(e) => updateOptions({ logoMargin: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'color' && (
            <motion.div
              key="color"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="space-y-5 sm:space-y-6 font-mono"
            >
              <div className="space-y-2">
                <label className={`text-xs uppercase tracking-wider block ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
                  PARAM: --color-mode
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: 'single', label: 'Solid' },
                    { id: 'linear', label: 'Linear' },
                    { id: 'radial', label: 'Radial' },
                  ].map((g) => (
                    <motion.button
                      key={g.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateOptions({ gradientType: g.id as GradientType })}
                      className={`py-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all backdrop-blur-md ${
                        options.gradientType === g.id
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                          : isDark
                          ? 'bg-black/30 border-white/10 text-zinc-400'
                          : 'bg-white/60 border-white/70 text-slate-700'
                      }`}
                    >
                      {g.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>--color-start</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={options.color1}
                      onChange={(e) => updateOptions({ color1: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={options.color1}
                      onChange={(e) => updateOptions({ color1: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border backdrop-blur-md ${
                        isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-200' : 'border-slate-300 bg-white/80 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {options.gradientType !== 'single' && (
                  <div className="space-y-1.5">
                    <label className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>--color-stop</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={options.color2}
                        onChange={(e) => updateOptions({ color2: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={options.color2}
                        onChange={(e) => updateOptions({ color2: e.target.value })}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs border backdrop-blur-md ${
                          isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-200' : 'border-slate-300 bg-white/80 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={`grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t ${isDark ? 'border-emerald-500/20' : 'border-slate-200/80'}`}>
                <div className="space-y-1.5">
                  <label className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>--outer-eye</label>
                  <input
                    type="color"
                    value={options.outerEyeColor}
                    onChange={(e) => updateOptions({ outerEyeColor: e.target.value })}
                    className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>--inner-eye</label>
                  <input
                    type="color"
                    value={options.innerEyeColor}
                    onChange={(e) => updateOptions({ innerEyeColor: e.target.value })}
                    className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-emerald-500/20' : 'border-slate-200/80'}`}>
                <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>PARAM: --transparent-bg</span>
                <button
                  onClick={() => updateOptions({ bgTransparent: !options.bgTransparent })}
                  className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
                    options.bgTransparent ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      options.bgTransparent ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'shape' && (
            <motion.div
              key="shape"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="space-y-5 sm:space-y-6 font-mono"
            >
              <div className="space-y-2">
                <label className={`text-xs uppercase tracking-wider block ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
                  PARAM: --dot-style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'square', label: 'Square' },
                    { id: 'dots', label: 'Circles' },
                    { id: 'rounded', label: 'Rounded' },
                    { id: 'extra-rounded', label: 'Extra Rounded' },
                    { id: 'classy', label: 'Classy Diamond' },
                    { id: 'classy-rounded', label: 'Classy Smooth' },
                  ].map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateOptions({ dotStyle: style.id as DotStyle })}
                      className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs text-center transition-all backdrop-blur-md ${
                        options.dotStyle === style.id
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-md'
                          : isDark
                          ? 'bg-black/30 border-white/10 text-zinc-400'
                          : 'bg-white/60 border-white/70 text-slate-700'
                      }`}
                    >
                      {style.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-xs uppercase tracking-wider block ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
                  PARAM: --outer-eye-shape
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'square', label: 'Square Frame' },
                    { id: 'rounded', label: 'Rounded Frame' },
                    { id: 'dots', label: 'Circle Frame' },
                  ].map((eStyle) => (
                    <motion.button
                      key={eStyle.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateOptions({ eyeFrameStyle: eStyle.id as EyeFrameStyle })}
                      className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs text-center transition-all backdrop-blur-md ${
                        options.eyeFrameStyle === eStyle.id
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-emerald-500 border-emerald-600 text-white font-bold shadow-md'
                          : isDark
                          ? 'bg-black/30 border-white/10 text-zinc-400'
                          : 'bg-white/60 border-white/70 text-slate-700'
                      }`}
                    >
                      {eStyle.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'frame' && (
            <motion.div
              key="frame"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="space-y-4 sm:space-y-5 font-mono"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>PARAM: --enable-cta-frame</span>
                <button
                  onClick={() => updateOptions({ frame: { ...options.frame, enabled: !options.frame.enabled } })}
                  className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
                    options.frame.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      options.frame.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {options.frame.enabled && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>--frame-text</label>
                    <input
                      type="text"
                      value={options.frame.text}
                      onChange={(e) => updateOptions({ frame: { ...options.frame, text: e.target.value } })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none backdrop-blur-md ${
                        isDark ? 'border-emerald-500/20 bg-black/50 text-zinc-100' : 'border-slate-300 bg-white/80 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
