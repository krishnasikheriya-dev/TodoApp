import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema({
  // Define schema fields with their types and validation
  title: {
    type: String,
    required: [true, 'Pleasa provide a title for the To-Do item.'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters.']
  },
  completed: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });


const Todo = mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema)
export default Todo;