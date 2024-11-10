'use client';

import { type UserType } from '@/types/users';
import { useState } from 'react';

export default function Home() {
    const [userList, setUserList] = useState<UserType[]>([]);

    const getAllUsers = async () => {
        const res = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (res.ok) {
            const data: UserType[] = await res.json();
            setUserList(data);
            console.log(data);
        } else {
            console.error('Failed to fetch users');
        }
    };

    return (
        <>
            <button
                onClick={getAllUsers}
                className="inline-block rounded border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
            >
                获取所有用户
            </button>
            <ul>
                {userList.map((user, index) => (
                    <li key={index}>{JSON.stringify(user)}</li>
                ))}
            </ul>
        </>
    );
}
