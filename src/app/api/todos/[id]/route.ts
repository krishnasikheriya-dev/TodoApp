import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Todo from '@/models/Todo';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const body = await request.json();

    // Whitelist allowed fields to prevent arbitrary updates
    const updates: Record<string, any> = {};
    if(body.title !== undefined) updates.title = body.title.trim();
    if(body.completed !== undefined) updates.completed = body.completed;
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true} // returns the updated object and applies schema validation rules
    );

    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
