import { Request, Response, NextFunction } from 'express';
import Tariff from '../models/Tariff';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { getExchangeRates } from '../services/exchangeRateService';

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { tariffId, paymentMethod, parkingId } = req.body;

    const tariff = await Tariff.findById(tariffId);
    if (!tariff) {
      return res.status(404).json({ message: 'Тариф не найден' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    let amount = tariff.price;
    const currency = tariff.currency || 'MDL';

    if (paymentMethod === 'balance') {
      // Determine user's preferred currency or default to MDL
      const userCurrency = user.preferredCurrency || 'MDL';
      
      // Calculate amount in user's currency
      let amountInUserCurrency = amount;
      
      if (currency !== userCurrency) {
        const rates = await getExchangeRates(currency);
        const rate = rates.conversion_rates[userCurrency];
        if (!rate) {
            return res.status(400).json({ message: `Не удалось получить курс для ${userCurrency}` });
        }
        amountInUserCurrency = amount * rate;
      }

      // Check balance
      if ((user.balance[userCurrency] || 0) < amountInUserCurrency) {
        return res.status(400).json({ message: 'Недостаточно средств на балансе' });
      }

      // Deduct balance
      user.balance[userCurrency] -= amountInUserCurrency;
      await user.save();

      // Create transaction
      await Transaction.create({
        userId,
        type: 'payment',
        amount: amountInUserCurrency,
        currency: userCurrency,
        status: 'completed',
        description: `Покупка тарифа: ${tariff.name}`,
        paymentMethod: 'balance',
      });
    } else {
        // Handle card payment (mock for now)
        // In a real app, you would verify Stripe payment here
    }

    // Calculate end date
    // duration is in minutes, convert to milliseconds
    const durationMs = (tariff.duration || 60) * 60 * 1000; 
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationMs);

    // Create subscription
    const subscription = await Subscription.create({
      userId,
      tariffId,
      parkingId,
      startDate,
      endDate,
      status: 'active',
      paymentStatus: 'paid',
      paymentId: paymentMethod === 'balance' ? `bal_${Date.now()}` : `card_${Date.now()}`,
      autoRenew: false,
    });

    res.status(201).json({
      success: true,
      subscription,
      message: 'Подписка успешно оформлена',
    });

  } catch (error) {
    next(error);
  }
};
