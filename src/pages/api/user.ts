import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TypeScript interface matching your Prisma schema
interface User {
    id: number;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    follwers: number;
    isActive: boolean;
    registeredAt: Date;
}

// Type for creating a new user (omitting auto-generated fields)
type CreateUserInput = Omit<User, 'id' | 'follwers' | 'isActive' | 'registeredAt'>;

// Type for updating a user (all fields optional except id)
type UpdateUserInput = Partial<Omit<User, 'id'>> & { id: number };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'POST':
                return await createUser(req, res);
            case 'GET':
                return await getUsers(req, res);
            case 'PUT':
                return await updateUser(req, res);
            case 'DELETE':
                return await deleteUser(req, res);
            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Request error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { email, name, avatar_url }: CreateUserInput = req.body;
        // 严格的邮箱验证
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        const user = await prisma.user.create({
            data: {
                email,
                name: name || undefined, // 处理可能的 null
                avatar_url: avatar_url || undefined, // 处理可能的 null
            },
        });
        return res.status(201).json(user);
    } catch (error: any) {
        console.error('Create user error:', error); // 添加详细错误日志
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // 更详细的错误处理
        return res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
}

// Get all users or a single user by ID
async function getUsers(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (id) {
        const userId = parseInt(id as string);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    }

    // Get all users
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
}

// Update a user
async function updateUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        const userId = parseInt(id as string);

        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const updateData: UpdateUserInput = req.body;
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                email: updateData.email,
                name: updateData.name,
                avatar_url: updateData.avatar_url,
                isActive: updateData.isActive,
                follwers: updateData.follwers,
            },
        });

        return res.status(200).json(user);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        throw error;
    }
}

// Delete a user
async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        const userId = parseInt(id as string);

        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        throw error;
    }
}
