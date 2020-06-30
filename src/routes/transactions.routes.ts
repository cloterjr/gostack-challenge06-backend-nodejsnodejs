import { Router, Request, Response } from 'express';

import multer from 'multer';
import uploadConfig from '../config/uploadConfig';

import GetTransactionsWithBalanceService from '../services/GetTransactionsWithBalanceService';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (_: Request, response: Response) => {
  const getTransactionsWithBalanceService = new GetTransactionsWithBalanceService();
  const {
    transactions,
    balance,
  } = await getTransactionsWithBalanceService.execute();

  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const createTransactionService = new CreateTransactionService();

  const { title, value, type, category } = request.body;

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({ id });

  return response.status(204).json({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const { filename } = request.file;
    await importTransactionsService.execute({ filename });

    return response.status(201).json({});
  },
);

export default transactionsRouter;
