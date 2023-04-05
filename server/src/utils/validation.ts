import Joi from 'joi';
import { Action } from '../types/gameTypes';

export const roomSchema = Joi.string();
export const playerSchema = Joi.string();
export const betSchema = Joi.number().greater(Joi.ref('$min')).max(Joi.ref('$max'));
export const actionSchema = Joi.string().valid(...Object.values(Action)).required()
