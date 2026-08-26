import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clipboard,
  Eye,
  FileText,
  Images,
  Info,
  LogOut,
  Menu,
  MessageSquareText,
  Mic2,
  RotateCcw,
  Sparkles,
  Video,
  X,
  Zap,
} from 'lucide-react';

import { SelectField } from '../../../components/ui/SelectField';
import { contentTypes, getInitialValues, initialFormData } from '../data';
import { generatePrompt } from '../generatePrompt';
import type { ContentType, PromptFormData, PromptTab } from '../types';

const contentIcons = {
  standard: MessageSquareText,
  podcast: Mic2,
  animasi: Video,
  pov: Eye,
  goyang: Images,
};

const hookColors = ['Putih', 'Kuning', 'Hitam', 'Merah', 'Hijau Neon'];

interface PromptBuilderProps {
  userName: string;
  onLogout: () => Promise<void>;
}

export function PromptBuilder({ userName, onLogout }: PromptBuilderProps) {
  const [formData, setFormData] = useState<PromptFormData>(initialFormData);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedType = contentTypes.find((item) => item.id === formData.contentType) ?? contentTypes[0];
  const isImageTab = formData.activeTab === 'Gambar';
  const isFlowTab = formData.activeTab === 'Prompt Flow';
  const isGoyangImage = formData.contentType === 'goyang' && isImageTab;

  function handleCategoryChange(contentType: ContentType) {
    const config = contentTypes.find((item) => item.id === contentType) ?? contentTypes[0];
    setFormData({ contentType, activeTab: config.tabs[0], values: getInitialValues(contentType), context: '' });
    setGeneratedPrompt('');
    setCopyState('idle');
  }

  function updateValue(fieldId: string, value: string) {
    setFormData((current) => ({ ...current, values: { ...current.values, [fieldId]: value } }));
    setCopyState('idle');
  }

  function updateTab(activeTab: PromptTab) {
    setFormData((current) => ({ ...current, activeTab }));
    setGeneratedPrompt('');
    setCopyState('idle');
  }

  async function handleGenerate() {
    const prompt = generatePrompt(formData);
    setGeneratedPrompt(prompt);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2200);
    } catch {
      setCopyState('error');
    }
    requestAnimationFrame(() => document.getElementById('prompt-output')?.focus());
  }

  async function handleCopy() {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2200);
    } catch {
      setCopyState('error');
    }
  }

  function handleReset() {
    setFormData(initialFormData);
    setGeneratedPrompt('');
    setCopyState('idle');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Prompt AI Convert Sale">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Prompt AI<span className="brand-dot">.</span></span>
        </a>
        <nav className={isMenuOpen ? 'header-nav is-open' : 'header-nav'} aria-label="Navigasi utama">
          <a href="#builder" onClick={() => setIsMenuOpen(false)}><Menu size={14} /> Menu</a>
          <a href="#top" onClick={() => setIsMenuOpen(false)}><ArrowLeft size={14} /> Dashboard</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}><CircleHelp size={14} /> Panduan</a>
        </nav>
        <div className="user-status"><span>Hi, {userName}</span><b>Premium Aktif</b></div>
        <button className="logout-button" type="button" onClick={() => void onLogout()}><LogOut size={14} /> Logout</button>
        <button className="menu-button" type="button" onClick={() => setIsMenuOpen((value) => !value)} aria-expanded={isMenuOpen} aria-label="Buka atau tutup navigasi">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="eyebrow"><Zap size={14} fill="currentColor" /> Prompt AI Convert Sale</div>
          <h1 id="hero-title">Pilih gaya.<br /><em>Jana prompt jualan.</em></h1>
          <p>Pilih jenis kandungan, tetapkan watak dan suasana, kemudian dapatkan prompt lengkap yang terus boleh ditampal ke dalam ChatGPT.</p>
          <a className="hero-link" href="#builder">Mula membina <ArrowRight size={17} /></a>
          <div className="hero-orbit" aria-hidden="true"><span /><span /><Sparkles /></div>
        </section>

        <section className="builder-section" id="builder" aria-labelledby="builder-title">
          <div className="section-heading">
            <span>01 / Pilih kategori</span>
            <h2 id="builder-title">Apa jenis content anda?</h2>
            <p>Pilih kategori utama. Borang dan prompt akan berubah secara automatik mengikut format pilihan anda.</p>
          </div>

          <div className="builder-grid">
            <aside className="type-panel" aria-label="Kategori utama">
              <p className="panel-label">Prompt AI Convert Sale</p>
              <div className="type-list">
                {contentTypes.map((item, index) => {
                  const Icon = contentIcons[item.id];
                  const isActive = item.id === formData.contentType;
                  return (
                    <button className={isActive ? 'type-button active' : 'type-button'} key={item.id} type="button" onClick={() => handleCategoryChange(item.id)} aria-pressed={isActive}>
                      <span className="type-icon"><Icon size={18} /></span>
                      <span><strong>{index + 1}. {item.shortLabel}</strong><small>{item.description}</small></span>
                      <ArrowRight className="type-arrow" size={17} />
                    </button>
                  );
                })}
              </div>
              <div className="aside-note"><Sparkles size={15} /><p><strong>Hi, {userName} • Premium Aktif</strong>Semua kategori premium tersedia untuk digunakan.</p></div>
            </aside>

            <div className="form-panel">
              <div className="form-topline">
                <div><span className="step-number">02</span><p>Pilihan prompt — {selectedType.label}</p></div>
                <span className="selection-badge">{selectedType.label}</span>
              </div>

              <div className="prompt-tabs" role="tablist" aria-label={`Pilihan prompt ${selectedType.label}`}>
                {selectedType.tabs.map((tab, index) => (
                  <button key={tab} type="button" role="tab" aria-selected={formData.activeTab === tab} className={formData.activeTab === tab ? 'active' : ''} onClick={() => updateTab(tab)}>
                    <span>{index + 1}</span>{tab}
                  </button>
                ))}
              </div>

              {isFlowTab ? (
                <div className="flow-copy-card">
                  <span className="flow-copy-icon"><Sparkles size={20} /></span>
                  <h3>Prompt Flow</h3>
                  <p>Satu klik untuk salin prompt Google Flow AI</p>
                  <button className="generate-button" type="button" onClick={handleGenerate}>
                    <Clipboard size={18} /> Auto Copy Prompt
                  </button>
                </div>
              ) : isImageTab ? (
                <div className="image-prompt-options">
                  <div className="subpanel-heading">
                    <h3>Pilihan Prompt Gambar</h3>
                    <p>Tetapkan warna hook untuk gambar pertama.</p>
                  </div>
                  {isGoyangImage ? (
                    <>
                      {selectedType.fields.map((field, index) => (
                        <SelectField key={field.id} id={field.id} label={`${index + 1}. ${field.label}`} value={formData.values[field.id] ?? field.options[0]} options={field.options} onChange={(value) => updateValue(field.id, value)} />
                      ))}
                    </>
                  ) : (
                    <>
                      <SelectField id="hook-color-1" label="1. Warna Hook — Baris 1" value={formData.values.hookColor1 ?? 'Putih'} options={hookColors} onChange={(value) => updateValue('hookColor1', value)} />
                      <SelectField id="hook-color-2" label="2. Warna Hook — Baris 2" value={formData.values.hookColor2 ?? 'Putih'} options={hookColors} onChange={(value) => updateValue('hookColor2', value)} />
                    </>
                  )}
                  <button className="generate-button" type="button" onClick={handleGenerate}>
                    <Sparkles size={18} /> Generate & Auto Copy Prompt <ArrowRight size={18} />
                  </button>
                  <p className="privacy-note"><Check size={13} /> Prompt dijana secara terus dan disalin ke clipboard anda.</p>
                </div>
              ) : (
                <>
                  <div className="dynamic-fields">
                    {selectedType.fields.map((field, index) => (
                      <SelectField key={field.id} id={field.id} label={`${index + 1}. ${field.label}`} value={formData.values[field.id] ?? field.options[0]} options={field.options} onChange={(value) => updateValue(field.id, value)} />
                    ))}
                  </div>

                  <div className="field">
                    <label htmlFor="context">Konteks tambahan <span>Pilihan</span></label>
                    <textarea id="context" value={formData.context} onChange={(event) => setFormData((current) => ({ ...current, context: event.target.value }))} placeholder="Nama produk, kelebihan, harga, promosi atau arahan tambahan..." rows={3} maxLength={700} />
                    <small className="character-count">{formData.context.length} / 700</small>
                  </div>

                  <div className="info-note"><Info size={17} /><p>{selectedType.info}</p></div>

                  <button className="generate-button" type="button" onClick={handleGenerate}>
                    <Sparkles size={18} /> Generate & Auto Copy Prompt <ArrowRight size={18} />
                  </button>
                  <p className="privacy-note"><Check size={13} /> Prompt dijana secara terus dan disalin ke clipboard anda.</p>
                </>
              )}
            </div>
          </div>

          <div className={generatedPrompt ? 'result-panel is-visible' : 'result-panel'} aria-live="polite">
            <div className="result-header">
              <div><span className="step-number">03</span><p>Prompt {formData.activeTab} anda</p></div>
              <div className="result-actions">
                <button type="button" onClick={handleReset}><RotateCcw size={15} /> Tetapkan semula</button>
                <button className="copy-button" type="button" onClick={handleCopy} disabled={!generatedPrompt}>
                  {copyState === 'copied' ? <Check size={16} /> : <Clipboard size={16} />}
                  {copyState === 'copied' ? 'Disalin!' : copyState === 'error' ? 'Salin manual' : 'Salin prompt'}
                </button>
              </div>
            </div>
            {generatedPrompt ? <pre id="prompt-output" tabIndex={-1}>{generatedPrompt}</pre> : <div className="empty-result"><FileText size={22} /><span>Prompt yang dijana akan dipaparkan di sini.</span></div>}
          </div>
        </section>

        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-heading compact"><span>02 / Cara ia berfungsi</span><h2 id="how-title">Pilih. Jana. Terus guna.</h2></div>
          <div className="how-grid">
            <article><b>01</b><h3>Pilih kategori</h3><p>Gunakan Standard, Podcast, Animasi, P.O.V atau Goyang2.</p></article>
            <article><b>02</b><h3>Tetapkan pilihan</h3><p>Pilih scene, watak, mood, lokasi dan jenis hasil yang diperlukan.</p></article>
            <article><b>03</b><h3>Upload dalam ChatGPT</h3><p>Tampal prompt yang disalin dan upload gambar produk anda untuk dianalisis.</p></article>
          </div>
        </section>

        <section className="tips-section" id="tips"><Sparkles size={20} /><div><span>Tip prompt</span><p>Selepas menampal prompt, upload gambar produk yang jelas supaya AI dapat mengenal pasti label, ciri dan pembungkusan dengan tepat.</p></div></section>
      </main>

      <a className="whatsapp-button" href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp Admin</a>
      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><Sparkles size={15} /></span>Prompt AI<span className="brand-dot">.</span></a><p>Bina dengan jelas. Menjual dengan yakin.</p><span>© 2026 Promptly Studio</span></footer>
    </div>
  );
}
