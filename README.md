# GRAFSIS - Sistema de Controle de Vendas, Produção e Comunicação Visual

Sistema completo para **Comunicação Visual, Gráfica Rápida, Brindes, Impressão Digital, Serviços de Recortes e Personalização**.

---

## 🎯 Principais Funcionalidades

1. **Cálculo Fracionado de Produtos (m² e Linear)**:
   - Cálculo instantâneo por metro quadrado: Largura (X) x Comprimento (Y) x Quantidade x Preço Unitário.
   - Venda por metro linear (recortes de perfil, laser, plotter).
   - Peças unitárias (brindes: canecas, copos, camisas, canetas).
2. **Esteira de Fases da Produção (Kanban Interativo)**:
   - 1. Orçamento / Pré-Venda
   - 2. Criação & Aprovação de Layout
   - 3. Fila de Impressão / Recorte / RIP
   - 4. Acabamento / Montagem / Solda / Ilhós
   - 5. Controle de Qualidade
   - 6. Pronto para Retirada
   - 7. Entregue / Concluído
   - Suporte a **Drag and Drop** (arraste o card entre as colunas) e botão de avanço rápido de fase.
3. **Cadastro Completo de Clientes**:
   - Nome, Apelido / Nome Fantasia, CPF/CNPJ, Telefone WhatsApp (com botão direto para conversar).
   - E-mail, CEP com preenchimento automático de endereço via ViaCEP, Cidade, UF, Endereço e Ponto de Referência.
   - **Plus Code** com link direto para o Google Maps.
   - Upload de foto / logotipo.
4. **Cadastro de Fornecedores**:
   - Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Vendedor, Telefones, E-mail e categorias de insumos fornecidos (lonas, vinil, chapas, tintas, brindes).
5. **Vendas, Pré-Vendas e Protocolo de Entrega**:
   - Emissão de pedidos com conferência visual de arte anexada.
   - Envio de orçamento estruturado para o WhatsApp do cliente com 1 clique.
   - **Protocolo de Entrega Oficial** com layout para impressão e área para assinatura do recebedor e documento.
6. **Financeiro Integrado**:
   - Contas a Pagar e a Receber geradas automaticamente nos pedidos e compras.
   - Painel com total a receber, total a pagar e saldo previsto.

---

## ☁️ Como Criar o Banco de Dados Free (Supabase / PostgreSQL)

1. Acesse **[https://supabase.com](https://supabase.com)** e clique em **Start your project** (Totalmente Gratuito).
2. Crie uma conta ou faça login com o GitHub.
3. Crie um novo projeto (ex: `grafsis-db`).
4. No menu lateral do Supabase, clique em **SQL Editor**.
5. Abra o arquivo `database/schema.sql` deste projeto, copie todo o seu código e cole no editor do Supabase.
6. Clique em **RUN**. Todas as tabelas, colunas, chaves primárias UUID e índices de performance serão criados instantaneamente.
7. Vá em **Project Settings > API** e copie sua **Project URL** e chave **anon / public**.
8. No sistema GRAFSIS, vá na aba **BD Free & Config** e cole suas chaves para sincronizar.

---

---

## 👥 Controle de Acesso e Perfis (RBAC)

O sistema possui 4 níveis de perfis de operadores:
- **ADMIN**: Acesso total, incluindo configurações de conexão Supabase, gestão de usuários e exclusões.
- **GERENTE**: Acesso operacional amplo (Vendas, Produção, Clientes, Produtos, Fornecedores e Financeiro).
- **VENDAS**: Emissão de pedidos, orçamentos, calculadora de m², clientes e catálogo (sem financeiro/custos internos).
- **PRODUÇÃO**: Focado na esteira Kanban de produção, acompanhamento e avanço de fases industriais (sem acesso a financeiro ou margens).

*Troca de perfil rápida e autenticação por PIN/Senha no botão de operador no canto superior direito.*

---

## 🚀 Como Subir o Sistema no GitHub e Hospedar Grátis

### 1. Criar Repositório no GitHub
1. Acesse **[https://github.com/new](https://github.com/new)**.
2. Nome do repositório: `grafsis`.
3. Escolha **Public** e clique em **Create repository**.

### 2. Subir os Arquivos via Git
No terminal da pasta do projeto:
```bash
git init
git add .
git commit -m "feat: implementacao de controle de acesso RBAC, versionamento e configuracao render"
git branch -M main
git remote add origin https://github.com/tinhosys/grafsis.git
git push -u origin main
```

### 3. Hospedagem Gratuita no Render (render.com)
1. Acesse **[https://dashboard.render.com/](https://dashboard.render.com/)**.
2. Clique em **New +** e selecione **Static Site** (ou escolha Blueprint com o arquivo `render.yaml`).
3. Conecte sua conta do GitHub e selecione o repositório `grafsis`.
4. Deixe:
   - **Build Command**: em branco (vazio).
   - **Publish Directory**: `.` (ponto).
5. Clique em **Create Static Site**.
6. Em segundos o Render gera uma URL HTTPS gratuita (ex: `https://grafsis.onrender.com`).

---

## 💻 Como Rodar Imediatamente no Computador
Basta dar **duplo clique no arquivo `iniciar_grafsis.bat`** ou abrir diretamente o `index.html`!