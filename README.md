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

---

## 🔄 Resiliência de Conexão Nuvem & Tolerância a Latência Internacional (v4.9.8.2)
- **Tolerância Transcontinental & Blindagem Anti-Oscilação:**
  - Ajuste de timeouts de rede de 3,5s/4s para **12s/15s**, compatíveis com a rota internacional entre o Brasil e os servidores Supabase AWS em Oregon (`us-west-2`).
  - **Mecanismo de Retry Inteligente:** A checagem de saúde da nuvem agora realiza retry automático antes de reportar falha, e exige 2 verificações consecutivas com erro antes de disparar o modal de bloqueio, eliminando falsos positivos por micro-quedas transitórias de ping.
  - **Sincronização Sequencial Otimizada:** As tabelas são sincronizadas sequencialmente em vez de em rajada paralela, evitando saturação do pool de conexões da instância nano do Supabase.
  - Intervalo de verificação em segundo plano calibrado para 45s com proteção de debounce ao alternar janelas.

---

## 🔄 Operação 100% On-line Exclusiva, Gestão Semanal & Menu Destaque (v4.9.8)
- **Operação 100% On-line Exclusiva (Imagem 1):**
  - Desmontagem integral do modo e mensagens de "Modo Retaguarda".
  - O Grafsis opera exclusivamente **100% ON-LINE** e com acesso direto ao banco de dados Supabase na nuvem.
  - Caso o banco de dados esteja inacessível, pausado ou com falha de conexão, o sistema informa imediatamente que está **INOPERANTE** e exibe tela de bloqueio e diagnóstico para evitar operações com dados desatualizados.
- **Indicadores Conectado / Desconectado (Imagem 2):**
  - Aviso no Painel Master de Configurações exibindo expressamente `'100% conectado'` em verde ou `'desconectado'` em vermelho conforme o estado em tempo real da conexão com a nuvem.
  - Badge no topo sincronizado (`100% CONECTADO` / `DESCONECTADO`).
- **Gestão Semanal de Entregas e Produção no Mural de Serviços (Imagem 3):**
  - Novos botões de filtro de gestão operacional:
    * **Pedidos da Semana:** Filtra todos os pedidos com prazo de entrega de Segunda-feira a Domingo da semana corrente, com contador dinâmico.
    * **Semana que Vem:** Filtra pedidos com prazo de entrega da próxima Segunda-feira ao Domingo subsequente, permitindo planejamento antecipado de produção e compras de materiais.
- **Menu Superior Padronizado e com Mais Destaque (Imagem 4):**
  - Todos os botões da barra superior foram padronizados com altura uniforme (`h-10` / 40px), cantos arredondados (`rounded-xl`) e alinhamento geométrico perfeito.
  - Agrupamento cromático:
    * **Grupo 1 (Ação Principal):** Botão `+ Operação` em azul vibrante de destaque.
    * **Grupo 2 (Navegação):** Botões `Dashboard`, `Clientes`, `Operação / Pedido`, `Mural de serviços` e `Catálogo` com cor padronizada no grupo (índigo/slate) e estado ativo elegante.
    * **Grupo 3 (Ferramentas & Status):** Status de conexão, alternador Dia/Noite, Calculadora m², Notificações e Perfil, todos com a mesma altura e proporção.

---

