import Venda from '../models/Venda.js';

const arredondar = (v) => Math.round(v * 100) / 100;

export async function vendas(req, res) {
  try {
    const lista = await Venda.find().populate('itens.produto', 'nome');
    let faturamentoTotal = 0;
    let unidadesVendidas = 0;
    const porProduto = {};

    for (const venda of lista) {
      for (const item of venda.itens) {
        const subtotal = item.quantidade * item.precoUnitario;
        faturamentoTotal += subtotal;
        unidadesVendidas += item.quantidade;

        const id = item.produto ? item.produto._id.toString() : 'removido';
        if (!porProduto[id]) {
          porProduto[id] = {
            produtoId: item.produto ? item.produto._id : null,
            nome: item.produto ? item.produto.nome : 'Produto removido',
            quantidadeVendida: 0,
            faturamento: 0
          };
        }
        porProduto[id].quantidadeVendida += item.quantidade;
        porProduto[id].faturamento += subtotal;
      }
    }

    const produtosMaisVendidos = Object.values(porProduto)
      .map(p => ({ ...p, faturamento: arredondar(p.faturamento) }))
      .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
      .slice(0, 5);

    res.json({
      quantidadeVendas: lista.length,
      faturamentoTotal: arredondar(faturamentoTotal),
      unidadesVendidas,
      produtosMaisVendidos
    });
  }
  catch(e) { console.error(e); res.status(500).json({ erro: 'Erro interno' }); }
}