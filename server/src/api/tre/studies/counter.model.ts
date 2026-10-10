import { Schema, SchemaTypes, model } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

const Counter = model('Counter', counterSchema);
export default Counter;