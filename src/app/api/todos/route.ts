import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Todo from '@/models/Todo'

export async function GET() {
  try {
    await connectToDatabase();
    
    const todos = await Todo.find({}).sort({createdAt: -1}); 

    return NextResponse.json(todos);
  } catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json({ error: 'Oops! Something went wrong while saving.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title } = body;

    if(!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({error: "Title is required"}, {status: 400})
    }
    const newTodo = await Todo.create({
      title: title.trim(),
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
