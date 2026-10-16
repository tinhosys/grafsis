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

## 🔄 Resiliência de Conexão Nuvem & Tolerância a Latência Internacional (v4.9.8.3)
- **Tolerância Transcontinental & Blindagem Anti-Oscilação:**
  - Ajuste de timeouts de rede de 3,5s/4s para **12s/15s**, compatíveis com a rota internacional entre o Brasil e os servidores Supabase AWS em Oregon (`us-west-2`).
  - **Mecanismo de Retry Inteligente:** A checagem de saúde da nuvem realiza retry automático antes de reportar falha, e exige 2 verificações consecutivas com erro antes de disparar o modal de bloqueio, eliminando falsos positivos por micro-quedas transitórias de ping.
  - **Sincronização Sequencial Otimizada:** As tabelas são sincronizadas sequencialmente em vez de em rajada paralela, evitando saturação do pool de conexões da instância nano do Supabase.
  - **Auto-Dismiss do Bloqueio ao Reconectar:** O modal de sistema inoperante é fechado instantaneamente assim que qualquer verificação detecta a nuvem online.
  - **Correção da Verificação de Estado:** O indicador de conexão agora reflete estritamente a conectividade real em tempo real (`cloudConnected`) e não apenas a existência da instância do cliente.
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

## 🔄 Gravar Operação, Liberação O.S., Links Técnico/Completo & Aceite Digital (v4.9.8.7)
- **Renomeação Oficial de Ação ("Gravar Operação")**:
  - O botão de salvamento rápido / rascunho (`#btn-save-draft`) foi oficialmente padronizado para **"Gravar Operação"**, em substituição a "Salva Operação".
  - Mantida a imunidade total a bloqueios pós-registro para gravação de alterações complementares.
- **Persistência de Liberação de Itens para O.S. & Checkboxes Livres**:
  - Os checkboxes de liberação de item (`#check-all-os`, `.item-os-check`), o campo de isolamento por código (`#filter-item-code-os`) e os botões de ação ("Isolar Item" e "Liberar Todos") permanecem **sempre habilitados**, mesmo após o registro da operação.
  - Por padrão, todos os itens iniciam marcados (`checked = true`), garantindo que apenas os itens conferidos e checados pelo operador sejam impressos na Ordem de Serviço (A4 Paisagem) e exibidos no link de aprovação online.
- **Link Padrão Fácil de Copiar & Botões Permanentemente Ativos**:
  - O campo do link padrão de aprovação (`#padrao-approval-link-input`) agora possui seleção livre com cursor de texto (`cursor-text`, `onfocus="this.select()"`), facilitando a cópia manual pelo operador.
  - O botão **"Copiar Link"** implementa escrita primária por `navigator.clipboard` com contingência robusta via `document.execCommand('copy')` e feedback visual instantâneo na interface (`"✓ Link Copiado!"` em verde por 2,5 segundos).
  - Os botões "Copiar Link", "Enviar WhatsApp" e "Visualizar ↗" mantêm-se habilitados em qualquer estágio da operação.
- **4 Modalidades Estruturadas de Compartilhamento WhatsApp**:
  1. *1. Link Técnico (Sem Valores)*: URL `#aprovacao?id=...&modo=tecnico` — exibe especificações completas de itens, medidas, quantidades, descrições técnicas, observações e galeria de imagens/artes, omitindo valores monetários.
  2. *2. Link Completo (Com Valores)*: URL `#aprovacao?id=...&modo=completo` — exibe o layout técnico integral somado ao demonstrativo financeiro (preços unitários, total, entrada, saldo restante e condições de pagamento).
  3. *3. Senha de Autorização de 4 Dígitos*: Envio isolado do código PIN (`order.codigo_autorizacao`), vinculado estritamente ao WhatsApp destinatário.
  4. *4. Recibo Digital de Pagamento*: Emissão de comprovante digital com dados da operação e Código Único de Validação (ex: `REC-260008-XXXX`).
- **Regra de Ouro do Aceite Digital & Telemetria Completa**:
  - A senha de autorização só pode ser validada no portal caso o telefone informado pelo cliente coincida com o número de WhatsApp cadastrado no envio da chave.
  - Ao validar o aceite, o sistema registra data/hora com segundos, modelo e marca do dispositivo (Android / Apple iOS / Windows PC / Mac), geolocalização com coordenadas e link para o Google Maps, e emite notificação automática em tempo real para a equipe interna da gráfica.