## 🔄 Manual Mestre: Padronização Canônica, Auditoria, Segurança & Sync Multidispositivo (v4.9.7)
- **Motor de Cabeçalho e Rodapé Padronizado (Seção 04)**:
  - Documentos comerciais (Pedidos de Venda, Orçamentos Comerciais, Propostas de Pré-Venda e O.S.) agora possuem layout padronizado:
    * Logomarca da gráfica emissora à esquerda/topo com razão social/fantasia, CNPJ e endereço canônico.
    * Título inequívoco do documento e número da operação (#OP) à direita com status e data/hora de emissão.
    * Destinatário (Cliente) em bloco próprio estruturado com endereço canônico sem duplicações, telefone canônico e CPF/CNPJ.
    * Rodapé oficial com fuso horário de Brasília (BRT), timestamp exato de emissão e identificação de via do sistema.
- **Centralização Cadastral e Normalização Canônica (Seção 03)**:
  - Cliente tratado estritamente como fonte única da verdade através de `cliente_id`.
  - Helpers utilitários canônicos globais: `window.formatCleanAddress`, `window.formatCanonicalPhone` (garantindo DDD) e `window.formatCpfCnpj`.
- **Auditoria e Sincronização Real do Repositório Multi-Dispositivo (Seção 06)**:
  - Sincronização entre múltiplos dispositivos (celular/desktop) de fotos, prints e links do Google Drive via empacotamento no `metaPayload` do fallback `pedidos` no Supabase e desempacotamento no `pullTable`.
  - Proteção de quota local (`localStorage`) com expurgo preventivo de data URLs antigas preservando links e metadados.
- **Segurança da Informação e Sanitização Estrita (Seção 05)**:
  - Sanitização de renderização contra Cross-Site Scripting (XSS) com `window.escapeHtml`.
  - Validação estrita de URLs externas e links do Google Drive, bloqueando protocolos inseguros (`javascript:`, etc.).
  - Upload de anexos limitado a 15MB com bloqueio preventivo de executáveis e scripts (.exe, .bat, .cmd, .sh, .vbs, .js) e rejeição granular informando o motivo sem afetar arquivos íntegros.
- **Alerta Visual de Cadastro Pendente no Kanban (Seção 06)**:
  - O fallback visual não mascara inconsistências cadastrais: pedidos sem vínculo formal exibem a badge `⚠️ Cadastro Pendente`.
- **Tela de Login com Autenticação Direta por CPF (Sem Combos)**:
  - Removido o seletor de Empresa/Gráfica da tela inicial de acesso.
  - O seletor em combo de Operador foi substituído por campo de entrada direta de CPF com máscara automática (`000.000.000-00`) e foco automático.
  - Preservada a regra de senha de 4 dígitos (padrão temporário `0000` ou senha definitiva do operador).
  - Vinculação e ativação automática da empresa correspondente ao operador logado, com persistência segura do CPF via "Lembrar-me".

---

## 🔄 Repositório da Operação, Fotos/Prints, Google Drive & Mural de Serviços (v4.9.6)
- **Repositório da Operação / Fotos & Prints (Marcação Verde)**:
  - Botão integrado na coluna esquerda do formulário do pedido para gestão centralizada de anexos do pedido.
  - Permite captura direta pela câmera do celular (`capture="environment"`) para fotos no local de instalação/fachada, além de upload de fotos e prints.
  - **Compactação Preventiva via Canvas**: Redimensionamento inteligente e compressão JPEG para evitar estouro de armazenamento local ou lentidão na rede.
  - **Integração com Google Drive**: Opção para vincular pastas externas e compartilhadas no Google Drive para arquivos de arte pesados (CorelDraw CDR, Illustrator AI, Photoshop PSD, vídeos) sem onerar a aplicação.
  - **Acesso Compartilhado Comercial & Fábrica**: O repositório pode ser acessado no formulário de pedidos e também na Ordem de Serviço Técnica (O.S.), permitindo que a oficina consulte fotos e detalhes do local.
- **Estabilização do Mural de Serviços (Kanban de Produção)**:
  - Resolução da falha de renderização causada por pedidos sem vínculo de cliente ou com cliente nulo (`clientObj.nome`).
  - Inicialização segura da aba padrão (`currentTab: 'orcamento'`) e tratamento de exceções com fallback visual.
  - Operação fluida tanto na visualização em grade Desktop com Drag & Drop quanto na versão sanfona Mobile.

---

## 🔄 Governança Estrita, Trava de Proposta Aprovada & Auditoria (v4.9.5)
- **Bloqueio Rigoroso de Proposta Aprovada**: Se o pedido já possui aprovação do cliente, todos os campos (cliente, itens, descontos, financeiro) ficam bloqueados por padrão, permanecendo editáveis exclusivamente a Linha Amarela (Prazos de Produção/Entrega) e Observações Técnicas.
- **Governança dos 6 Botões Operacionais**:
  - **Cancelar**: Ativo apenas durante a edição de dados.
  - **Edita**: Habilita o modo de alteração; para pedidos já finalizados ou aprovados, exige perfil **Gerente** ou **Proprietário**, gerando evento no Livro de Ocorrências.
  - **Salva Operação**: Guarda o rascunho sem avançar para produção e sem emitir O.S.
  - **Finalizar Pedido**: Grava e oficializa a operação, permitindo avanço para produção e emissão de O.S.
  - **Emitir Pedido**: Nomenclatura contextual (Orçamento, Pré-Venda ou Pedido).
  - **Emitir O.S.**: Bloqueada para orçamentos ou pré-vendas não finalizados, liberada após finalização.
- **Aceite Digital Seguro com Senha de 4 Dígitos & GPS**:
  - Geração e envio pelo WhatsApp de senha aleatória de 4 dígitos exclusiva para o cliente.
  - No portal de aprovação, o cliente digita essa senha e autoriza a localização do navegador, registrando data, hora com segundos, PIN validado e coordenadas de GPS.
  - Exibição de conferência dessa senha e dados de carimbo no cabeçalho do pedido no sistema interno.
- **Livro de Ocorrências e Auditoria do Sistema**:
  - Registro auditável permanente de reaberturas e edições com sincronização na nuvem (`store.logOccurrence()`).
  - Interface dedicada de auditoria restrita aos perfis **Proprietário** e **Admin**.

---

## 🔄 Fluxo Relacional, Envio WhatsApp & Tarja Verde de Aceite (v4.9.4)
- **Fluxo Relacional Resiliente (1 Cliente -> N Pedidos -> N Itens)**: Resolução relacional completa e tolerante a falhas na vinculação do cliente ao abrir e editar pedidos existentes (`#ID`), eliminando campos em branco e bloqueios indevidos na edição.
- **Governança Estrita de Edição vs Reabertura**:
  - Vendedores podem editar livremente orçamentos, pré-vendas e campos operacionais/prazos de entrega de vendas em andamento.
  - Vendas finalizadas com produção liberada têm seus itens e valores financeiros protegidos; reabertura de itens e valores é restrita a usuários com perfil **Gerente** ou **Proprietário**.
- **Folha de Envio de Link pelo WhatsApp com Registro em Histórico**:
  - Modal tipo folha de encaminhamento/impressão para envio direto do link de aprovação virtual sem senha via WhatsApp.
  - Registro auditável no pedido contendo: número de telefone destinatário, data, hora e usuário responsável pelo envio.
- **Portal de Aprovação com Resumo Comercial & Condições Discricionárias**:
  - Apresentação completa de valores, opções de pagamento (Pix / Cartão / Dinheiro) e saldo devedor para validação prévia pelo cliente.
- **Tarja Verde Vibrante de Aceite**:
  - Destaque visual em verde no topo do pedido e no portal online certificando arte conferida, valores e prazos aprovados, com carimbo digital de identificação do aprovador.
- **O.S. Técnica Fabril sem Valores Financeiros**:
  - Ordem de Serviço de Chão de Fábrica permanece focada estritamente em dados técnicos, dimensões, arquivos de arte e acabamentos, sem valores monetários.

---

## 🔄 Restauração de Catálogo, Abertura de Formulários & IDs ao Salvar (v4.9.3)
- **Restauração Resiliente do Catálogo**: Garantia de carregamento e persistência imediata dos produtos padrão (`INITIAL_PRODUCTS`), eliminando a exibição de catálogo vazio.
- **Numeração Sequencial Exclusiva no Salvamento**: O número sequencial de novos pedidos (#ID) é calculado e consolidado estritamente no instante de salvar a operação, exibindo `#NOVO` durante o preenchimento e evitando conflito ou desperdício de IDs.
- **Abertura Confiável de Formulários**: Navegação fluida para formulários de Clientes (Novo/Editar) e Vendas/Operações (`+ Operação` no topo e `+ Novo Pedido` no Kanban).
- **Vínculo Resiliente Cliente-Pedido**: Resolução de cliente por ID e por nome com fallback automático no Kanban de produção e lista de vendas.
- **Manifesto Visual de Conectividade**: Indicador no cabeçalho em tempo real manifestando se o sistema está ON-LINE (Nuvem Ativa) ou em Retaguarda Local com botão de reconexão.

## 🔄 Retaguarda Offline Resiliente & Sincronização Multidispositivo (v4.9.2)
- **Contador Estrito de Reentradas (Senha "0000")**: Inicia rigorosamente em 10 entradas e decrementa exatamente 1 a cada login até a troca por senha pessoal definitiva.
- **Desbloqueio de Edição de Clientes & Chave Primária Inteligente**: Remoção de bloqueios artificiais em formulários e validação de unicidade de telefone/CPF excluindo expressamente o próprio registro em edição.
- **Edição In-Place de Pedidos e Produtos**: Localização precisa de registros existentes por ID ou número/nome, evitando duplicidade e preservando sequenciais.
- **Retaguarda Offline com IDs Dinâmicos**: UUIDs dinâmicos de alta entropia para prevenir colisões entre múltiplos usuários offline e reconciliação automática de chaves estrangeiras (cliente_id, pedido_id) ao sincronizar com o Supabase.
- **Tratamento Amigável de Supabase Offline**: Alerta informativo e transparente de que o Modo Retaguarda Local está 100% ativo e seguro em caso de indisponibilidade temporária da nuvem.