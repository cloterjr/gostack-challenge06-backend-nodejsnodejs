import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

import GetTransactionsWithBalanceService from './GetTransactionsWithBalanceService';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const getTransactionsWithBalanceService = new GetTransactionsWithBalanceService();

    const {
      transactions,
      balance,
    } = await getTransactionsWithBalanceService.execute();

    if (
      transactions.length > 0 &&
      type.indexOf('outcome') > -1 &&
      balance.total < value
    ) {
      throw new AppError('Seu saldo nao é suficiente para efetuar um saque');
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const categoryFounded = await categoriesRepository.findOne({
      where: { title: category },
    });

    let category_id = '';

    if (categoryFounded === null || categoryFounded === undefined) {
      const categoryToAdd = await categoriesRepository.create({
        title: category,
      });

      const newCategory = await categoriesRepository.save(categoryToAdd);

      category_id = newCategory.id;
    } else {
      category_id = categoryFounded ? categoryFounded.id.toString() : '';
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    const newTransaction = await transactionsRepository.save(transaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
