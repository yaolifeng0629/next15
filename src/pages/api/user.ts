import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma/client';
import { type UserType } from '@/types/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserType[] | { message: string }>) {
    if (req.method === 'GET') {
        try {
            const allUsers = await prisma.user.findMany();
            res.status(200).json(allUsers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
