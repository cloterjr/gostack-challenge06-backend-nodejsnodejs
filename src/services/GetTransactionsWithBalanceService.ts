import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Balance from '../models/Balance';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

class GetTransactionsWithBalanceService {
  async execute(): Promise<Response> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions: Transaction[] = await transactionsRepository.find();

    let income = 0;
    let outcome = 0;

    const incomeTransactions: Transaction[] = await transactionsRepository.find(
      {
        where: { type: 'income' },
      },
    );

    const outcomeTransactions: Transaction[] = await transactionsRepository.find(
      {
        where: { type: 'outcome' },
      },
    );

    if (incomeTransactions.length > 0) {
      income = incomeTransactions
        .map(t => t.value)
        .reduce(
          (v1, v2) => parseFloat(v1.toString()) + parseFloat(v2.toString()),
        );
    }

    if (outcomeTransactions.length > 0) {
      outcome = outcomeTransactions
        .map(t => t.value)
        .reduce(
          (v1, v2) => parseFloat(v1.toString()) + parseFloat(v2.toString()),
        );
    }

    const total: number = income - outcome;

    const balance: Balance = {
      income: parseFloat(income.toString()),
      outcome: parseFloat(outcome.toString()),
      total: parseFloat(total.toString()),
    };

    return { transactions, balance };
  }
}

export default GetTransactionsWithBalanceService;
