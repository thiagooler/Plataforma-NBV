// --- NBV SYSTEM DATABASE (V4 - Master) ---
// Contém tabelas de preços complexas e configurações globais.

window.NBV_DB = {
    // Configurações Padrão de Fluxo
    fluxo: {
        pedirEdicao: true,       // Se true, pergunta se quer editar antes de produzir
        pedirAprovacao: true,    // Se true, passa pela tela de aprovação de fotos
        minimoFotosLivro: 20     // Mínimo para liberar opção de fotolivro
    },

    // Logística
    logistica: {
        taxaEnvio: 30.00,
        locaisRetirada: [
            "Studio NBV (Sítio Boa Ventura)",
            "Balcão Ibema (Centro)",
            "Turvo (Praça Central)"
        ]
    },

    // Financeiro Geral
    financeiro: {
        descontoPix: 5,
        parcelasSemJuros: 4,
        tabelaJuros: [0, 4.59, 5.99, 7.49, 8.99, 10.49, 11.99, 13.49, 14.99, 16.49, 17.99, 21.00],
        whatsapp: "5542998370150",
        markup: 2.5, // Multiplicador padrão do fotolivro
        custoFixoDiagramacao: 30.00
    },

    // Tabela de Produtos (Revelações e Quadros)
    produtosAvulsos: [
        { nome: "Foto 10x15", preco: 5.00, icone: "fas fa-image" },
        { nome: "Foto 15x21", preco: 10.00, icone: "fas fa-image" },
        { nome: "Foto 20x30", preco: 30.00, icone: "fas fa-portrait" },
        { nome: "Quadro A4 com Moldura", preco: 85.00, icone: "fas fa-crop-alt" },
        { nome: "Arquivo Digital (Unitário)", preco: 15.00, icone: "fas fa-file-download" }
    ],

    // Tabela Complexa de Fotolivros (Baseada no seu código)
    // Regra: Tamanho -> Páginas -> Custo Base (Sem caixa / Com caixa)
    tabelaFotolivros: [
        // 30x40
        { size: '30x40', pages: 20, price: 592, priceBox: 754 },
        { size: '30x40', pages: 30, price: 750, priceBox: 912 },
        { size: '30x40', pages: 40, price: 879, priceBox: 1070 },
        { size: '30x40', pages: 50, price: 1037, priceBox: 1228 },
        { size: '30x40', pages: 60, price: 1195, priceBox: 1386 },
        { size: '30x40', pages: 80, price: 1511, priceBox: 1702 },
        { size: '30x40', pages: 100, price: 1827, priceBox: 2018 },
        // 20x30
        { size: '20x30', pages: 20, price: 317, priceBox: 443 },
        { size: '20x30', pages: 30, price: 406, priceBox: 532 },
        { size: '20x30', pages: 50, price: 584, priceBox: 710 },
        { size: '20x30', pages: 80, price: 851, priceBox: 977 },
        { size: '20x30', pages: 100, price: 1029, priceBox: 1155 },
        // 15x20
        { size: '15x20', pages: 20, price: 214, priceBox: 356 },
        { size: '15x20', pages: 40, price: 324, priceBox: 437 },
        { size: '15x20', pages: 60, price: 434, priceBox: 547 },
        { size: '15x20', pages: 100, price: 654, priceBox: 767 }
    ],

    // Regras de Diagramação (Fotos por página)
    regrasDiagramacao: {
        '15x20': 3,
        '20x30': 4,
        '30x40': 5
    }
};
