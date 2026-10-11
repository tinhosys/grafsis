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
    operador VARCHAR(100) NOT NULL, -- Nome simples (ex: Jose) - unico por empresa
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL, -- Chave unica / identificador
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL DEFAULT '0000',
    pin VARCHAR(20) NOT NULL DEFAULT '0000',
    role VARCHAR(30) NOT NULL DEFAULT 'VENDAS', -- 'ADMIN', 'PROPRIETARIO', 'GERENTE', 'VENDAS', 'PRODUCAO'
    ativo BOOLEAN DEFAULT TRUE,
    foto_url TEXT,
    telefone VARCHAR(30),
    email VARCHAR(150),
    tentativas_senha_padrao INT DEFAULT 10,
    empresa_id VARCHAR(50) DEFAULT '001',
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


ALTER TABLE clientes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';


-- Atualizacoes v2.7.1
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS genero VARCHAR(2);

-- 8. TABELA DE GESTÃO DE EMPRESAS / GRÁFICAS (TENANTS MULTI-CLIENTES - v2.8.0)
CREATE TABLE IF NOT EXISTS empresas_tenants (
    id VARCHAR(50) PRIMARY KEY, -- ID formatado '001', '002', etc.
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(30),
    telefone_fixo VARCHAR(30),
    celular_whatsapp VARCHAR(30),
    email VARCHAR(150),
    endereco TEXT,
    site VARCHAR(255),
    instagram VARCHAR(100),
    logo_url TEXT,
    rodape_msg TEXT,
    pacote_mensal VARCHAR(100) DEFAULT 'Profissional',
    data_expiracao DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Atualizacoes v2.8.0
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS operador VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tentativas_senha_padrao INT DEFAULT 10;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS empresa_id VARCHAR(50) DEFAULT '001';

-- Atualizações v3.6.0 (Pedidos Completos & Validações Operacionais)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero VARCHAR(50);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS itens JSONB DEFAULT '[]';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS historico JSONB DEFAULT '[]';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS valor_recebido NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS vendedor VARCHAR(150);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS obs_pagto TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_aceite TIMESTAMP WITH TIME ZONE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS autorizo_producao VARCHAR(150);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS conferencia_arte VARCHAR(150);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS empresa_id VARCHAR(50) DEFAULT '001';

-- Atualizações v3.7.0 (Tipos de Operação, Validade de Proposta, Permuta e Patrocínio)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_operacao VARCHAR(50) DEFAULT 'venda';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS validade_proposta_dias INT DEFAULT 10;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_validade DATE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS percentual_operacao NUMERIC(5,2) DEFAULT 100.00;
