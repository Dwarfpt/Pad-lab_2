import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
};

export const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const parkingValidation = [
  body('name').notEmpty().withMessage('Parking name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('coordinates.lat').isFloat().withMessage('Valid latitude required'),
  body('coordinates.lng').isFloat().withMessage('Valid longitude required'),
  body('totalSlots').isInt({ min: 1 }).withMessage('Total slots must be positive'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price must be positive'),
];

export const tariffValidation = [
  body('name').notEmpty().withMessage('Tariff name is required'),
  body('type')
    .isIn(['hourly', 'daily', 'weekly', 'monthly'])
    .withMessage('Invalid tariff type'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be positive'),
];
