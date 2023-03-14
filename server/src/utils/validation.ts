import Joi from 'joi';

export const roomSchema = Joi.string();
export const playerSchema = Joi.string();
export const betSchema = Joi.number().greater(Joi.ref('$min')).max(Joi.ref('$max'));
