const Seeder = {
  run: function() {
    const clientsKey = 'grafsis_clients';
    const productsKey = 'grafsis_products';
    
    let clients = JSON.parse(localStorage.getItem(clientsKey) || '[]');
    let products = JSON.parse(localStorage.getItem(productsKey) || '[]');

    if (clients.length < 20) {
      console.log('Gerando 20 clientes aleatórios...');
      const firstNames = ['Ana','Carlos','Bruno','Daniela','Eduardo','Fernanda','Gabriel','Helena','Igor','Julia','Lucas','Mariana','Nicolas','Olivia','Pedro','Quintina','Rafael','Sofia','Tiago','Ursula'];
      const lastNames = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes'];
      const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'];
      const ufs = ['SP', 'RJ', 'MG', 'PR', 'RS'];

      for (let i = 0; i < 20; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const cpf = Math.floor(10000000000 + Math.random() * 90000000000).toString();
        
        clients.push({
          id: grafsisUUID(),
          tipo: 'PF',
          nome: fn + ' ' + ln,
          cpf_cnpj: cpf,
          celular: '119' + Math.floor(10000000 + Math.random() * 90000000).toString(),
          email: fn.toLowerCase() + '@email.com',
          cidade: cities[i % cities.length],
          estado: ufs[i % ufs.length],
          senha: '123',
          data_cadastro: new Date().toISOString()
        });
      }
      localStorage.setItem(clientsKey, JSON.stringify(clients));
    }

    if (products.length === 0 || !products.find(p => p.referencia === 'CRA-001')) {
      console.log('Gerando produtos do e-commerce...');
      products = [
        {
          id: grafsisUUID(),
          referencia: 'CRA-001',
          nome: 'Crachá PVC Personalizado',
          preco_base: 15.00,
          foto_url: 'https://via.placeholder.com/300x200?text=Cracha+PVC',
          descricao: 'Crachá em PVC de alta qualidade. Design personalizável.',
          isCustom: true
        },
        {
          id: grafsisUUID(),
          referencia: 'CORD-001',
          nome: 'Cordão Liso para Crachá',
          preco_base: 3.50,
          foto_url: 'https://via.placeholder.com/300x200?text=Cordao+Liso',
          descricao: 'Cordão simples liso com presilha jacaré.',
          isCustom: false
        },
        {
          id: grafsisUUID(),
          referencia: 'CORD-002',
          nome: 'Cordão Personalizado (Sublimação)',
          preco_base: 8.00,
          foto_url: 'https://via.placeholder.com/300x200?text=Cordao+Perso',
          descricao: 'Cordão com logo da sua empresa.',
          isCustom: false
        },
        {
          id: grafsisUUID(),
          referencia: 'PORT-001',
          nome: 'Porta Crachá Rígido',
          preco_base: 2.00,
          foto_url: 'https://via.placeholder.com/300x200?text=Porta+Cracha',
          descricao: 'Protetor rígido transparente.',
          isCustom: false
        }
      ];
      localStorage.setItem(productsKey, JSON.stringify(products));
    }
  }
};
window.Seeder = Seeder;
