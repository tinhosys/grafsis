/* ==============================================================================
   GRAFSIS - Configurações Globais & Conexão Supabase Cloud
   ============================================================================== */

window.GRAFSIS_CONFIG = {
  VERSION: '4.9.8.9',
  DEFAULT_SUPABASE_URL: 'https://mirhgxsiwjuondnpekru.supabase.co',
  DEFAULT_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcmhneHNpd2p1b25kbnBla3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5ODcyNzAsImV4cCI6MjEwNjU2MzI3MH0.DaHF9NQiUyYB8GpT-8pCmEWSX321zd3AMYMWKlWOTos',

  getSupabaseConfig() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    } catch (e) {
      saved = {};
    }
    const url = (saved.supabaseUrl && typeof saved.supabaseUrl === 'string') ? saved.supabaseUrl.trim() : '';
    const key = (saved.supabaseKey && typeof saved.supabaseKey === 'string') ? saved.supabaseKey.trim() : '';
    const isValidUrl = url.startsWith('https://') && url.includes('.supabase.co');
    const isValidKey = key.length > 50;

    return {
      url: isValidUrl ? url : this.DEFAULT_SUPABASE_URL,
      key: isValidKey ? key : this.DEFAULT_SUPABASE_KEY
    };
  },

  setSupabaseConfig(url, key) {
    let current = {};
    try {
      current = JSON.parse(localStorage.getItem('grafsis_settings') || '{}');
    } catch (e) {
      current = {};
    }
    current.supabaseUrl = (url || '').trim();
    current.supabaseKey = (key || '').trim();
    localStorage.setItem('grafsis_settings', JSON.stringify(current));
  }
};

/* ==============================================================================
   UTILITÁRIOS GLOBAIS DE SEGURANÇA, SANITIZAÇÃO E NORMALIZAÇÃO (MANUAL MESTRE)
   ============================================================================== */
window.escapeHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

window.isValidWebUrl = function(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

window.isGoogleDriveUrl = function(url) {
  if (!window.isValidWebUrl(url)) return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return host.includes('drive.google.com') || host.includes('docs.google.com') || host.includes('photos.google.com');
  } catch (e) {
    return false;
  }
};

window.formatCleanAddress = function(obj) {
  if (!obj) return '';
  const street = (obj.logradouro || obj.endereco || '').trim();
  const num = (obj.numero || '').trim();
  const comp = (obj.complemento || '').trim();
  const bDist = (obj.bairro || '').trim();
  const city = (obj.cidade || obj.municipio || '').trim();
  const state = (obj.uf || '').trim().toUpperCase();
  const cep = (obj.cep || '').replace(/\D/g, '');

  const parts = [];
  if (street) parts.push(street);
  if (num && num !== 'S/N' && num !== 's/n') parts.push('nº ' + num);
  else if (num) parts.push('S/N');
  if (comp) parts.push(comp);
  if (bDist) parts.push(bDist);
  if (city) parts.push(state ? `${city} - ${state}` : city);
  else if (state) parts.push(state);
  if (cep && cep.length === 8) {
    parts.push('CEP ' + cep.replace(/^(\d{5})(\d{3})$/, '$1-$2'));
  }

  // Remove duplicatas consecutivas e vazios
  const clean = [];
  parts.forEach(p => {
    if (p && !clean.includes(p)) clean.push(p);
  });
  return clean.join(', ');
};

window.formatCanonicalPhone = function(phone, isWhatsApp = false) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  let formatted = phone;
  if (digits.length === 11) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return isWhatsApp ? `${formatted} (WhatsApp)` : formatted;
};

window.formatCpfCnpj = function(doc) {
  if (!doc) return '';
  const digits = String(doc).replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  return doc;
};
