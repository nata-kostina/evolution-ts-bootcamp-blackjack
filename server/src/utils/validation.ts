import Joi from 'joi';
import { Action, YesNoAcknowledgement } from '../types';

export const roomSchema = Joi.string();
export const playerSchema = Joi.string();
export const betSchema = Joi.number().greater(Joi.ref('$min')).max(Joi.ref('$max'));
export const actionSchema = Joi.string().valid(...Object.values(Action)).required()
export const yesNoResponseSchema = Joi.string().valid(...Object.values(YesNoAcknowledgement)).required()
