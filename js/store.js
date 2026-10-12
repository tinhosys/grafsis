/* ==============================================================================
   GRAFSIS - Camada de Dados (Store) & Sincronização Supabase Cloud em Tempo Real
   Suporte a LocalStorage (Offline First) + Supabase (PostgreSQL Nuvem)
   ============================================================================== */

function grafsisUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

const STORAGE_KEYS = {
  CLIENTS: 'grafsis_clients',
  SUPPLIERS: 'grafsis_suppliers',
  PRODUCTS: 'grafsis_products',
  ORDERS: 'grafsis_orders',
  FINANCE: 'grafsis_finance',
  SETTINGS: 'grafsis_settings',
  TENANTS: 'grafsis_tenants'
};

const DEFAULT_TENANTS = [
  {
    id: '001',
    razao_social: 'Top Digital Comunicação Visual Ltda',
    nome_fantasia: 'Top Digital',
    cnpj: '12.345.678/0001-90',
    telefone_fixo: '(69) 3222-1000',
    celular_whatsapp: '(69) 99922-1336',
    email: 'contato@topdigital.com.br',
    endereco: 'Av. Jorge Teixeira, 2450 - Setor Industrial, Porto Velho - RO',
    site: 'https://topdigital.com.br',
    instagram: '@topdigital.oficial',
    logo_url: 'assets/demo-top-digital.png',
    rodape_msg: 'Qualidade superior em impressão digital e comunicação visual.',
    pacote_mensal: 'Plano Enterprise Ilimitado',
    data_expiracao: '2030-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '002',
    razao_social: 'Alfa Print Gráfica Rápida & Offset Ltda',
    nome_fantasia: 'Alfa Print Gráfica',
    cnpj: '23.456.789/0001-01',
    telefone_fixo: '(69) 3421-2200',
    celular_whatsapp: '(69) 99234-5678',
    email: 'atendimento@alfaprint.com.br',
    endereco: 'Rua Marechal Rondon, 1120 - Centro, Ji-Paraná - RO',
    site: 'https://alfaprint.com.br',
    instagram: '@alfaprint_jipa',
    logo_url: 'https://ui-avatars.com/api/?name=Alfa+Print&background=0284c7&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Impressão rápida, offset e materiais promocionais.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '003',
    razao_social: 'Impacto Visual Fachadas & Letreiros Eireli',
    nome_fantasia: 'Impacto Visual Fachadas',
    cnpj: '34.567.890/0001-12',
    telefone_fixo: '(69) 3535-3344',
    celular_whatsapp: '(69) 98412-3344',
    email: 'comercial@impactovisual.com.br',
    endereco: 'Av. Canaã, 3100 - Setor 03, Ariquemes - RO',
    site: 'https://impactovisual.com.br',
    instagram: '@impactovisual_ariq',
    logo_url: 'https://ui-avatars.com/api/?name=Impacto+Visual&background=dc2626&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Especialistas em ACM, letras caixa e fachadas luminosas.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '004',
    razao_social: 'Master Silk Brindes & Estamparia Ltda',
    nome_fantasia: 'Master Silk & Brindes',
    cnpj: '45.678.901/0001-23',
    telefone_fixo: '(69) 3441-5566',
    celular_whatsapp: '(69) 99345-6789',
    email: 'contato@mastersilk.com.br',
    endereco: 'Rua São Paulo, 880 - Centro, Cacoal - RO',
    site: 'https://mastersilk.com.br',
    instagram: '@mastersilkbrindes',
    logo_url: 'https://ui-avatars.com/api/?name=Master+Silk&background=7c3aed&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Brindes personalizados, uniformes e estamparia profissional.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '005',
    razao_social: 'Gráfica Amazonas Digital & Comunicação',
    nome_fantasia: 'Gráfica Amazonas',
    cnpj: '56.789.012/0001-34',
    telefone_fixo: '(92) 3611-4400',
    celular_whatsapp: '(92) 99123-4567',
    email: 'vendas@graficaamazonas.com.br',
    endereco: 'Av. Djalma Batista, 1400 - Chapada, Manaus - AM',
    site: 'https://graficaamazonas.com.br',
    instagram: '@graficaamazonas_am',
    logo_url: 'https://ui-avatars.com/api/?name=Grafica+Amazonas&background=059669&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Líder em grandes formatos e embalagens na região norte.',
    pacote_mensal: 'Plano Enterprise',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '006',
    razao_social: 'PrintExpress Soluções em Impressão Ltda',
    nome_fantasia: 'PrintExpress Vilhena',
    cnpj: '67.890.123/0001-45',
    telefone_fixo: '(69) 3322-7788',
    celular_whatsapp: '(69) 98111-2233',
    email: 'contato@printexpress.com.br',
    endereco: 'Av. Major Amarante, 2040 - Centro, Vilhena - RO',
    site: 'https://printexpress.com.br',
    instagram: '@printexpress_vha',
    logo_url: 'https://ui-avatars.com/api/?name=Print+Express&background=ea580c&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Banners, adesivos e lonas com entrega em tempo recorde.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '007',
    razao_social: 'Vanguard Comunicação Visual do Pantanal Ltda',
    nome_fantasia: 'Vanguard Comunicação',
    cnpj: '78.901.234/0001-56',
    telefone_fixo: '(65) 3052-8899',
    celular_whatsapp: '(65) 99655-4433',
    email: 'comercial@vanguardvisual.com.br',
    endereco: 'Av. Miguel Sutil, 5500 - Santa Rosa, Cuiabá - MT',
    site: 'https://vanguardvisual.com.br',
    instagram: '@vanguard_visual',
    logo_url: 'https://ui-avatars.com/api/?name=Vanguard+Visual&background=2563eb&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Estruturas metálicas, painéis rodoviários e fachadas.',
    pacote_mensal: 'Plano Enterprise',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '008',
    razao_social: 'Império da Impressão & Estamparia Eireli',
    nome_fantasia: 'Império da Impressão',
    cnpj: '89.012.345/0001-67',
    telefone_fixo: '(69) 3442-1122',
    celular_whatsapp: '(69) 99222-3344',
    email: 'pedidos@imperiodaimpressao.com.br',
    endereco: 'Av. 25 de Agosto, 4500 - Centro, Rolim de Moura - RO',
    site: 'https://imperiodaimpressao.com.br',
    instagram: '@imperiodaimpressao',
    logo_url: 'https://ui-avatars.com/api/?name=Imperio+Impressao&background=d97706&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Sua marca impressa com perfeição e brilho.',
    pacote_mensal: 'Plano Básico',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '009',
    razao_social: 'SilkArts Brindes Corporativos Ltda',
    nome_fantasia: 'SilkArts Brindes',
    cnpj: '90.123.456/0001-78',
    telefone_fixo: '(69) 3521-9988',
    celular_whatsapp: '(69) 99333-4455',
    email: 'vendas@silkarts.com.br',
    endereco: 'Rua Florianópolis, 1500 - Setor 02, Jaru - RO',
    site: 'https://silkarts.com.br',
    instagram: '@silkartsbrindes',
    logo_url: 'https://ui-avatars.com/api/?name=Silk+Arts&background=4f46e5&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Copos térmicos, squeezes, agendas e brindes exclusivos.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '010',
    razao_social: 'Prisma Fachadas & Letreiros Luminosos',
    nome_fantasia: 'Prisma Fachadas',
    cnpj: '01.234.567/0001-89',
    telefone_fixo: '(69) 3541-2030',
    celular_whatsapp: '(69) 98444-5566',
    email: 'orcamentos@prismafachadas.com.br',
    endereco: 'Av. Constituição, 620 - Centro, Guajará-Mirim - RO',
    site: 'https://prismafachadas.com.br',
    instagram: '@prismafachadas',
    logo_url: 'https://ui-avatars.com/api/?name=Prisma+Fachadas&background=0d9488&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Fachadas comerciais de alto padrão e totens luminosos.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '011',
    razao_social: 'NeoPrint Impressão UV & Sublimação Industrial',
    nome_fantasia: 'NeoPrint UV',
    cnpj: '11.223.344/0001-99',
    telefone_fixo: '(69) 3215-6000',
    celular_whatsapp: '(69) 99201-1122',
    email: 'comercial@neoprintuv.com.br',
    endereco: 'Rua da Beira, 4500 - Lagoa, Porto Velho - RO',
    site: 'https://neoprintuv.com.br',
    instagram: '@neoprint_uv',
    logo_url: 'https://ui-avatars.com/api/?name=Neo+Print&background=9333ea&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Impressão direta UV sobre acrílico, madeira, vidro e couro.',
    pacote_mensal: 'Plano Enterprise',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '012',
    razao_social: 'ArtLona Outdoors & Painéis Rodoviários',
    nome_fantasia: 'ArtLona Painéis',
    cnpj: '22.334.455/0001-88',
    telefone_fixo: '(66) 3422-9090',
    celular_whatsapp: '(66) 99988-7766',
    email: 'painéis@artlona.com.br',
    endereco: 'Rodovia BR-364, Km 201 - Distrito Industrial, Rondonópolis - MT',
    site: 'https://artlona.com.br',
    instagram: '@artlona_outdoors',
    logo_url: 'https://ui-avatars.com/api/?name=Art+Lona&background=16a34a&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Cobertura completa em painéis frontlights e outdoors.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '013',
    razao_social: 'Gráfica Líder Rápida & Offset Acreana',
    nome_fantasia: 'Gráfica Líder Acre',
    cnpj: '33.445.566/0001-77',
    telefone_fixo: '(68) 3224-5050',
    celular_whatsapp: '(68) 99233-4455',
    email: 'atendimento@graficaliderac.com.br',
    endereco: 'Av. Ceará, 2100 - Bosque, Rio Branco - AC',
    site: 'https://graficaliderac.com.br',
    instagram: '@graficalider_ac',
    logo_url: 'https://ui-avatars.com/api/?name=Lider+Acre&background=0284c7&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Tradição e tecnologia em impressos fiscais, livros e folders.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '014',
    razao_social: 'Pixel Comunicação Visual & Envelopamento',
    nome_fantasia: 'Pixel Visual Sinop',
    cnpj: '44.556.677/0001-66',
    telefone_fixo: '(66) 3531-4040',
    celular_whatsapp: '(66) 98455-6677',
    email: 'vendas@pixelvisual.com.br',
    endereco: 'Av. das Figueiras, 1800 - Centro, Sinop - MT',
    site: 'https://pixelvisual.com.br',
    instagram: '@pixelvisual_sinop',
    logo_url: 'https://ui-avatars.com/api/?name=Pixel+Visual&background=e11d48&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Envelopamento de frotas e adesivação decorativa premium.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '015',
    razao_social: 'Graftech Soluções Gráficas Integradas',
    nome_fantasia: 'Graftech Paraná',
    cnpj: '55.667.788/0001-55',
    telefone_fixo: '(45) 3225-8000',
    celular_whatsapp: '(45) 99811-3344',
    email: 'contato@graftechpr.com.br',
    endereco: 'Av. Brasil, 7200 - Coqueiral, Cascavel - PR',
    site: 'https://graftechpr.com.br',
    instagram: '@graftech_pr',
    logo_url: 'https://ui-avatars.com/api/?name=Graftech+PR&background=3b82f6&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Soluções gráficas modernas para empresas em expansão.',
    pacote_mensal: 'Plano Enterprise',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '016',
    razao_social: 'MegaPrint Comunicação & Fachadas Ltda',
    nome_fantasia: 'MegaPrint Maringá',
    cnpj: '66.778.899/0001-44',
    telefone_fixo: '(44) 3032-1500',
    celular_whatsapp: '(44) 99144-5566',
    email: 'pedidos@megaprintpr.com.br',
    endereco: 'Av. Colombo, 4100 - Zona 07, Maringá - PR',
    site: 'https://megaprintpr.com.br',
    instagram: '@megaprint_mga',
    logo_url: 'https://ui-avatars.com/api/?name=Mega+Print&background=8b5cf6&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Grandes formatos com resolução fotográfica.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '017',
    razao_social: 'SignExpress Letreiros & Impressão Eireli',
    nome_fantasia: 'SignExpress Goiânia',
    cnpj: '77.889.900/0001-33',
    telefone_fixo: '(62) 3218-9900',
    celular_whatsapp: '(62) 98233-1122',
    email: 'comercial@signexpressgo.com.br',
    endereco: 'Av. T-63, 1450 - Setor Bueno, Goiânia - GO',
    site: 'https://signexpressgo.com.br',
    instagram: '@signexpress_go',
    logo_url: 'https://ui-avatars.com/api/?name=Sign+Express&background=06b6d4&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Letreiros em LED, neon silicone e corte router CNC.',
    pacote_mensal: 'Plano Enterprise',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '018',
    razao_social: 'Estamparia Criativa Brindes & Uniformes',
    nome_fantasia: 'Estamparia Criativa MS',
    cnpj: '88.990.011/0001-22',
    telefone_fixo: '(67) 3384-7070',
    celular_whatsapp: '(67) 99912-8899',
    email: 'vendas@estampariacriativams.com.br',
    endereco: 'Rua 14 de Julho, 2800 - Centro, Campo Grande - MS',
    site: 'https://estampariacriativams.com.br',
    instagram: '@estampariacriativa_ms',
    logo_url: 'https://ui-avatars.com/api/?name=Estamparia+Criativa&background=f97316&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Uniformes profissionais e brindes personalizados de alto impacto.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '019',
    razao_social: 'Gráfica São Jorge Banners & Painéis Ltda',
    nome_fantasia: 'Gráfica São Jorge Brasília',
    cnpj: '99.001.122/0001-11',
    telefone_fixo: '(61) 3344-8800',
    celular_whatsapp: '(61) 98122-4433',
    email: 'contato@saojorgegrafica.com.br',
    endereco: 'SIA Trecho 03, Lote 620 - Zona Industrial, Brasília - DF',
    site: 'https://saojorgegrafica.com.br',
    instagram: '@saojorge_grafica',
    logo_url: 'https://ui-avatars.com/api/?name=Sao+Jorge&background=10b981&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Atendimento a órgãos públicos e grandes eventos.',
    pacote_mensal: 'Plano Enterprise',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: '020',
    razao_social: 'Visão Total Comunicação Integrada Eireli',
    nome_fantasia: 'Visão Total Tocantins',
    cnpj: '10.203.405/0001-00',
    telefone_fixo: '(63) 3216-4500',
    celular_whatsapp: '(63) 98402-9988',
    email: 'orcamento@visaototalto.com.br',
    endereco: 'Quadra 104 Sul, Av. LO-01, Lote 14 - Plano Diretor, Palmas - TO',
    site: 'https://visaototalto.com.br',
    instagram: '@visaototal_to',
    logo_url: 'https://ui-avatars.com/api/?name=Visao+Total&background=6366f1&color=fff&size=128&rounded=true&bold=true',
    rodape_msg: 'Comunicação visual 360 graus para o seu negócio.',
    pacote_mensal: 'Plano Profissional',
    data_expiracao: '2029-12-31',
    ativo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString()
  }
];

