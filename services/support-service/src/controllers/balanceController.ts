import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { getExchangeRates } from '../services/exchangeRateService';

export const getExchangeRatesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const baseCurrency = (req.query.base as string) || 'MDL';
    const exchangeRatesData = await getExchangeRates(baseCurrency);

    // Возвращаем только нужные валюты
    res.json({
      base: baseCurrency,
      rates: {
        MDL: exchangeRatesData.conversion_rates.MDL || 1,
        USD: exchangeRatesData.conversion_rates.USD,
        EUR: exchangeRatesData.conversion_rates.EUR,
      },
      lastUpdate: exchangeRatesData.time_last_update_utc,
    });
  } catch (error) {
    console.error('Error in getExchangeRatesController:', error);
    // Fallback rates
    res.json({
      base: 'MDL',
      rates: {
        MDL: 1,
        USD: 0.055,
        EUR: 0.051,
      },
      lastUpdate: new Date().toUTCString(),
    });
  }
};

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    const user = await User.findById(userId).select('balance preferredCurrency hasUsedFreeBooking');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Получаем актуальные курсы валют
    const exchangeRatesData = await getExchangeRates('MDL');

    // Для удобства, возвращаем баланс в MDL (основная валюта) как число
    // и полный объект балансов для продвинутых операций
    res.json({
      balance: user.balance.MDL || 0, // Основной баланс в MDL
      balances: user.balance, // Полный объект с всеми валютами
      preferredCurrency: user.preferredCurrency || 'MDL',
      exchangeRates: exchangeRatesData.conversion_rates,
      hasUsedFreeBooking: user.hasUsedFreeBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const depositBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { amount, currency, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма пополнения' });
    }

    if (!['USD', 'EUR', 'MDL'].includes(currency)) {
      return res.status(400).json({ message: 'Некорректная валюта' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Создаем транзакцию
    const transaction = await Transaction.create({
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'completed', // В реальном приложении - pending до подтверждения оплаты
      description: `Пополнение баланса на ${amount} ${currency}`,
      paymentMethod: paymentMethod || 'card',
    });

    // Обновляем баланс пользователя
    const currencyKey = currency as 'USD' | 'EUR' | 'MDL';
    user.balance[currencyKey] = (user.balance[currencyKey] || 0) + amount;
    await user.save();

    console.log(`✅ Balance updated for user ${userId}: ${currency} balance is now ${user.balance[currencyKey]}`);

    res.json({
      message: 'Баланс успешно пополнен',
      transaction,
      balance: user.balance.MDL || 0, // Возвращаем основной баланс как число
      balances: user.balance, // Полный объект балансов
      newBalance: user.balance, // Для обратной совместимости
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { amount, currency, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма вывода' });
    }

    if (!['USD', 'EUR', 'MDL'].includes(currency)) {
      return res.status(400).json({ message: 'Некорректная валюта' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const currencyKey = currency as 'USD' | 'EUR' | 'MDL';
    
    if (user.balance[currencyKey] < amount) {
      return res.status(400).json({ message: 'Недостаточно средств' });
    }

    // Создаем транзакцию
    const transaction = await Transaction.create({
      userId,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending', // Требует обработки
      description: `Вывод средств ${amount} ${currency}`,
      paymentMethod: paymentMethod || 'bank_transfer',
    });

    // Обновляем баланс пользователя
    user.balance[currencyKey] -= amount;
    await user.save();

    res.json({
      message: 'Запрос на вывод средств создан',
      transaction,
      newBalance: user.balance,
    });
  } catch (error) {
    next(error);
  }
};

export const convertCurrency = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Некорректная сумма конвертации' });
    }

    if (!['USD', 'EUR', 'MDL'].includes(fromCurrency) || !['USD', 'EUR', 'MDL'].includes(toCurrency)) {
      return res.status(400).json({ message: 'Некорректная валюта' });
    }

    if (fromCurrency === toCurrency) {
      return res.status(400).json({ message: 'Валюты должны отличаться' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const fromKey = fromCurrency as 'USD' | 'EUR' | 'MDL';
    const toKey = toCurrency as 'USD' | 'EUR' | 'MDL';
    
    if (user.balance[fromKey] < amount) {
      return res.status(400).json({ message: 'Недостаточно средств' });
    }

    // Получаем актуальный курс конвертации
    const exchangeRatesData = await getExchangeRates(fromCurrency);
    const rate = exchangeRatesData.conversion_rates[toCurrency];
    
    if (!rate) {
      return res.status(400).json({ message: 'Не удалось получить курс валюты' });
    }
    
    const convertedAmount = amount * rate;

    // Обновляем баланс
    user.balance[fromKey] -= amount;
    user.balance[toKey] += convertedAmount;
    await user.save();

    // Создаем транзакцию для истории
    await Transaction.create({
      userId,
      type: 'payment',
      amount,
      currency: fromCurrency,
      status: 'completed',
      description: `Конвертация ${amount} ${fromCurrency} → ${convertedAmount.toFixed(2)} ${toCurrency}`,
    });

    res.json({
      message: 'Конвертация выполнена успешно',
      convertedAmount,
      rate,
      newBalance: user.balance,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { type, currency, status, limit = 50, skip = 0 } = req.query;

    const filter: any = { userId };

    if (type) filter.type = type;
    if (currency) filter.currency = currency;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      total,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferredCurrency = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { currency } = req.body;

    if (!['USD', 'EUR', 'MDL'].includes(currency)) {
      return res.status(400).json({ message: 'Некорректная валюта' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.preferredCurrency = currency;
    await user.save();

    res.json({
      message: 'Основная валюта обновлена',
      preferredCurrency: user.preferredCurrency,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Получить все транзакции
export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, currency, status, limit = 100, skip = 0 } = req.query;

    const filter: any = {};

    if (type) filter.type = type;
    if (currency) filter.currency = currency;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      total,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Обновить статус транзакции
export const updateTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Некорректный статус' });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    transaction.status = status;
    await transaction.save();

    res.json({
      message: 'Статус транзакции обновлен',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};
