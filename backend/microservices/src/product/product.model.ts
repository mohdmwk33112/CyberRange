/* eslint-disable prettier/prettier */

import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
});

export interface Product extends mongoose.Document {
  id: string;
  name: string;
  description: string
}