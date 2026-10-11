-- ==============================================================================
-- GRAFSIS - Banco de Dados PostgreSQL (Supabase Free Tier)
-- Sistema de Gestao para Comunicacao Visual, Grafica, Brindes e Impressao Digital
-- ==============================================================================

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    apelido VARCHAR(150),
    cpf_cnpj VARCHAR(30),
    telefone_whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    cep VARCHAR(15),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    endereco TEXT,
    referencia TEXT,
    plus_code VARCHAR(50),
    foto_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(30),
    inscricao_estadual VARCHAR(50),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    endereco TEXT,
    nome_vendedor VARCHAR(150),
    telefone VARCHAR(30),
    celular_whatsapp VARCHAR(30),
    email VARCHAR(150),
    categoria_produtos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE PRODUTOS / SERVICOS
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    tipo_cobranca VARCHAR(30) NOT NULL DEFAULT 'm2', -- 'm2', 'linear', 'unidade', 'servico'
    preco_base NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    custo_base NUMERIC(10,2) DEFAULT 0.00,
    estoque_atual NUMERIC(10,2) DEFAULT 0.00,
    estoque_minimo NUMERIC(10,2) DEFAULT 0.00,
    unidade_medida VARCHAR(20) DEFAULT 'm²',
    foto_url TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE PEDIDOS / VENDAS / PRE-VENDAS
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_sequencial SERIAL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    tipo VARCHAR(30) DEFAULT 'orcamento',
    status_fase VARCHAR(50) DEFAULT 'orcamento',
    valor_total NUMERIC(10,2) DEFAULT 0.00,
    desconto NUMERIC(10,2) DEFAULT 0.00,
    valor_final NUMERIC(10,2) DEFAULT 0.00,
    forma_pagamento VARCHAR(50),
    status_pagamento VARCHAR(30) DEFAULT 'pendente',
    previsao_entrega DATE,
    data_entrega TIMESTAMP WITH TIME ZONE,
    protocolo_recebedor_nome VARCHAR(150),
    protocolo_recebedor_doc VARCHAR(50),
    protocolo_assinatura_url TEXT,
    protocolo_observacao TEXT,
    observacoes TEXT,
    foto_arte_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE ITENS DO PEDIDO (COM CALCULO FRACIONADO X e Y)
CREATE TABLE IF NOT EXISTS pedido_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    descricao_item VARCHAR(255) NOT NULL,
    tipo_calculo VARCHAR(30) DEFAULT 'm2',
    largura_x NUMERIC(10,3) DEFAULT 1.000,
    comprimento_y NUMERIC(10,3) DEFAULT 1.000,
    area_m2 NUMERIC(10,3) DEFAULT 1.000,
    quantidade NUMERIC(10,2) DEFAULT 1.00,
    preco_unitario NUMERIC(10,2) NOT NULL,
    desconto NUMERIC(10,2) DEFAULT 0.00,
    acrescimo NUMERIC(10,2) DEFAULT 0.00,
    valor_total NUMERIC(10,2) NOT NULL,
    acabamentos TEXT,
    observacoes TEXT
);

-- 6. TABELA FINANCEIRA (CONTAS A PAGAR E RECEBER)
CREATE TABLE IF NOT EXISTS financeiro_lancamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL, -- 'receber' ou 'pagar'
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    valor NUMERIC(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'pendente',
    forma_pagamento VARCHAR(50),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    comprovante_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DE USUÁRIOS E CONTROLE DE ACESSO (RBAC)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL DEFAULT '1234',
    pin VARCHAR(20) NOT NULL DEFAULT '1234',
    role VARCHAR(30) NOT NULL DEFAULT 'VENDAS', -- 'ADMIN', 'GERENTE', 'VENDAS', 'PRODUCAO'
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Atualizacoes v2.5.0
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_pessoa VARCHAR(2) DEFAULT 'PF';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS instagram VARCHAR(150);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS numero VARCHAR(50);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS complemento VARCHAR(150);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS bairro VARCHAR(150);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;

