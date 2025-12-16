// --- NBV SYSTEM DATABASE (V5.7 - Logística Avançada) ---

window.NBV_DB = {
    // Configurações de Fluxo
    fluxo: {
        pedirEdicao: true,
        pedirAprovacao: true,
        minimoFotosLivro: 20
    },

    // Logística
    logistica: {
        taxaEnvio: 30.00,
        // Cidades que tem tratamento especial (Frete Grátis)
        cidadesGratis: [
            "Boa Ventura de São Roque",
            "Turvo",
            "Pitanga",
            "Santa Maria do Oeste"
        ],
        // Endereço Base (Sede)
        enderecoSede: "Rod. PR 466 km 210, Bairro Coamo (Anexo Mercado JL)"
    },

    // Financeiro
    financeiro: {
        descontoPix: 5,
        parcelasSemJuros: 4,
        tabelaJuros: [0, 4.59, 5.99, 7.49, 8.99, 10.49, 11.99, 13.49, 14.99, 16.49, 17.99, 21.00],
        whatsapp: "5542998370150",
        markup: 2.5, 
        custoFixoDiagramacao: 30.00
    },

    // Produtos Avulsos (Sua lista atualizada)
    produtosAvulsos: [
        { nome: "Foto 10x15", preco: 10.00, icone: "fas fa-image" },
        { nome: "Foto 15x20", preco: 20.00, icone: "fas fa-image" },
        { nome: "Foto 20x30", preco: 30.00, icone: "fas fa-image" },
        { nome: "Foto 30x40", preco: 40.00, icone: "fas fa-image" },
        { nome: "Foto 40x60", preco: 60.00, icone: "fas fa-image" },
        { nome: "Porta retrato 10x15", preco: 20.00, icone: "fas fa-portrait" },
        { nome: "Porta retrato 15x20", preco: 35.00, icone: "fas fa-portrait" },
        { nome: "Porta retrato 20x30", preco: 45.00, icone: "fas fa-portrait" },
        { nome: "Porta retrato 30x40", preco: 120.00, icone: "fas fa-portrait" },
        { nome: "Porta retrato 40x60", preco: 290.00, icone: "fas fa-portrait" },
        { nome: "Arquivo Digital", preco: 8.00, icone: "fas fa-cloud-download-alt" }
    ],

    // Tabela Fotolivros (Mantida a mesma estrutura V5.6)
    tabelaFotolivros: [
        { size: '30x40', pages: 20, price: 592, priceBox: 754 },
        { size: '30x40', pages: 30, price: 750, priceBox: 912 },
        { size: '30x40', pages: 40, price: 879, priceBox: 1070 },
        { size: '30x40', pages: 50, price: 1037, priceBox: 1228 },
        { size: '30x40', pages: 60, price: 1195, priceBox: 1386 },
        { size: '30x40', pages: 80, price: 1511, priceBox: 1702 },
        { size: '30x40', pages: 100, price: 1827, priceBox: 2018 },
        { size: '20x30', pages: 20, price: 317, priceBox: 443 },
        { size: '20x30', pages: 30, price: 406, priceBox: 532 },
        { size: '20x30', pages: 50, price: 584, priceBox: 710 },
        { size: '20x30', pages: 60, price: 673, priceBox: 799 },
        { size: '20x30', pages: 80, price: 851, priceBox: 977 },
        { size: '20x30', pages: 100, price: 1029, priceBox: 1155 },
        { size: '15x20', pages: 20, price: 214, priceBox: 356 },
        { size: '15x20', pages: 30, price: 269, priceBox: 382 },
        { size: '15x20', pages: 40, price: 324, priceBox: 437 },
        { size: '15x20', pages: 50, price: 379, priceBox: 492 },
        { size: '15x20', pages: 60, price: 434, priceBox: 547 },
        { size: '15x20', pages: 70, price: 489, priceBox: 602 },
        { size: '15x20', pages: 80, price: 544, priceBox: 657 },
        { size: '15x20', pages: 100, price: 654, priceBox: 767 }
    ],

    regrasDiagramacao: {
        '15x20': 3,
        '20x30': 4,
        '30x40': 5
    }
};
