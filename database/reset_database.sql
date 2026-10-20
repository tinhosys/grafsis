-- ==============================================================================
-- GRAFSIS - Script de Limpeza Transacional e Reset do Banco de Dados
-- Versão 4.9.9.9 - Preservação Estrita do Administrador do Sistema e Categorias
-- ==============================================================================

DO $$ 
BEGIN
    -- 1. Excluir Itens de Pedidos (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedido_itens') THEN
        DELETE FROM public.pedido_itens;
    END IF;

    -- 2. Excluir Lançamentos Financeiros (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financeiro_lancamentos') THEN
        DELETE FROM public.financeiro_lancamentos;
    END IF;

    -- 3. Excluir Todos os Pedidos / Vendas / Orçamentos (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedidos') THEN
        DELETE FROM public.pedidos;
    END IF;

    -- 4. Excluir Clientes (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
        DELETE FROM public.clientes;
    END IF;

    -- 5. Excluir Produtos (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'produtos') THEN
        DELETE FROM public.produtos;
    END IF;

    -- 6. Excluir Fornecedores (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fornecedores') THEN
        DELETE FROM public.fornecedores;
    END IF;

    -- 7. Limpar Usuários preservando SOMENTE o Administrador do Sistema (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        DELETE FROM public.usuarios 
        WHERE id != 'a0000000-0000-4000-8000-000000000001'
          AND role != 'ADMIN';

        UPDATE public.usuarios 
        SET 
          operador = 'Admin',
          nome = 'Administrador do Sistema',
          cpf = '59156813287',
          login = 'admin',
          senha = COALESCE(NULLIF(senha, ''), '4791'),
          pin = COALESCE(NULLIF(pin, ''), '4791'),
          role = 'ADMIN',
          ativo = TRUE,
          empresa_id = '001',
          tentativas_senha_padrao = 999
        WHERE id = 'a0000000-0000-4000-8000-000000000001'
           OR login = 'admin';
    END IF;
END $$;

-- ==============================================================================
-- Fim do Script de Limpeza GRAFSIS
-- ==============================================================================
