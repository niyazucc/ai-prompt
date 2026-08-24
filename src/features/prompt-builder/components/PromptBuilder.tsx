import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clipboard,
  FileText,
  Mail,
  Menu,
  MessageSquareText,
  Package,
  PenLine,
  RotateCcw,
  Sparkles,
  Video,
  X,
  Zap,
} from 'lucide-react';

import { SelectField } from '../../../components/ui/SelectField';
import { channels, contentTypes, goals, initialFormData, tones } from '../data';
import { generatePrompt } from '../generatePrompt';
import type { ContentType, PromptFormData } from '../types';

const contentIcons = {
  sales: PenLine,
  social: MessageSquareText,
  email: Mail,
  product: Package,
  video: Video,
};

export function PromptBuilder() {
  const [formData, setFormData] = useState<PromptFormData>(initialFormData);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedType = useMemo(
    () => contentTypes.find((item) => item.id === formData.contentType) ?? contentTypes[0],
    [formData.contentType],
  );

  function updateField<K extends keyof PromptFormData>(field: K, value: PromptFormData[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setCopyState('idle');
  }

  function handleGenerate() {
    setGeneratedPrompt(generatePrompt(formData));
    setCopyState('idle');
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
        <a className="brand" href="#top" aria-label="Promptly home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>promptly<span className="brand-dot">.</span></span>
        </a>
        <nav className={isMenuOpen ? 'header-nav is-open' : 'header-nav'} aria-label="Navigasi utama">
          <a href="#builder" onClick={() => setIsMenuOpen(false)}>Pembina prompt</a>
          <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>Cara ia berfungsi</a>
          <a href="#tips" onClick={() => setIsMenuOpen(false)}>Tip prompt</a>
        </nav>
        <a className="header-cta" href="#builder">Bina prompt <ArrowRight size={15} /></a>
        <button className="menu-button" type="button" onClick={() => setIsMenuOpen((value) => !value)} aria-expanded={isMenuOpen} aria-label="Buka atau tutup navigasi">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="eyebrow"><Zap size={14} fill="currentColor" /> Pembina prompt AI untuk pemasar</div>
          <h1 id="hero-title">Prompt lebih baik.<br /><em>Jualan lebih mantap.</em></h1>
          <p>Ubah beberapa maklumat tentang tawaran anda menjadi prompt yang jelas dan strategik—sedia untuk digunakan dalam AI pilihan anda.</p>
          <a className="hero-link" href="#builder">Mula membina <ArrowRight size={17} /></a>
          <div className="hero-orbit" aria-hidden="true"><span /><span /><Sparkles /></div>
        </section>

        <section className="builder-section" id="builder" aria-labelledby="builder-title">
          <div className="section-heading">
            <span>01 / Bina prompt anda</span>
            <h2 id="builder-title">Apa yang anda mahu hasilkan?</h2>
            <p>Pilih format, masukkan konteks dan kami akan menyusun arahannya untuk anda.</p>
          </div>

          <div className="builder-grid">
            <aside className="type-panel" aria-label="Jenis kandungan">
              <p className="panel-label">Jenis kandungan</p>
              <div className="type-list">
                {contentTypes.map((item) => {
                  const Icon = contentIcons[item.id];
                  const isActive = item.id === formData.contentType;
                  return (
                    <button
                      className={isActive ? 'type-button active' : 'type-button'}
                      key={item.id}
                      type="button"
                      onClick={() => updateField('contentType', item.id as ContentType)}
                      aria-pressed={isActive}
                    >
                      <span className="type-icon"><Icon size={18} /></span>
                      <span><strong>{item.shortLabel}</strong><small>{item.description}</small></span>
                      <ArrowRight className="type-arrow" size={17} />
                    </button>
                  );
                })}
              </div>
              <div className="aside-note"><Sparkles size={15} /><p><strong>Direka untuk hasil lebih baik</strong>Setiap pilihan memberikan arahan berguna supaya AI tidak perlu membuat terlalu banyak andaian.</p></div>
            </aside>

            <div className="form-panel">
              <div className="form-topline">
                <div><span className="step-number">02</span><p>Ceritakan tentang tawaran anda</p></div>
                <span className="selection-badge">{selectedType.label}</span>
              </div>

              <div className="field product-field">
                <label htmlFor="product">Produk atau perkhidmatan <span>Wajib</span></label>
                <input id="product" value={formData.product} onChange={(event) => updateField('product', event.target.value)} placeholder="cth. Aplikasi perancangan makanan untuk keluarga sibuk" />
              </div>

              <div className="field audience-field">
                <label htmlFor="audience">Sasaran audiens</label>
                <input id="audience" value={formData.audience} onChange={(event) => updateField('audience', event.target.value)} placeholder="Siapakah yang ingin anda sasarkan?" />
              </div>

              <div className="form-row">
                <SelectField id="channel" label="Saluran" value={formData.channel} options={channels} onChange={(value) => updateField('channel', value)} />
                <SelectField id="tone" label="Nada penyampaian" value={formData.tone} options={tones} onChange={(value) => updateField('tone', value)} />
              </div>

              <SelectField id="goal" label="Matlamat utama" value={formData.goal} options={goals} onChange={(value) => updateField('goal', value)} />

              <div className="field">
                <label htmlFor="context">Konteks tambahan <span>Pilihan</span></label>
                <textarea id="context" value={formData.context} onChange={(event) => updateField('context', event.target.value)} placeholder="Ciri utama, butiran tawaran, bukti, bantahan pelanggan atau apa-apa yang AI perlu tahu..." rows={4} maxLength={700} />
                <small className="character-count">{formData.context.length} / 700</small>
              </div>

              <button className="generate-button" type="button" onClick={handleGenerate}>
                <Sparkles size={18} /> Jana prompt saya <ArrowRight size={18} />
              </button>
              <p className="privacy-note"><Check size={13} /> Tiada data dimuat naik. Prompt anda dijana terus dalam pelayar.</p>
            </div>
          </div>

          <div className={generatedPrompt ? 'result-panel is-visible' : 'result-panel'} aria-live="polite">
            <div className="result-header">
              <div><span className="step-number">03</span><p>Prompt anda yang sedia digunakan</p></div>
              <div className="result-actions">
                <button type="button" onClick={handleReset}><RotateCcw size={15} /> Tetapkan semula</button>
                <button className="copy-button" type="button" onClick={handleCopy} disabled={!generatedPrompt}>
                  {copyState === 'copied' ? <Check size={16} /> : <Clipboard size={16} />}
                  {copyState === 'copied' ? 'Disalin!' : copyState === 'error' ? 'Gagal menyalin' : 'Salin prompt'}
                </button>
              </div>
            </div>
            {generatedPrompt ? (
              <pre id="prompt-output" tabIndex={-1}>{generatedPrompt}</pre>
            ) : (
              <div className="empty-result"><FileText size={22} /><span>Prompt yang dijana akan dipaparkan di sini.</span></div>
            )}
          </div>
        </section>

        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-heading compact"><span>02 / Cara ia berfungsi</span><h2 id="how-title">Kurang andaian. Lebih jelas.</h2></div>
          <div className="how-grid">
            <article><b>01</b><h3>Pilih format anda</h3><p>Mulakan dengan jenis kandungan jualan yang ingin anda hasilkan.</p></article>
            <article><b>02</b><h3>Masukkan konteks</h3><p>Berikan AI maklumat audiens, matlamat, nada dan tawaran yang penting.</p></article>
            <article><b>03</b><h3>Salin dan hasilkan</h3><p>Tampal prompt tersusun ke dalam ChatGPT, Claude atau AI pilihan anda.</p></article>
          </div>
        </section>

        <section className="tips-section" id="tips">
          <Sparkles size={20} />
          <div><span>Tip prompt</span><p>Maklumat yang khusus menghasilkan jawapan yang khusus. Sertakan kelebihan sebenar, bantahan pelanggan dan bukti apabila boleh.</p></div>
        </section>
      </main>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><Sparkles size={15} /></span>promptly<span className="brand-dot">.</span></a><p>Bina dengan jelas. Menjual dengan yakin.</p><span>© 2026 Promptly Studio</span></footer>
    </div>
  );
}
