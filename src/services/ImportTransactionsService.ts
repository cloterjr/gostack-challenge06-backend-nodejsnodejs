import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import CreateTransactionService from './CreateTransactionService';

import Transaction from '../models/Transaction';
import GetTransactionsWithBalanceService from './GetTransactionsWithBalanceService';

interface Request {
  filename: string;
}

interface TransactionInputDTO {
  title: string;
  type: string;
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const inputs = await this.loadCSV({ filename });

    // const transactions: Transaction[] = [];

    await Promise.all(
      inputs
        .filter(t => t.type === 'income')
        .map(async input => {
          const { title, type, value, category } = input;
          const parsedValue = parseFloat(value);

          return createTransactionService.execute({
            title,
            value: parsedValue,
            type,
            category,
          });
        }),
    );

    await Promise.all(
      inputs
        .filter(t => t.type === 'outcome')
        .map(input => {
          const { title, type, value, category } = input;
          const parsedValue = parseFloat(value);

          return createTransactionService.execute({
            title,
            value: parsedValue,
            type,
            category,
          });
        }),
    );

    const transactionService = new GetTransactionsWithBalanceService();
    const {
      transactions: transactionsToReturn,
    } = await transactionService.execute();

    return transactionsToReturn;
  }

  async loadCSV({ filename }: Request): Promise<TransactionInputDTO[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];
    const inputs: TransactionInputDTO[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;
      lines.push(line);
      const inputTransaction: TransactionInputDTO = {
        title,
        type,
        value,
        category,
      };

      inputs.push(inputTransaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return inputs;
  }
}

export default ImportTransactionsService;