---

## 🔄 Resolução de Travamento de Gravação & Caixa Parcelado Inteligente (v4.9.8.6)
- **Resolução de Travamento de Gravação (`obsTextarea` e `statusPagto`)**:
  - Identificada e corrigida a causa raiz da interrupção que exibia os erros *"Erro ao salvar operação: obsTextarea is not defined"* e *"Erro ao gravar operação no sistema: statusPagto is not defined"*, que congelavam o processo na barra de progresso em 35%.
  - Ambos os escopos foram formalmente inicializados e integrados aos fluxos `updateFormState()`, `saveOrder()` e `saveOrderQuick()`, restaurando a fluidez total da gravação e persistência no sistema.
- **Módulo de Recebimento Financeiro (Caixa) - Parcelamento Inteligente**:
  - **Verde Bandeira (Quantidade de Parcelas - Máximo 6x)**: Seleção de parcelas reconfigurada para atender ao limite máximo estrito de 6x (`1x a 6x parcelas`), bloqueando opções superiores e ajustando a entrada de dados.
  - **Amarelo (Taxa de Juros Mensal - '0,0%' a 9,9%)**: Campo dedicado para aplicação de taxa de juros mensal (`% a.m.`), com valor padrão mantido em `'0,0%'` e limite superior de `9,9%`.
  - **Verde Limão (Data da Primeira Parcela)**: Campo de data para início dos vencimentos (`1ª Parcela`), inicializado em +30 dias por padrão e com recálculo automático em tempo real das datas subsequentes de vencimento para intervalos iguais.
  - **Azul Royal (Grade Analítica das Parcelas)**: Tabela analítica completa com cabeçalho em azul royal, detalhando:
    1. *Parcela*: Identificador sequencial (`1ª`, `2ª`, ... `Nª`).
    2. *Data Vencimento*: Vencimentos calculados mês a mês no mesmo dia base da 1ª parcela.
    3. *Valor Parcela*: Cálculo de parcelas rigorosamente iguais com juros compostos mês a mês (Tabela Price: $PMT = S \times \frac{i(1+i)^N}{(1+i)^N - 1}$ ou $S/N$ quando juros for 0,0%).
    4. *Status (Pago / Pendente)*: Indicador visual em verde (`● Pago`) e vermelho (`● Pendente`), permitindo alternância dinâmica com um clique e integração ao saldo restante.
  - **Fórmula Financeira Oficial Implementada**:
    - $\text{Saldo da Dívida} = \text{Valor do Pedido} - \text{Valor Recebido}$
    - $\text{Valor de Cada Parcela Base} = \text{Saldo da Dívida} / \text{Quantidade de Parcelas}$
    - $\text{Valor de Cada Parcela no Grid} = \text{Parcelas iguais com juros compostos mês a mês sobre o saldo financiado}$.

---

