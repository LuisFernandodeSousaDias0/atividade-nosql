import mongoose from 'mongoose';
import Venda from '../models/Venda.js';
import Produto from '../models/Produto.js';

const erro = (res, e) => {
  if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ erro: e.message });
  console.error(e); return res.status(500).json({ erro: 'Erro interno' });
};

export async function registrar(req, res) {
  const { cliente, itens } = req.body;
  if (!Array.isArray(itens) || itens.length === 0)
    return res.status(400).json({ erro: 'Informe ao menos um item' });

  try {
    const itensVenda = [];
    for (const item of itens) {
      if (!mongoose.isValidObjectId(item.produto))
        return res.status(400).json({ erro: `ID de produto inválido: ${item.produto}` });

      const produto = await Produto.findById(item.produto);
      if (!produto)
        return res.status(404).json({ erro: `Produto não encontrado: ${item.produto}` });

      const quantidade = Number(item.quantidade);
      if (!Number.isInteger(quantidade) || quantidade < 1)
        return res.status(400).json({ erro: `Quantidade inválida para ${produto.nome}` });

      itensVenda.push({ produto: produto._id, quantidade, precoUnitario: produto.preco });
    }

    const total = itensVenda.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0);
    const venda = await Venda.create({ cliente, itens: itensVenda, total });
    res.status(201).json(await venda.populate('itens.produto'));
  }
  catch(e) { erro(res,e); }
}

export async function listar(req, res) {
  try { res.json(await Venda.find().populate('itens.produto').sort({ data: -1 })); }
  catch(e) { erro(res,e); }
}

export async function obter(req, res) {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ erro: 'ID inválido' });
  try {
    const v = await Venda.findById(req.params.id).populate('itens.produto');
    return v ? res.json(v) : res.status(404).json({ erro: 'Venda não encontrada' });
  }
  catch(e) { erro(res,e); }
}