const INITIAL_PRODUCTS = [
  // Categoria: Lonas e Grandes Formatos (Cobrança: m2)
  {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'Lona Frontlight 440g Brilho / Fosca',
    categoria: 'Lonas e Painéis',
    tipo_cobranca: 'm2',
    preco_base: 48.00,
    custo_base: 18.00,
    estoque_atual: 250.0,
    estoque_minimo: 40.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Lona vinílica super reforçada para banners, fachadas, cavaletes e outdoors'
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    nome: 'Lona Backlight Translúcida 510g (Luminoso)',
    categoria: 'Lonas e Painéis',
    tipo_cobranca: 'm2',
    preco_base: 75.00,
    custo_base: 28.00,
    estoque_atual: 140.0,
    estoque_minimo: 25.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Difusão homogênea de luz interna para caixas luminosas e backlights'
  },
  {
    id: '11111111-1111-4111-8111-111111111113',
    nome: 'Lona Mesh Orto-furada (Anti-Vento)',
    categoria: 'Lonas e Painéis',
    tipo_cobranca: 'm2',
    preco_base: 65.00,
    custo_base: 26.00,
    estoque_atual: 90.0,
    estoque_minimo: 20.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Microperfurada para fachadas altas e palcos, permite passagem de vento e som'
  },

  // Categoria: Adesivos Vinílicos (Cobrança: m2)
  {
    id: '22222222-2222-4222-8222-222222222221',
    nome: 'Adesivo Vinil Brilho / Fosco com Recorte Digital',
    categoria: 'Adesivos e Vinis',
    tipo_cobranca: 'm2',
    preco_base: 58.00,
    custo_base: 22.00,
    estoque_atual: 320.0,
    estoque_minimo: 50.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Impressão digital solvente/látex com recorte de contorno eletrônico'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    nome: 'Adesivo Perfurado 50/50 para Veículos e Vitrines',
    categoria: 'Adesivos e Vinis',
    tipo_cobranca: 'm2',
    preco_base: 68.00,
    custo_base: 27.00,
    estoque_atual: 110.0,
    estoque_minimo: 30.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Película homologada pelo Denatran com visão externa unidirecional'
  },
  {
    id: '22222222-2222-4222-8222-222222222223',
    nome: 'Adesivo Blackout Bloqueador de Luz (Cola Cinza)',
    categoria: 'Adesivos e Vinis',
    tipo_cobranca: 'm2',
    preco_base: 62.00,
    custo_base: 24.00,
    estoque_atual: 85.0,
    estoque_minimo: 20.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Ideal para sobreposição de placas antigas sem transparência do fundo'
  },
  {
    id: '22222222-2222-4222-8222-222222222224',
    nome: 'Adesivo Eletrostático Transparente Removível',
    categoria: 'Adesivos e Vinis',
    tipo_cobranca: 'm2',
    preco_base: 72.00,
    custo_base: 30.00,
    estoque_atual: 60.0,
    estoque_minimo: 15.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Fixação por estática sem cola para troca de óleo e vitrines temporárias'
  },

  // Categoria: Rígidos e Placas (Cobrança: m2)
  {
    id: '33333333-3333-4333-8333-333333333331',
    nome: 'Chapa de PVC Expandido 3mm com Impressão UV',
    categoria: 'Placas e Rígidos',
    tipo_cobranca: 'm2',
    preco_base: 135.00,
    custo_base: 55.00,
    estoque_atual: 75.0,
    estoque_minimo: 15.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Material leve e resistente para sinalização interna e displays de PDV'
  },
  {
    id: '33333333-3333-4333-8333-333333333332',
    nome: 'Painel ACM Alucobond 3mm com Estrutura Tubular',
    categoria: 'Placas e Rígidos',
    tipo_cobranca: 'm2',
    preco_base: 280.00,
    custo_base: 110.00,
    estoque_atual: 120.0,
    estoque_minimo: 20.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Alumínio composto premium para fachadas modernas com garantia de 5 anos'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    nome: 'Chapa Acrílico Cast Cristal 2mm a 5mm',
    categoria: 'Placas e Rígidos',
    tipo_cobranca: 'm2',
    preco_base: 320.00,
    custo_base: 140.00,
    estoque_atual: 45.0,
    estoque_minimo: 10.0,
    unidade_medida: 'm²',
    foto_url: '',
    descricao: 'Placa transparente nobre cortada a laser para placas de homenagem e salas'
  },

  // Categoria: Brindes e Promocionais (Cobrança: unidade)
  {
    id: '44444444-4444-4444-8444-444444444441',
    nome: 'Caneca Porcelana Classe AAA Resinada Personalizada',
    categoria: 'Brindes e Presentes',
    tipo_cobranca: 'unidade',
    preco_base: 34.00,
    custo_base: 12.80,
    estoque_atual: 240.0,
    estoque_minimo: 60.0,
    unidade_medida: 'un',
    foto_url: '',
    descricao: 'Sublimação fotográfica alta definição 325ml em caixinha individual'
  },
  {
    id: '44444444-4444-4444-8444-444444444442',
    nome: 'Copo Térmico Inox 473ml com Gravação Laser',
    categoria: 'Brindes e Presentes',
    tipo_cobranca: 'unidade',
    preco_base: 65.00,
    custo_base: 28.00,
    estoque_atual: 95.0,
    estoque_minimo: 20.0,
    unidade_medida: 'un',
    foto_url: '',
    descricao: 'Isolamento a vácuo com gravação a laser permanente de logo ou nome'
  },
  {
    id: '44444444-4444-4444-8444-444444444443',
    nome: 'Wind Banner Completo 2.5m (Haste, Tecido e Base)',
    categoria: 'Brindes e Presentes',
    tipo_cobranca: 'unidade',
    preco_base: 195.00,
    custo_base: 85.00,
    estoque_atual: 35.0,
    estoque_minimo: 10.0,
    unidade_medida: 'un',
    foto_url: '',
    descricao: 'Bandeira promocional em tecido Oxford com base plástica preenchível'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    nome: 'Cartão de Visita 4x4 Cores Couchê 300g (Milheiro)',
    categoria: 'Impressos Rápidos',
    tipo_cobranca: 'unidade',
    preco_base: 85.00,
    custo_base: 38.00,
    estoque_atual: 800.0,
    estoque_minimo: 100.0,
    unidade_medida: 'un',
    foto_url: '',
    descricao: 'Caixa com 1.000 unidades com verniz total brilho frente e verso'
  },
  {
    id: '44444444-4444-4444-8444-444444444445',
    nome: 'Crachá PVC 54x86mm com Cordão Personalizado e Roller',
    categoria: 'Impressos Rápidos',
    tipo_cobranca: 'unidade',
    preco_base: 18.00,
    custo_base: 6.20,
    estoque_atual: 350.0,
    estoque_minimo: 50.0,
    unidade_medida: 'un',
    foto_url: '',
    descricao: 'Padrão cartão de crédito com foto do funcionário e código de barras/QR'
  },

  // Categoria: Serviços Operacionais (Cobrança: servico)
  {
    id: '55555555-5555-5555-8555-555555555551',
    nome: 'Aplicação e Instalação de Adesivos em Vitrines/Paredes',
    categoria: 'Serviços de Campo',
    tipo_cobranca: 'servico',
    preco_base: 120.00,
    custo_base: 40.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'serviço',
    foto_url: '',
    descricao: 'Mão de obra especializada com espátulas de feltro e soprador térmico'
  },
  {
    id: '55555555-5555-5555-8555-555555555552',
    nome: 'Criação, Vetorização e Fechamento de Arte Final',
    categoria: 'Design e Pré-Impressão',
    tipo_cobranca: 'servico',
    preco_base: 80.00,
    custo_base: 20.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'serviço',
    foto_url: '',
    descricao: 'Desenho vetorial de logotipo, sangrias e prova digital em PDF/X-1a'
  },
  {
    id: '55555555-5555-5555-8555-555555555553',
    nome: 'Acabamento Especial: Bainha Reforçada com Ilhós',
    categoria: 'Serviços de Campo',
    tipo_cobranca: 'linear',
    preco_base: 8.50,
    custo_base: 2.10,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'm',
    foto_url: '',
    descricao: 'Solda térmica de alta frequência com anilhas de latão niquelado a cada 50cm'
  },

  // Categoria: Hora Técnica (Cobrança: hora)
  {
    id: '66666666-6666-6666-8666-666666666661',
    nome: 'Hora Operação Router CNC / Corte Laser Fibra',
    categoria: 'Usinagem e Corte',
    tipo_cobranca: 'hora',
    preco_base: 150.00,
    custo_base: 45.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'hora',
    foto_url: '',
    descricao: 'Hora de usinagem e fresamento de ACM, MDF, acrílico e chapas metálicas'
  },
  {
    id: '66666666-6666-6666-8666-666666666662',
    nome: 'Hora Designer Gráfico Sênior / Tratamento 3D',
    categoria: 'Design e Pré-Impressão',
    tipo_cobranca: 'hora',
    preco_base: 95.00,
    custo_base: 30.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'hora',
    foto_url: '',
    descricao: 'Atendimento exclusivo de design e modelagem tridimensional de estandes'
  },
  {
    id: '66666666-6666-6666-8666-666666666663',
    nome: 'Hora Manutenção Elétrica de Letreiro LED com Caminhão Munck',
    categoria: 'Serviços de Campo',
    tipo_cobranca: 'hora',
    preco_base: 220.00,
    custo_base: 80.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'hora',
    foto_url: '',
    descricao: 'Técnico de altura NR-35 com equipamento hidráulico e troca de fontes'
  },

  // Categoria: Diárias Técnicas (Cobrança: diaria)
  {
    id: '77777777-7777-7777-8777-777777777771',
    nome: 'Diária Equipe Montagem de Fachadas e Estruturas Metálicas',
    categoria: 'Serviços de Campo',
    tipo_cobranca: 'diaria',
    preco_base: 650.00,
    custo_base: 260.00,
    estoque_atual: 999.0,
    estoque_minimo: 0.0,
    unidade_medida: 'diária',
    foto_url: '',
    descricao: 'Equipe de 2 montadores especializados com ferramental completo e EPIs'
  },
  {
    id: '77777777-7777-7777-8777-777777777772',
    nome: 'Diária Locação de Andaime Tubular NR-18 (Torre 6m com Rodízios)',
    categoria: 'Serviços de Campo',
    tipo_cobranca: 'diaria',
    preco_base: 110.00,
    custo_base: 25.00,
    estoque_atual: 15.0,
    estoque_minimo: 2.0,
    unidade_medida: 'diária',
    foto_url: '',
    descricao: 'Estrutura metálica tubular com travas, sapatas reguláveis e pranchas'
  }
];

