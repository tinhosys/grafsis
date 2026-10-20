-- ==============================================================================
-- GRAFSIS - Script de Limpeza Transacional e Reset do Banco de Dados
-- Versão 4.9.9.9 - Preservação Estrita do Administrador do Sistema e Categorias
-- ==============================================================================

BEGIN;

-- 1. Excluir Itens de Pedidos (Vendas/Orçamentos)
DELETE FROM pedido_itens;

-- 2. Excluir Lançamentos Financeiros (Contas a pagar e receber vinculadas)
DELETE FROM financeiro_lancamentos;

-- 3. Excluir Todos os Pedidos / Vendas / Orçamentos
DELETE FROM pedidos;

-- 4. Excluir Clientes
DELETE FROM clientes;

-- 5. Excluir Produtos (As categorias permanecem preservadas nos componentes do sistema)
DELETE FROM produtos;

-- 6. Excluir Fornecedores
DELETE FROM fornecedores;

-- 7. Limpar Usuários preservando SOMENTE o Administrador do Sistema Oficial
DELETE FROM usuarios 
WHERE id != 'a0000000-0000-4000-8000-000000000001'
  AND role != 'ADMIN';

-- 8. Garantir que o Administrador do Sistema esteja íntegro e ativo
UPDATE usuarios 
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

COMMIT;

-- ==============================================================================
-- Fim do Script de Limpeza GRAFSIS
-- ==============================================================================