## 🔄 Atribuição Antecipada de ID, Governança Estrita & Link Padrão de Aprovação (v4.9.8.5)
- **Atribuição Antecipada de ID (#ID = Último ID + 1)**:
  - Ao iniciar uma nova operação sem cliente (`cliente == null`), o identificador exibe provisoriamente `#NOVO (Gerado ao salvar)`.
  - Assim que o cliente é selecionado (`cliente <> null`), o sistema calcula e atribui imediatamente o próximo ID sequencial oficial (`ultimo ID + 1`), atualizando os crachás `#display-order-id-label` e `#current-display-id`.
  - Ao inserir itens no pedido, cada item recebe imediatamente a chave de vínculo relacional definitiva (`26000201`, etc.), eliminando itens desvinculados, órfãos ou com prefixos redundantes (`##NOVO01`).
- **Botão Dinâmico de Registro de Operação**:
  - Antes do registro ou em modo rascunho: botão padronizado com a legenda **"Registrar Operação"**, estilizado em amarelo vibrante (`bg-yellow-400`, `hover:bg-yellow-500`) com texto preto em negrito (`text-slate-900 font-bold`).
  - Após a gravação oficial ou ao abrir operações já registradas: transiciona de imediato para a legenda **"Operação Registrada"**, estilizado em verde bandeira oficial (`bg-[#009b3a]`, `hover:bg-[#008030]`) com texto branco em negrito (`text-white font-bold`).
- **Campos Imunes ao Bloqueio Pós-Registro**:
  - Após o registro da operação, os campos de Cabeçalho (Cliente, Tipo de Operação, Validade/Percentual), Itens (inserção, edição, exclusão) e Descontos ficam rigorosamente bloqueados para garantir a integridade dos dados fiscais e contratuais.
  - Permanecem **100% imunes ao bloqueio**:
    1. *Prazo de Entrega* (dias úteis e data prevista de entrega).
    2. *Observações Técnicas / Observações do Pedido*.
    3. *Valor de Entrada* (`#order-valor-entrada`).
    4. *Botão Caixa* (`#btn-detalhes-recibo` - recebimentos, parcelas e recibos).
    5. *Repositório da Operação* (anexos e links de arte/arquivos).
    6. *Botões de Operação*: "Editar Operação" (`#btn-edit-order`) e "Salva Operação" (`#btn-save-draft`).
- **Regra de Perfil para Edição Pós-Registro**:
  - Antes de registrar a operação, qualquer operador com permissão de vendas pode clicar em **"Editar Operação"** para fazer ajustes.
  - Uma vez registrada a operação, o clique em **"Editar Operação"** é restrito com rigidez aos usuários com perfil **Gerente** (incluindo `PROPRIETARIO` e `ADMIN`).
  - Caso um usuário sem esse nível de privilégio tente acionar a edição pós-registro, o sistema bloqueia a ação e exibe uma notificação formal informativa: *"Acesso Restrito: Esta operação já está registrada no sistema. Conforme as normas de controle operacional, a edição de registros após o registro oficial é permitida exclusivamente para o perfil de Gerente."*
- **Área Padrão do Link de Aprovação do Cliente**:
  - Implementação da área padrão de aprovação posicionada de forma fixa e destacada logo abaixo dos botões de ação (`#secao-botoes-acoes`).
  - Exibida de imediato após a gravação da operação e permanentemente visível ao consultar registros gravados.
  - Oferece campo de link pré-selecionado, botão "Copiar Link" com cópia direta para a área de transferência, botão "Enviar WhatsApp" com direcionamento automatizado e botão "Visualizar ↗" para conferência em nova aba.

---

## 🔄 Governança de Vendas, Chave Gerente, Botão Caixa & O.S. Condicional (v4.9.8.4)
- **Registrar Operação com Crítica e Confirmação Explícita**:
  - Botão azul padronizado como "Registrar Operação", executando crítica de integridade prévia (cliente obrigatório, ao menos 1 item cadastrado e previsão de entrega para operações comerciais) e exibindo diálogo de confirmação detalhado com tipo de operação, cliente, total de itens e valor final antes de efetivar a gravação.
- **Regras Operacionais e Emissão de O.S. Condicional**:
  - **Orçamento**: Modo somente gravação; não habilita emissão de O.S.; legenda do botão cinza: *"Emitir Orçamento"*.
  - **Pré-Venda**: Modo somente gravação; não habilita emissão de O.S.; legenda do botão cinza: *"Emitir Pré-Venda"*.
  - **Venda, Patrocínio e Permuta**: Habilitam a emissão de O.S. Técnica; campos travados contra edição acidental por padrão em registros já gravados.
- **Chave ON/OFF de Edição de Gerente**:
  - Chave seletora ON/OFF posicionada diretamente junto ao botão cinza (*"Emitir Venda"*, etc.) exclusiva para os perfis **Gerente** ou **Proprietário**, permitindo desbloquear a operação para ajustes e relocar ao término.
- **Campos Habitados com Edição Contínua Preservada**:
  - Mesmo quando a operação está travada, quatro elementos fundamentais permanecem sempre habilitados:
    1. *Detalhes do Pedido* (observações do cliente/técnicas).
    2. *Detalhes ou Descrição do Produto* (`#item-desc`).
    3. *Prazo de Entrega* (dias úteis e data de previsão de entrega).
    4. *Botão Caixa* (recebimentos, parcelas, cartões e recibos).
- **Padronização dos Botões de Ação**:
  - Botão Amarelo: `edita = 'Editar Operação'`.
  - Botão Cancelar: `cancela = 'Cancelar Edição'`, com `enable true` dinâmico ativado durante a edição.
  - Botão de Detalhes Financeiros: renomeado para **"Caixa"**, acompanhado do ícone canônico de baú de moedas em SVG.

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