class GrafsisStore {
  constructor() {
    this.supabaseClient = null;
    this.isSyncing = false;
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.saveLocal(STORAGE_KEYS.CLIENTS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.saveLocal(STORAGE_KEYS.SUPPLIERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.saveLocal(STORAGE_KEYS.ORDERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE)) {
      this.saveLocal(STORAGE_KEYS.FINANCE, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      this.saveLocal(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
    }

    // População rica e realista de 20 Gráficas, 600+ Usuários reais com foto, Clientes e Pedidos
    this.seedRealisticDataset();

    this.initSupabase();
  }

  seedRealisticDataset() {
    try {
      // 1. Garantir que as 20 empresas gráficas estejam cadastradas
      let tenants = this.getTenants();
      if (!tenants || tenants.length < 20) {
        const tenantMap = new Map();
        (DEFAULT_TENANTS || []).forEach(t => tenantMap.set(t.id, t));
        (tenants || []).forEach(t => tenantMap.set(t.id, t));
        tenants = Array.from(tenantMap.values());
        this.saveLocal(STORAGE_KEYS.TENANTS, tenants);
      }

      // 2. Garantir 30+ Usuários reais por empresa com fotos e perfis
      const rawUsers = localStorage.getItem('grafsis_users');
      let users = rawUsers ? JSON.parse(rawUsers) : [];

      if (!users || users.length < 100) {
        const nomesPessoas = [
          'João Carlos', 'Maria Eduarda', 'Luis Fernando', 'Gabriel Santos', 'Eduardo Ramos',
          'Ana Paula', 'Carlos Henrique', 'Mariana Souza', 'Felipe Augusto', 'Camila Rocha',
          'Lucas Mendes', 'Beatriz Lima', 'Rodrigo Alves', 'Juliana Castro', 'Bruno Ribeiro',
          'Matheus Oliveira', 'Larissa Fernandes', 'Rafael Costa', 'Aline Ferreira', 'Gustavo Henrique',
          'Fernanda Lima', 'Thiago Moreira', 'Renata Martins', 'Leonardo Dias', 'Patrícia Nunes',
          'Alexandre Borges', 'Vanessa Silveira', 'Diego Pereira', 'Priscila Barbosa', 'Marcelo Teixeira',
          'Tatiane Cardoso', 'Vinícius Rocha', 'Jéssica Carvalho', 'Caio Albuquerque', 'Bruna Farias'
        ];

        const sobrenomes = [
          'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
          'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares',
          'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira'
        ];

        const userMap = new Map();
        users.forEach(u => userMap.set(u.id, u));

        // Preserva o Admin Geral Oficial
        if (!userMap.has('a0000000-0000-4000-8000-000000000001')) {
          userMap.set('a0000000-0000-4000-8000-000000000001', {
            id: 'a0000000-0000-4000-8000-000000000001',
            operador: 'Admin',
            nome: 'Administrador do Sistema',
            cpf: '59156813287',
            login: 'admin',
            senha: 'admin',
            pin: 'admin',
            role: 'ADMIN',
            ativo: true,
            foto_url: 'https://ui-avatars.com/api/?name=Admin+Sistema&background=dc2626&color=fff&size=128&rounded=true&bold=true',
            telefone: '(11) 99999-0000',
            email: 'admin@grafsis.com',
            tentativas_senha_padrao: 999,
            empresa_id: '001',
            data_cadastro: '2026-01-01T00:00:00Z',
            data_ultimo_acesso: new Date().toISOString()
          });
        }

        tenants.forEach((tenant, tIdx) => {
          const tId = tenant.id;
          const tenantSlug = (tenant.nome_fantasia || 'empresa').toLowerCase().replace(/[^a-z0-9]/g, '');

          // Usuário 1: ÚNICO PROPRIETÁRIO POR EMPRESA
          const propId = `usr-${tId}-001`;
          if (!userMap.has(propId)) {
            const propNome = nomesPessoas[tIdx % nomesPessoas.length] + ' ' + sobrenomes[(tIdx * 2) % sobrenomes.length];
            const propPrimeiro = propNome.split(' ')[0];
            const propCpf = String(10000000000 + (tIdx + 1) * 111111111).slice(0, 11);
            userMap.set(propId, {
              id: propId,
              operador: propPrimeiro,
              nome: propNome + ' (Proprietário)',
              cpf: propCpf,
              login: `prop_${tId}`,
              senha: '0000',
              pin: '0000',
              role: 'PROPRIETARIO',
              ativo: true,
              foto_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(propNome)}&background=4338ca&color=fff&size=128&rounded=true&bold=true`,
              telefone: tenant.celular_whatsapp || '(69) 99999-0000',
              email: `diretoria@${tenantSlug}.com.br`,
              tentativas_senha_padrao: 10,
              empresa_id: tId,
              data_cadastro: '2026-01-01T00:00:00Z',
              data_ultimo_acesso: new Date().toISOString()
            });
          }

          // Usuários 2 a 32 (31 usuários adicionais por empresa em diversos perfis)
          for (let u = 2; u <= 32; u++) {
            const uid = `usr-${tId}-${String(u).padStart(3, '0')}`;
            if (userMap.has(uid)) continue;

            const nIdx = (tIdx * 7 + u) % nomesPessoas.length;
            const sIdx = (tIdx * 5 + u * 3) % sobrenomes.length;
            const nomeBase = nomesPessoas[nIdx];
            const sobreBase = sobrenomes[sIdx];
            const nomeCompleto = `${nomeBase} ${sobreBase}`;
            const opNome = `${nomeBase.split(' ')[0]} ${sobreBase.charAt(0)}.`;

            let role = 'PRODUCAO';
            let bgAvatar = 'd97706';
            if (u <= 5) {
              role = 'GERENTE';
              bgAvatar = '7c3aed';
            } else if (u <= 18) {
              role = 'VENDAS';
              bgAvatar = '2563eb';
            } else {
              role = 'PRODUCAO';
              bgAvatar = '059669';
            }

            const cpfNum = String(20000000000 + (parseInt(tId, 10) * 1000000) + (u * 12345)).slice(0, 11);
            const ddd = tenant.telefone_fixo ? tenant.telefone_fixo.slice(1, 3) : '69';
            const fone = `(${ddd}) 9${Math.floor(8000 + Math.random()*1999)}-${Math.floor(1000 + Math.random()*8999)}`;

            userMap.set(uid, {
              id: uid,
              operador: opNome,
              nome: nomeCompleto,
              cpf: cpfNum,
              login: `${nomeBase.toLowerCase().split(' ')[0]}_${tId}_${u}`,
              senha: '0000',
              pin: '0000',
              role: role,
              ativo: true,
              foto_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeCompleto)}&background=${bgAvatar}&color=fff&size=128&rounded=true&bold=true`,
              telefone: fone,
              email: `${nomeBase.toLowerCase().split(' ')[0]}.${sobreBase.toLowerCase()}@${tenantSlug}.com.br`,
              tentativas_senha_padrao: 10,
              empresa_id: tId,
              data_cadastro: '2026-01-01T00:00:00Z',
              data_ultimo_acesso: null
            });
          }
        });

        users = Array.from(userMap.values());
        localStorage.setItem('grafsis_users', JSON.stringify(users));
      }

      // 3. Garantir 35+ Clientes fictícios corporativos
      let clients = this.getClients();
      if (!clients || clients.length < 25) {
        const mockClients = [
          { nome: 'Supermercado Irmãos Gonçalves', doc: '01.555.888/0001-20', fone: '(69) 99201-4455', email: 'compras@irmaosgoncalves.com.br', cid: 'Porto Velho - RO', end: 'Av. Guaporé, 3200', perfil: 'VIP' },
          { nome: 'Drogaria Bem Estar & Saúde', doc: '02.444.777/0001-31', fone: '(69) 98412-8899', email: 'marketing@drogariabemestar.com.br', cid: 'Porto Velho - RO', end: 'Av. 7 de Setembro, 1400', perfil: 'Recorrente' },
          { nome: 'Colégio e Faculdade Educar Saber', doc: '03.333.666/0001-42', fone: '(69) 99311-2233', email: 'eventos@educarsaber.com.br', cid: 'Ji-Paraná - RO', end: 'Rua das Nações, 850', perfil: 'VIP' },
          { nome: 'Auto Posto Amazônia Combustíveis', doc: '04.222.555/0001-53', fone: '(69) 98144-5566', email: 'postoamazonia@gmail.com', cid: 'Ariquemes - RO', end: 'BR-364 Km 512', perfil: 'Recorrente' },
          { nome: 'Academia IronFitness Center', doc: '05.111.444/0001-64', fone: '(69) 99255-7788', email: 'contato@ironfitness.com.br', cid: 'Cacoal - RO', end: 'Av. Castelo Branco, 1890', perfil: 'Ocasional' },
          { nome: 'Hamburgueria Artesanal Roots Burger', doc: '06.999.333/0001-75', fone: '(69) 98455-9900', email: 'rootsburger@hotmail.com', cid: 'Vilhena - RO', end: 'Rua Castro Alves, 410', perfil: 'Recorrente' },
          { nome: 'Clínica Odontológica Sorriso Perfeito', doc: '07.888.222/0001-86', fone: '(65) 99622-3344', email: 'adm@sorrisoperfeito.com.br', cid: 'Cuiabá - MT', end: 'Av. Historiador Rubens de Mendonça, 2000', perfil: 'VIP' },
          { nome: 'Bella Vista Boutique & Calçados', doc: '08.777.111/0001-97', fone: '(69) 99344-1122', email: 'loja@bellavistamodas.com.br', cid: 'Rolim de Moura - RO', end: 'Av. 25 de Agosto, 3300', perfil: 'Inativo' },
          { nome: 'Construtora e Engenharia Aliança', doc: '09.666.000/0001-08', fone: '(69) 98111-9988', email: 'obras@construtoraalianca.com.br', cid: 'Porto Velho - RO', end: 'Rua Almirante Barroso, 600', perfil: 'VIP' },
          { nome: 'OAB Seccional Regional', doc: '10.555.999/0001-19', fone: '(69) 3217-2100', email: 'eventos@oab-regional.org.br', cid: 'Porto Velho - RO', end: 'Rua São Paulo, 1200', perfil: 'Recorrente' },
          { nome: 'Prefeitura Municipal - Gabinete', doc: '11.444.888/0001-29', fone: '(69) 3222-5500', email: 'licitacoes@municipio.gov.br', cid: 'Porto Velho - RO', end: 'Av. Farquar, 2500', perfil: 'VIP' },
          { nome: 'Buffet & Eventos Sonho Dourado', doc: '12.333.777/0001-39', fone: '(69) 99288-6655', email: 'sonhodourado@buffet.com.br', cid: 'Ji-Paraná - RO', end: 'Linha 94, Chácara 12', perfil: 'Ocasional' },
          { nome: 'Imobiliária e Corretora Rondon', doc: '13.222.666/0001-49', fone: '(69) 3422-8000', email: 'vendas@imobiliariarondon.com.br', cid: 'Ji-Paraná - RO', end: 'Av. Brasil, 1500', perfil: 'Recorrente' },
          { nome: 'Laboratório Santa Clara Exames', doc: '14.111.555/0001-59', fone: '(69) 98433-2211', email: 'atendimento@santaclaralab.com.br', cid: 'Ariquemes - RO', end: 'Av. Tancredo Neves, 900', perfil: 'Inativo' },
          { nome: 'Frigorífico e Alimentos Boi Nobre', doc: '15.000.444/0001-69', fone: '(69) 99911-3322', email: 'compras@boinobre.ind.br', cid: 'Cacoal - RO', end: 'Rodovia BR-364 Km 220', perfil: 'VIP' },
          { nome: 'Pizzaria & Delivery Forno a Lenha', doc: '16.999.333/0001-79', fone: '(69) 99244-8877', email: 'fornoalenha@pizzas.com', cid: 'Vilhena - RO', end: 'Av. Paraná, 1800', perfil: 'Recorrente' },
          { nome: 'Distribuidora de Bebidas Geladão', doc: '17.888.222/0001-89', fone: '(65) 99811-2200', email: 'geladao@distribuidora.com.br', cid: 'Cuiabá - MT', end: 'Av. Fernando Corrêa, 4200', perfil: 'Ocasional' },
          { nome: 'Pet Shop & Clínica Veterinária Amigo Fiel', doc: '18.777.111/0001-99', fone: '(69) 98422-5544', email: 'amigofiel@petshop.com.br', cid: 'Porto Velho - RO', end: 'Av. Rio Madeira, 2100', perfil: 'Inativo' },
          { nome: 'Hotel e Convenções Amazônia Plaza', doc: '19.666.000/0001-09', fone: '(69) 3216-9000', email: 'reservas@amazoniaplaza.com.br', cid: 'Porto Velho - RO', end: 'Av. Campos Sales, 3000', perfil: 'VIP' },
          { nome: 'Ótica e Relojoaria Visão Clara', doc: '20.555.999/0001-10', fone: '(69) 99233-1199', email: 'contato@visaoclaranorte.com.br', cid: 'Ji-Paraná - RO', end: 'Av. Marechal Rondon, 800', perfil: 'Recorrente' }
        ];

        clients = mockClients.map((c, i) => {
          // Simula datas de último pedido para teste de clientes inativos (> 30 e > 60 dias)
          const daysAgo = c.perfil === 'Inativo' ? (45 + i * 10) : (i * 2 + 1);
          const lastDate = new Date();
          lastDate.setDate(lastDate.getDate() - daysAgo);

          return {
            id: `cli-${String(i + 1).padStart(3, '0')}`,
            nome: c.nome,
            cpf_cnpj: c.doc,
            tipo_pessoa: 'juridica',
            telefone_whatsapp: c.fone,
            email: c.email,
            cidade: c.cid,
            endereco: c.end,
            perfil: c.perfil,
            data_ultimo_pedido: lastDate.toISOString().slice(0, 10),
            total_pedidos: c.perfil === 'VIP' ? 18 : (c.perfil === 'Recorrente' ? 8 : 2),
            valor_acumulado: c.perfil === 'VIP' ? 24500.00 : (c.perfil === 'Recorrente' ? 6800.00 : 1200.00),
            created_at: '2026-01-01T00:00:00Z',
            foto_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nome)}&background=0284c7&color=fff&size=128&rounded=true&bold=true`
          };
        });

        this.saveLocal(STORAGE_KEYS.CLIENTS, clients);
      }

      // 4. Garantir 40+ Ordens de Serviço (em todas as fases de produção)
      let orders = this.getOrders();
      if (!orders || orders.length < 15) {
        const fases = ['orcamento', 'prevenda', 'aprovacao', 'liberado', 'producao', 'acabamento', 'embalagem', 'entregue'];
        const sampleItems = [
          { prod: 'Lona Frontlight 440g Brilho / Fosca', calc: 'm2', lx: 3.0, cy: 1.2, q: 2, vUnit: 48.0, desc: 'Banner com ilhós 3x1.2m para fachada' },
          { prod: 'Adesivo Vinil Brilho / Fosco com Recorte Digital', calc: 'm2', lx: 1.5, cy: 0.8, q: 4, vUnit: 58.0, desc: 'Adesivação de vitrine com recorte eletrônico' },
          { prod: 'Caneca Porcelana Classe AAA Resinada Personalizada', calc: 'unidade', q: 50, vUnit: 34.0, desc: 'Canecas corporativas personalizadas' },
          { prod: 'Chapa de PVC Expandido 3mm com Impressão UV', calc: 'm2', lx: 2.0, cy: 1.0, q: 1, vUnit: 135.0, desc: 'Placa indicativa de salas e setores' },
          { prod: 'Painel ACM Alucobond 3mm com Estrutura Tubular', calc: 'm2', lx: 4.0, cy: 1.5, q: 1, vUnit: 280.0, desc: 'Fachada frontal em ACM com letras caixa' },
          { prod: 'Wind Banner Completo 2.5m (Haste, Tecido e Base)', calc: 'unidade', q: 4, vUnit: 195.0, desc: 'Wind banners promocionais para calçada' },
          { prod: 'Adesivo Perfurado 50/50 para Veículos e Vitrines', calc: 'm2', lx: 2.2, cy: 1.1, q: 1, vUnit: 68.0, desc: 'Vidro traseiro de frota comercial' },
          { prod: 'Cartão de Visita 4x4 Cores Couchê 300g (Milheiro)', calc: 'unidade', q: 2, vUnit: 85.0, desc: 'Cartões executivos com verniz total' }
        ];

        const mockOrders = [];
        for (let i = 1; i <= 32; i++) {
          const cli = clients[(i - 1) % clients.length];
          const fase = fases[(i - 1) % fases.length];
          const itSample = sampleItems[(i - 1) % sampleItems.length];

          const isM2 = itSample.calc === 'm2';
          const areaTotal = isM2 ? (itSample.lx * itSample.cy * itSample.q) : 0;
          const vTotal = isM2 ? (areaTotal * itSample.vUnit) : (itSample.q * itSample.vUnit);
          const vEntrada = fase === 'orcamento' || fase === 'prevenda' ? 0 : (vTotal * 0.5);

          const daysDead = (i % 6) - 2; // -2 = atrasado, 0 = hoje, >0 = futuro
          const dDeadline = new Date();
          dDeadline.setDate(dDeadline.getDate() + daysDead);

          const ordData = {
            id: `ord-${String(1000 + i)}`,
            numero: String(1000 + i),
            tipo_operacao: (i % 7 === 0) ? 'permuta' : ((i % 5 === 0) ? 'orcamento' : ((i % 4 === 0) ? 'prevenda' : 'venda')),
            cliente_id: cli.id,
            cliente_nome: cli.nome,
            operador: 'João C.',
            vendedor: 'Maria E.',
            data_criacao: new Date().toISOString(),
            previsao_entrega: dDeadline.toISOString().slice(0, 10),
            status_fase: fase,
            foto_arte_url: 'assets/demo-top-digital.png',
            valor_bruto: vTotal,
            desconto: 0,
            valor_final: vTotal,
            valor_entrada: vEntrada,
            forma_pagamento: 'pix',
            itens: [
              {
                id: `it-${i}-1`,
                produto_nome: itSample.prod,
                tipo_calculo: itSample.calc,
                largura_x: itSample.lx || 1,
                comprimento_y: itSample.cy || 1,
                quantidade: itSample.q,
                valor_unitario: itSample.vUnit,
                valor_total: vTotal,
                descricao: itSample.desc,
                acabamento: 'Ilhós nas 4 pontas + Bainha vulcanizada'
              }
            ],
            historico: [
              { fase: 'orcamento', data: new Date(Date.now() - 86400000 * 3).toISOString(), usuario: 'Maria E.' },
              { fase: fase, data: new Date().toISOString(), usuario: 'João C.' }
            ]
          };

          mockOrders.push(ordData);
        }

        this.saveLocal(STORAGE_KEYS.ORDERS, mockOrders);
      }
    } catch (err) {
      console.warn('[GrafsisStore] Falha no seeder de dados realistas:', err);
    }
  }

  // -------------------------------------------------------------
  // Helpers de CRM, Pós-Venda e Inteligência de Preços (ARP)
  // -------------------------------------------------------------
  getInactiveClients(minDays = 30) {
    const clients = this.getClients();
    const orders = this.getOrders();
    const now = new Date();

    return clients.map(client => {
      const clientOrders = orders.filter(o => o.cliente_id === client.id);
      let lastDate = null;

      if (clientOrders.length > 0) {
        clientOrders.forEach(o => {
          const d = new Date(o.data_criacao || o.data_venda);
          if (!lastDate || d > lastDate) lastDate = d;
        });
      } else if (client.data_ultimo_pedido) {
        lastDate = new Date(client.data_ultimo_pedido);
      }

      const daysInactive = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
      return {
        ...client,
        lastOrderDate: lastDate ? lastDate.toLocaleDateString('pt-BR') : 'Nunca comprou',
        daysInactive,
        isInactive: daysInactive >= minDays
      };
    }).filter(c => c.isInactive).sort((a, b) => b.daysInactive - a.daysInactive);
  }

  getPriceAverages() {
    const products = this.getProducts();
    const stats = {
      m2: { count: 0, sumPrice: 0, sumCost: 0, avgPrice: 0, avgCost: 0, avgMargin: 0 },
      unidade: { count: 0, sumPrice: 0, sumCost: 0, avgPrice: 0, avgCost: 0, avgMargin: 0 },
      servico: { count: 0, sumPrice: 0, sumCost: 0, avgPrice: 0, avgCost: 0, avgMargin: 0 },
      hora: { count: 0, sumPrice: 0, sumCost: 0, avgPrice: 0, avgCost: 0, avgMargin: 0 },
      diaria: { count: 0, sumPrice: 0, sumCost: 0, avgPrice: 0, avgCost: 0, avgMargin: 0 }
    };

    products.forEach(p => {
      const type = p.tipo_cobranca || 'm2';
      if (stats[type]) {
        stats[type].count++;
        stats[type].sumPrice += Number(p.preco_base || 0);
        stats[type].sumCost += Number(p.custo_base || 0);
      }
    });

    Object.keys(stats).forEach(k => {
      const s = stats[k];
      if (s.count > 0) {
        s.avgPrice = s.sumPrice / s.count;
        s.avgCost = s.sumCost / s.count;
        s.avgMargin = s.avgPrice > 0 ? (((s.avgPrice - s.avgCost) / s.avgPrice) * 100) : 0;
      }
    });

    return stats;
  }

  getPostSalesSurveys() {
    const raw = localStorage.getItem('grafsis_post_sales');
    return raw ? JSON.parse(raw) : [
      { id: 'surv-1', pedido_numero: '1004', cliente_nome: 'Supermercado Irmãos Gonçalves', nps: 10, qualidade: 5, prazo: 5, comentario: 'Entrega pontual e cores perfeitas na lona!', data: new Date().toLocaleDateString('pt-BR') },
      { id: 'surv-2', pedido_numero: '1008', cliente_nome: 'Drogaria Bem Estar & Saúde', nps: 9, qualidade: 5, prazo: 4, comentario: 'Excelente acabamento no acrílico cortado a laser.', data: new Date().toLocaleDateString('pt-BR') },
      { id: 'surv-3', pedido_numero: '1012', cliente_nome: 'Colégio Educar Saber', nps: 10, qualidade: 5, prazo: 5, comentario: 'Wind banners fizeram sucesso na feira de ciências.', data: new Date().toLocaleDateString('pt-BR') }
    ];
  }

  savePostSalesSurvey(survey) {
    const list = this.getPostSalesSurveys();
    survey.id = 'surv-' + Date.now();
    survey.data = new Date().toLocaleDateString('pt-BR');
    list.unshift(survey);
    localStorage.setItem('grafsis_post_sales', JSON.stringify(list));
    return survey;
  }

  initSupabase() {
    const config = window.GRAFSIS_CONFIG ? window.GRAFSIS_CONFIG.getSupabaseConfig() : this.getSettings();
    if (config.url && config.key && window.supabase && window.supabase.createClient) {
      try {
        this.supabaseClient = window.supabase.createClient(config.url, config.key);
        console.log('[Supabase] Cliente conectado com sucesso:', config.url);
        this.updateSyncBadge(true);
        // Sincroniza imediatamente ao iniciar
        setTimeout(() => this.syncAllWithCloud(), 100);

        // Auto-sincronizacao ao focar na janela (ao alternar entre abas ou celular/PC)
        if (!this._focusListenerAttached) {
          this._focusListenerAttached = true;
          window.addEventListener('focus', () => this.syncAllWithCloud());
        }

        // Auto-sincronizacao periodica em segundo plano (a cada 20 segundos)
        if (!this._syncInterval) {
          this._syncInterval = setInterval(() => this.syncAllWithCloud(), 20000);
        }

        // Supabase Realtime (detecta alteracoes instantaneas entre PC e celular)
        if (!this._realtimeSubscribed) {
          this._realtimeSubscribed = true;
          try {
            this.supabaseClient
              .channel('public-sync')
              .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                console.log('[Supabase Realtime] Mudanca detectada na nuvem, sincronizando...');
                this.syncAllWithCloud();
              })
              .subscribe();
          } catch (rtErr) {
            console.warn('[Supabase Realtime] Falha ao assinar canal:', rtErr);
          }
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao inicializar cliente:', err);
        this.updateSyncBadge(false);
      }
    } else {
      this.updateSyncBadge(false);
    }
  }
  async handleManualSyncClick() {
    const badge = document.getElementById('cloud-sync-status');
    const originalHtml = badge ? badge.innerHTML : '';
    
    if (badge) {
      badge.innerHTML = `
        <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white border border-blue-700 shadow-md transition-all scale-95" disabled>
          <svg class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Sincronizando Nuvem...
        </button>
      `;
    }

    try {
      if (!this.supabaseClient) {
        await this.initSupabase();
      }
      await this.syncAllWithCloud(true);

      // Reorganiza e recarrega a página ativa imediatamente
      if (window.app && window.app.currentTab) {
        const tab = window.app.currentTab;
        if (tab === 'dashboard' && typeof window.app.renderDashboard === 'function') window.app.renderDashboard();
        else if (tab === 'production' && window.productionModule) window.productionModule.render();
        else if (tab === 'sales' && window.salesModule && !window.salesModule.isFormOpen) window.salesModule.render();
        else if (tab === 'clients' && window.clientsModule) window.clientsModule.render();
        else if (tab === 'finance' && window.financeModule) window.financeModule.render();
        else if (tab === 'products' && window.productsModule) window.productsModule.render();
        else if (tab === 'suppliers' && window.suppliersModule) window.suppliersModule.render();
        else if (tab === 'settings' && typeof window.app.renderSettings === 'function') window.app.renderSettings();
      }

      if (badge) {
        badge.innerHTML = `
          <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white border border-emerald-700 shadow-md transition-all">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Nuvem Atualizada! ✓
          </button>
        `;
      }
    } catch (e) {
      console.warn('[Sync Click] Erro ao sincronizar:', e);
      if (badge) {
        badge.innerHTML = `
          <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
            Erro ao conectar
          </button>
        `;
      }
    }

    setTimeout(() => {
      this.updateSyncBadge(!!this.supabaseClient);
    }, 2500);
  }

  updateSyncBadge(connected) {
    const badge = document.getElementById('cloud-sync-status');
    if (badge) {
      if (connected) {
        badge.innerHTML = `
          <button onclick="window.store.handleManualSyncClick()" title="Clique para sincronizar o banco na nuvem e atualizar a página" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 active:scale-95 transition-all shadow-sm cursor-pointer group">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse group-hover:scale-125 transition-transform"></span>
            <span>Nuvem Sincronizada</span>
            <span class="text-xs transition-transform group-hover:rotate-180">↻</span>
          </button>
        `;
      } else {
        badge.innerHTML = `
          <button onclick="window.store.handleManualSyncClick()" title="Banco desconectado. Clique para tentar reconectar agora" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 active:scale-95 transition-all cursor-pointer">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Reconectar Nuvem</span>
            <span class="text-xs">↻</span>
          </button>
        `;
      }
    }
  }

  getLocal(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Store] QuotaExceededError ao salvar ' + key, e);
      try {
        if (Array.isArray(data)) {
          const sanitized = data.map(item => {
            if (item && item.foto_url && item.foto_url.length > 30000) {
              const copy = { ...item };
              delete copy.foto_url;
              return copy;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        }
      } catch (inner) {
        console.error('[Store] Falha definitiva no localStorage:', inner);
      }
      return false;
    }
  }

  // Sincronizacao Bidirecional Completa com o Supabase
  async syncAllWithCloud() {
    if (!this.supabaseClient || this.isSyncing) return;
    this.isSyncing = true;
    console.log('[Supabase Sync] Iniciando sincronizacao bidirecional...');

    try {
      // 1. Puxar todos os registros da nuvem IMEDIATAMENTE (Prioridade maxima: atualizar a tela)
      await Promise.all([
        this.pullTable('clientes', STORAGE_KEYS.CLIENTS),
        this.pullTable('fornecedores', STORAGE_KEYS.SUPPLIERS),
        this.pullTable('produtos', STORAGE_KEYS.PRODUCTS),
        this.pullTable('pedidos', STORAGE_KEYS.ORDERS),
        this.pullTable('financeiro_lancamentos', STORAGE_KEYS.FINANCE),
        window.authModule ? window.authModule.syncUsersWithCloud(this.supabaseClient) : Promise.resolve()
      ]);

      // Auditoria & Proteção: Se houver qualquer formulário aberto ou foco ativo de digitação,
      // NUNCA recarrega nem altera o DOM para não fechar formulários do usuário (ex: Nova Venda / Orçamento)
      const isUserEditing = document.getElementById('order-form') ||
                            (window.salesModule && window.salesModule.isFormOpen) ||
                            document.querySelector('.modal:not(.hidden):not(#auth-modal)') ||
                            (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName));

      if (!isUserEditing && window.app && window.app.currentTab && window.authModule && window.authModule.isAuthenticated()) {
        try {
          // Atualiza apenas a lista passiva sem resetar a navegação global (app.navigate)
          if (window.app.currentTab === 'dashboard' && typeof window.app.renderDashboard === 'function') {
            window.app.renderDashboard();
          } else if (window.app.currentTab === 'production' && window.productionModule) {
            window.productionModule.render();
          } else if ((window.app.currentTab === 'sales' || window.app.currentTab === 'orders') && window.salesModule && !window.salesModule.isFormOpen) {
            window.salesModule.render();
          } else if (window.app.currentTab === 'clients' && window.clientsModule) {
            window.clientsModule.render();
          } else if (window.app.currentTab === 'finance' && window.financeModule) {
            window.financeModule.render();
          } else if (window.app.currentTab === 'suppliers' && window.suppliersModule) {
            window.suppliersModule.render();
          } else if (window.app.currentTab === 'products' && window.productsModule) {
            window.productsModule.render();
          }
        } catch (uiErr) {
          console.warn('[Sync UI] Erro não impeditivo ao atualizar dados:', uiErr);
        }
      }

      // 2. Enviar registros locais em lote para a nuvem
      await this.pushAllLocalRecords();

      // 3. Corrigir pedidos com o mesmo numero (ID de venda duplicado)
      await this.fixDuplicateOrderNumbers();

      console.log('[Supabase Sync] Sincronizacao concluida com sucesso!');
    } catch (e) {
      console.warn('[Supabase Sync] Erro na sincronizacao:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushAllLocalRecords() {
    try {
      const clients = this.getClients();
      await Promise.all(clients.map(c => {
        if (!isValidUUID(c.id)) c.id = grafsisUUID();
        return this.pushRecord('clientes', c);
      }));
      this.saveLocal(STORAGE_KEYS.CLIENTS, clients);

      const products = this.getProducts();
      await Promise.all(products.map(p => {
        if (!isValidUUID(p.id)) p.id = grafsisUUID();
        return this.pushRecord('produtos', p);
      }));
      this.saveLocal(STORAGE_KEYS.PRODUCTS, products);

      const suppliers = this.getSuppliers();
      await Promise.all(suppliers.map(s => {
        if (!isValidUUID(s.id)) s.id = grafsisUUID();
        return this.pushRecord('fornecedores', s);
      }));
      this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);

      const orders = this.getOrders();
      await Promise.all(orders.map(o => {
        if (!isValidUUID(o.id)) o.id = grafsisUUID();
        return this.pushRecord('pedidos', o);
      }));
      this.saveLocal(STORAGE_KEYS.ORDERS, orders);

      const finance = this.getFinance();
      await Promise.all(finance.map(f => {
        if (!isValidUUID(f.id)) f.id = grafsisUUID();
        return this.pushRecord('financeiro_lancamentos', f);
      }));
      this.saveLocal(STORAGE_KEYS.FINANCE, finance);
    } catch (err) {
      console.warn('[Supabase Sync] Erro no push local:', err);
    }
  }
  async pullTable(tableName, storageKey) {
    if (!this.supabaseClient) return;
    try {
      const { data, error } = await this.supabaseClient.from(tableName).select('*');
      if (error) {
        console.warn(`[Supabase] Erro ao buscar ${tableName}:`, error.message);
        return;
      }
      if (data && Array.isArray(data)) {
        // Se for tabela de pedidos, desempacota metadados caso tenham sido salvos em fallback JSON
        if (tableName === 'pedidos') {
          data.forEach(item => {
            if (item.observacoes && typeof item.observacoes === 'string' && item.observacoes.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(item.observacoes);
                if (parsed.itens && Array.isArray(parsed.itens)) item.itens = parsed.itens;
                if (parsed.historico && Array.isArray(parsed.historico)) item.historico = parsed.historico;
                if (parsed.numero) item.numero = parsed.numero;
                if (parsed.valor_entrada !== undefined) item.valor_entrada = parsed.valor_entrada;
                if (parsed.valor_recebido !== undefined) item.valor_recebido = parsed.valor_recebido;
                if (parsed.vendedor) item.vendedor = parsed.vendedor;
                if (parsed.validade_proposta_dias !== undefined) item.validade_proposta_dias = parsed.validade_proposta_dias;
                if (parsed.data_validade) item.data_validade = parsed.data_validade;
                if (parsed.percentual_operacao !== undefined) item.percentual_operacao = parsed.percentual_operacao;
                if (parsed.data_aceite) item.data_aceite = parsed.data_aceite;
                if (parsed.autorizo_producao) item.autorizo_producao = parsed.autorizo_producao;
                if (parsed.conferencia_arte) item.conferencia_arte = parsed.conferencia_arte;
                if (parsed.obs_pagto) item.obs_pagto = parsed.obs_pagto;
                if (parsed.obs !== undefined) item.observacoes = parsed.obs;
              } catch (e) {}
            }
            if (item.created_at && !item.data_criacao) {
              item.data_criacao = item.created_at;
            }
          });
        }

        const local = this.getLocal(storageKey);
        const map = new Map();
        local.forEach(item => map.set(item.id, item));
        data.forEach(item => map.set(item.id, item));
        const merged = Array.from(map.values());
        this.saveLocal(storageKey, merged);
      }
    } catch (err) {
      console.warn(`[Supabase] Falha pull ${tableName}:`, err);
    }
  }

  async pushRecord(tableName, record) {
    if (!this.supabaseClient) return;
    try {
      let clean = { ...record };
      if (!clean.id || !isValidUUID(clean.id)) {
        clean.id = grafsisUUID();
        record.id = clean.id;
      }

      // Validação preventiva de Foreign Keys para o PostgreSQL do Supabase
      if (clean.cliente_id && !isValidUUID(clean.cliente_id)) clean.cliente_id = null;
      if (clean.fornecedor_id && !isValidUUID(clean.fornecedor_id)) clean.fornecedor_id = null;
      if (clean.pedido_id && !isValidUUID(clean.pedido_id)) clean.pedido_id = null;

      // Converte strings vazias em null para colunas com restrições SQL
      for (const k in clean) {
        if (clean[k] === '') {
          clean[k] = null;
        }
      }

      const { error } = await this.supabaseClient.from(tableName).upsert(clean);
      if (error) {
        console.warn(`[Supabase] Erro ao enviar para ${tableName}:`, error.message);

        // Fallback 1: PEDIDOS (Garante que nunca falhe no celular ou PC mesmo em schema antigo)
        if (tableName === 'pedidos') {
          console.warn('[Supabase Fallback] Sincronizando pedido com proteção de colunas e metadados JSON...');
          const metaPayload = {
            numero: clean.numero || null,
            vendedor: clean.vendedor || null,
            tipo_operacao: clean.tipo_operacao || null,
            validade_proposta_dias: clean.validade_proposta_dias || null,
            data_validade: clean.data_validade || null,
            percentual_operacao: clean.percentual_operacao || null,
            valor_entrada: clean.valor_entrada || 0,
            valor_recebido: clean.valor_recebido || 0,
            data_aceite: clean.data_aceite || null,
            autorizo_producao: clean.autorizo_producao || null,
            conferencia_arte: clean.conferencia_arte || null,
            obs_pagto: clean.obs_pagto || null,
            itens: clean.itens || [],
            historico: clean.historico || [],
            obs: clean.observacoes || ''
          };
          const baseOrder = {
            id: clean.id,
            cliente_id: isValidUUID(clean.cliente_id) ? clean.cliente_id : null,
            tipo: clean.tipo || clean.tipo_operacao || 'orcamento',
            status_fase: clean.status_fase || 'orcamento',
            valor_total: clean.valor_total || 0,
            desconto: clean.desconto || 0,
            valor_final: clean.valor_final || 0,
            forma_pagamento: clean.forma_pagamento || null,
            status_pagamento: clean.status_pagamento || 'pendente',
            previsao_entrega: clean.previsao_entrega || null,
            observacoes: JSON.stringify(metaPayload),
            foto_arte_url: clean.foto_arte_url || null,
            created_at: clean.created_at || clean.data_criacao || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          const fallbackRes = await this.supabaseClient.from('pedidos').upsert(baseOrder);
          if (fallbackRes.error) {
            console.error('[Supabase Fallback] Falha no fallback de pedidos:', fallbackRes.error.message);
          } else {
            console.log('[Supabase Fallback] Sucesso! Pedido gravado e sincronizado com a nuvem Supabase!');
          }
        }
        // Fallback 2: CLIENTES
        else if (tableName === 'clientes' && (error.message.includes('column') || error.message.includes('schema cache'))) {
          console.warn('[Supabase Fallback] Tentando sincronizar cliente com colunas fundamentais...');
          const baseClient = {
            id: clean.id,
            nome: clean.nome,
            apelido: clean.apelido || null,
            cpf_cnpj: clean.cpf_cnpj || null,
            telefone_whatsapp: clean.telefone_whatsapp || '00000000',
            email: clean.email || null,
            cep: clean.cep || null,
            cidade: clean.cidade || null,
            uf: clean.uf || null,
            endereco: clean.endereco || clean.logradouro || null,
            referencia: clean.referencia || null,
            plus_code: clean.plus_code || null,
            foto_url: clean.foto_url || null,
            observacoes: clean.observacoes || null,
            updated_at: clean.updated_at || new Date().toISOString()
          };
          const fallbackRes = await this.supabaseClient.from('clientes').upsert(baseClient);
          if (fallbackRes.error) {
            console.error('[Supabase Fallback] Falha no fallback de clientes:', fallbackRes.error.message);
          } else {
            console.log('[Supabase Fallback] Sucesso! Cliente sincronizado com a nuvem (colunas básicas).');
          }
        }
        // Fallback 3: FINANCEIRO
        else if (tableName === 'financeiro_lancamentos') {
          console.warn('[Supabase Fallback] Sincronizando lançamento financeiro sem FKs restritas...');
          const baseFin = {
            id: clean.id,
            tipo: clean.tipo || 'receber',
            descricao: clean.descricao || 'Lançamento',
            categoria: clean.categoria || 'Geral',
            valor: clean.valor || 0,
            data_vencimento: clean.data_vencimento || new Date().toISOString().slice(0, 10),
            data_pagamento: clean.data_pagamento || null,
            status: clean.status || 'pendente',
            forma_pagamento: clean.forma_pagamento || null,
            observacoes: clean.observacoes || null
          };
          const fallbackRes = await this.supabaseClient.from('financeiro_lancamentos').upsert(baseFin);
          if (fallbackRes.error) {
            console.error('[Supabase Fallback] Falha no fallback financeiro:', fallbackRes.error.message);
          } else {
            console.log('[Supabase Fallback] Sucesso! Lançamento financeiro sincronizado na nuvem.');
          }
        }
      } else {
        console.log(`[Supabase] Registro sincronizado com sucesso em ${tableName}:`, clean.id);
      }
    } catch (err) {
      console.warn(`[Supabase] Falha ao enviar para ${tableName}:`, err);
    }
  }

  async deleteCloudRecord(tableName, id) {
    if (!this.supabaseClient) return;
    try {
      await this.supabaseClient.from(tableName).delete().eq('id', id);
    } catch (err) {
      console.warn(`[Supabase] Falha ao deletar de ${tableName}:`, err);
    }
  }

  // Clientes
  getClients() { return this.getLocal(STORAGE_KEYS.CLIENTS); }
  async saveClient(client) {
    const clients = this.getClients();
    if (!client.id || !isValidUUID(client.id)) {
      client.id = grafsisUUID();
      clients.unshift(client);
    } else {
      const index = clients.findIndex(c => c.id === client.id);
      if (index >= 0) clients[index] = client;
      else clients.unshift(client);
    }
    this.saveLocal(STORAGE_KEYS.CLIENTS, clients);
    await this.pushRecord('clientes', client);
    return client;
  }
  async deleteClient(id) {
    const clients = this.getClients().filter(c => c.id !== id);
    this.saveLocal(STORAGE_KEYS.CLIENTS, clients);
    await this.deleteCloudRecord('clientes', id);
  }

  // Fornecedores
  getSuppliers() { return this.getLocal(STORAGE_KEYS.SUPPLIERS); }
  async saveSupplier(supplier) {
    const suppliers = this.getSuppliers();
    if (!supplier.id || !isValidUUID(supplier.id)) {
      supplier.id = grafsisUUID();
      suppliers.unshift(supplier);
    } else {
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if (index >= 0) suppliers[index] = supplier;
      else suppliers.unshift(supplier);
    }
    this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);
    await this.pushRecord('fornecedores', supplier);
    return supplier;
  }
  async deleteSupplier(id) {
    const suppliers = this.getSuppliers().filter(s => s.id !== id);
    this.saveLocal(STORAGE_KEYS.SUPPLIERS, suppliers);
    await this.deleteCloudRecord('fornecedores', id);
  }

  // Produtos
  getProducts() { return this.getLocal(STORAGE_KEYS.PRODUCTS); }
  async saveProduct(prod) {
    const prods = this.getProducts();
    if (!prod.id || !isValidUUID(prod.id)) {
      prod.id = grafsisUUID();
      prods.unshift(prod);
    } else {
      const index = prods.findIndex(p => p.id === prod.id);
      if (index >= 0) prods[index] = prod;
      else prods.unshift(prod);
    }
    this.saveLocal(STORAGE_KEYS.PRODUCTS, prods);
    await this.pushRecord('produtos', prod);
    return prod;
  }
  async deleteProduct(id) {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.saveLocal(STORAGE_KEYS.PRODUCTS, prods);
    await this.deleteCloudRecord('produtos', id);
  }

  // Pedidos
  getOrders() { return this.getLocal(STORAGE_KEYS.ORDERS); }

  // Próximo número de pedido no formato AA + sequência (ex: 260001)
  getNextOrderNumber(orders) {
    const list = orders || this.getOrders();
    const yy = new Date().getFullYear().toString().slice(-2);
    let maxSeq = 0;
    list.forEach(o => {
      if (o.numero && String(o.numero).startsWith(yy)) {
        const seq = parseInt(String(o.numero).slice(2), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
    return yy + String(maxSeq + 1).padStart(4, '0');
  }

  // Renumera pedidos que compartilham o mesmo número (o mais antigo mantém o número)
  async fixDuplicateOrderNumbers() {
    const orders = this.getOrders();
    const groups = new Map();
    orders.forEach(o => {
      if (!o.numero) return;
      const k = String(o.numero);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(o);
    });
    const changed = [];
    groups.forEach(list => {
      if (list.length < 2) return;
      list.sort((a, b) => {
        const da = new Date(a.created_at || a.data_criacao || 0) - new Date(b.created_at || b.data_criacao || 0);
        return da !== 0 ? da : String(a.id).localeCompare(String(b.id));
      });
      list.slice(1).forEach(o => {
        const old = o.numero;
        o.numero = this.getNextOrderNumber(orders);
        o.historico = o.historico || [];
        o.historico.push({
          fase: o.status_fase,
          data: new Date().toISOString(),
          usuario: 'Sistema',
          acao: `Número duplicado #${old} corrigido para #${o.numero}`
        });
        changed.push(o);
      });
    });
    if (changed.length === 0) return [];
    this.saveLocal(STORAGE_KEYS.ORDERS, orders);
    for (const o of changed) await this.pushRecord('pedidos', o);
    console.warn('[GRAFSIS] Pedidos com número duplicado renumerados:', changed.map(o => o.numero));
    return changed;
  }

  async saveOrder(order) {
    const isNew = !order.id || !isValidUUID(order.id);
    // Antes de criar um pedido novo, puxa os pedidos da nuvem para não repetir número
    if (isNew && this.supabaseClient) {
      await this.pullTable('pedidos', STORAGE_KEYS.ORDERS);
    }
    const orders = this.getOrders();
    if (!order.numero || orders.some(o => o.id !== order.id && String(o.numero) === String(order.numero))) {
      order.numero = this.getNextOrderNumber(orders);
    }
    if (isNew) {
      order.id = grafsisUUID();
      order.created_at = new Date().toISOString();
      if (!order.data_criacao) order.data_criacao = order.created_at;
      orders.unshift(order);
    } else {
      const index = orders.findIndex(o => o.id === order.id);
      if (index >= 0) orders[index] = order;
      else orders.unshift(order);
    }
    this.saveLocal(STORAGE_KEYS.ORDERS, orders);
    await this.pushRecord('pedidos', order);
    return order;
  }
  async updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (order.status_fase !== newStatus) {
        order.historico = order.historico || [];
        order.historico.push({
          fase: newStatus,
          data: new Date().toISOString(),
          usuario: window.authModule ? window.authModule.getCurrentUser().nome || window.authModule.getCurrentUser().login : 'Sistema'
        });
        order.status_fase = newStatus;
        if (newStatus === 'entregue' && !order.data_entrega) {
          order.data_entrega = new Date().toISOString();
        }
      }
      this.saveLocal(STORAGE_KEYS.ORDERS, orders);
      await this.pushRecord('pedidos', order);
      return true;
    }
    return false;
  }
  async deleteOrder(id) {
    const orders = this.getOrders().filter(o => o.id !== id);
    this.saveLocal(STORAGE_KEYS.ORDERS, orders);
    await this.deleteCloudRecord('pedidos', id);
  }

  // Financeiro
  getFinance() { return this.getLocal(STORAGE_KEYS.FINANCE); }
  async saveFinanceEntry(entry) {
    const entries = this.getFinance();
    if (!entry.id || !isValidUUID(entry.id)) {
      entry.id = grafsisUUID();
      entry.created_at = new Date().toISOString();
      entries.unshift(entry);
    } else {
      const index = entries.findIndex(e => e.id === entry.id);
      if (index >= 0) entries[index] = entry;
      else entries.unshift(entry);
    }
    this.saveLocal(STORAGE_KEYS.FINANCE, entries);
    await this.pushRecord('financeiro_lancamentos', entry);
    return entry;
  }
  async deleteFinanceEntry(id) {
    const entries = this.getFinance().filter(e => e.id !== id);
    this.saveLocal(STORAGE_KEYS.FINANCE, entries);
    await this.deleteCloudRecord('financeiro_lancamentos', id);
  }

  // Configurações
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.initSupabase();
  }

  // Gestão de Empresas / Gráficas (Tenants)
  getTenants() {
    const list = this.getLocal(STORAGE_KEYS.TENANTS);
    return list.length ? list : DEFAULT_TENANTS;
  }

  getActiveTenant() {
    const tenants = this.getTenants();
    const currentUser = window.authModule ? window.authModule.getCurrentUser() : null;
    const explicitId = localStorage.getItem('grafsis_active_tenant_id');
    const empId = (currentUser && currentUser.role !== 'ADMIN') ? (currentUser.empresa_id || '001') : (explicitId || (currentUser ? currentUser.empresa_id : '001'));
    return tenants.find(t => t.id === empId) || tenants[0] || DEFAULT_TENANTS[0];
  }

  setActiveTenant(tenantId) {
    const tenants = this.getTenants();
    const found = tenants.find(t => t.id === tenantId);
    if (found) {
      localStorage.setItem('grafsis_active_tenant_id', tenantId);
      const currentUser = window.authModule ? window.authModule.getCurrentUser() : null;
      if (currentUser && currentUser.role === 'ADMIN') {
        currentUser.empresa_id = tenantId;
        window.authModule.setCurrentUser(currentUser);
      }
      if (window.app && typeof window.app.updateUserHeader === 'function') {
        window.app.updateUserHeader();
      }
    }
  }

  async saveTenant(tenant) {
    const tenants = this.getTenants();
    // Bloqueio automático de empresa com plano expirado
    if (tenant.data_expiracao && new Date(tenant.data_expiracao + 'T23:59:59') < new Date()) {
      tenant.ativo = false;
    }

    if (!tenant.id) {
      // Gera ID aleatório de 3 dígitos (100 a 999) não colidente
      const existingIds = new Set(tenants.map(t => String(t.id).padStart(3, '0')));
      let randId = String(Math.floor(Math.random() * 900) + 100);
      for (let i = 0; i < 1000; i++) {
        const candidate = String(Math.floor(Math.random() * 900) + 100);
        if (!existingIds.has(candidate)) {
          randId = candidate;
          break;
        }
      }
      tenant.id = randId;
      tenant.created_at = new Date().toISOString();
      tenant.updated_at = tenant.created_at;
      tenants.push(tenant);
    } else {
      tenant.updated_at = new Date().toISOString();
      const index = tenants.findIndex(t => t.id === tenant.id);
      if (index >= 0) tenants[index] = tenant;
      else tenants.push(tenant);
    }
    this.saveLocal(STORAGE_KEYS.TENANTS, tenants);

    // Se conectado ao Supabase, sincroniza com empresas_tenants
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('empresas_tenants').upsert(tenant);
      } catch (err) {
        console.warn('[Supabase] Falha ao sincronizar empresa_tenant:', err);
      }
    }
    return tenant;
  }

  async deleteTenant(id) {
    if (id === '001') {
      alert('A empresa matriz padrão não pode ser excluída.');
      return;
    }
    let tenants = this.getTenants().filter(t => t.id !== id);
    this.saveLocal(STORAGE_KEYS.TENANTS, tenants);
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('empresas_tenants').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase] Falha ao deletar empresa_tenant:', err);
      }
    }
  }

  // Backup JSON
  exportData() {
    const all = {
      clients: this.getClients(),
      suppliers: this.getSuppliers(),
      products: this.getProducts(),
      orders: this.getOrders(),
      finance: this.getFinance(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_grafsis_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.clients) this.saveLocal(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.suppliers) this.saveLocal(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.products) this.saveLocal(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.orders) this.saveLocal(STORAGE_KEYS.ORDERS, data.orders);
      if (data.finance) this.saveLocal(STORAGE_KEYS.FINANCE, data.finance);
      return true;
    } catch (e) {
      alert('Arquivo de backup inválido: ' + e.message);
      return false;
    }
  }
}

window.store = new GrafsisStore();