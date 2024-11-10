import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 完整的用户接口
interface User {
    id: number;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    follwers: number;
    isActive: boolean;
    registeredAt: Date;
}
export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<Partial<User>>({});
    const [isEditing, setIsEditing] = useState(false);
    // 获取所有用户
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/user');
            setUsers(response.data);
        } catch (error) {
            console.error('获取用户列表失败', error);
        }
    };
    // 创建用户
    const createUser = async () => {
        try {
            // 验证邮箱
            if (!currentUser.email) {
                alert('请输入邮箱');
                return;
            }
            // 邮箱格式验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(currentUser.email)) {
                alert('请输入正确的邮箱格式');
                return;
            }
            // 清理数据
            const userData = {
                email: currentUser.email,
                name: currentUser.name || undefined,
                avatar_url: currentUser.avatar_url || undefined,
            };
            // 发送请求
            const response = await axios.post('/api/user', userData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // 处理响应
            console.log('创建用户成功:', response.data);
            fetchUsers();
            setCurrentUser({}); // 重置表单
        } catch (error: any) {
            // 详细的错误处理
            if (error.response) {
                // 服务器返回错误
                alert(`创建用户失败: ${error.response.data.message}`);
                console.error('创建用户失败', error.response.data);
            } else if (error.request) {
                // 请求发送失败
                alert('网络错误，请检查网络连接');
                console.error('网络错误', error.request);
            } else {
                // 其他错误
                alert('创建用户出现未知错误');
                console.error('创建用户失败', error.message);
            }
        }
    };
    // 更新用户
    const updateUser = async () => {
        try {
            await axios.put(`/api/user?id=${currentUser.id}`, {
                email: currentUser.email,
                name: currentUser.name,
                avatar_url: currentUser.avatar_url,
                follwers: currentUser.follwers,
                isActive: currentUser.isActive,
            });
            fetchUsers();
            setCurrentUser({});
            setIsEditing(false);
        } catch (error) {
            console.error('更新用户失败', error);
        }
    };
    // 删除用户
    const deleteUser = async (id: number) => {
        try {
            await axios.delete(`/api/user?id=${id}`);
            fetchUsers();
        } catch (error) {
            console.error('删除用户失败', error);
        }
    };
    // 编辑用户
    const editUser = (user: User) => {
        setCurrentUser(user);
        setIsEditing(true);
    };
    // 初始加载
    useEffect(() => {
        fetchUsers();
    }, []);
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl mb-4">用户管理</h1>

            {/* 用户表单 */}
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2">邮箱</label>
                    <input
                        type="email"
                        placeholder="邮箱"
                        value={currentUser.email || ''}
                        onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                        className="w-full border p-2 mb-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2">名称</label>
                    <input
                        type="text"
                        placeholder="名称"
                        value={currentUser.name || ''}
                        onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
                        className="w-full border p-2 mb-2"
                    />
                </div>
                <div>
                    <label className="block mb-2">头像URL</label>
                    <input
                        type="text"
                        placeholder="头像URL"
                        value={currentUser.avatar_url || ''}
                        onChange={e => setCurrentUser({ ...currentUser, avatar_url: e.target.value })}
                        className="w-full border p-2 mb-2"
                    />
                </div>
                <div>
                    <label className="block mb-2">关注者数量</label>
                    <input
                        type="number"
                        placeholder="关注者数量"
                        value={currentUser.follwers || 0}
                        onChange={e => setCurrentUser({ ...currentUser, follwers: parseInt(e.target.value) })}
                        className="w-full border p-2 mb-2"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block mb-2">
                        <input
                            type="checkbox"
                            checked={currentUser.isActive ?? true}
                            onChange={e => setCurrentUser({ ...currentUser, isActive: e.target.checked })}
                            className="mr-2"
                        />
                        是否活跃
                    </label>
                </div>

                <div className="col-span-2">
                    {isEditing ? (
                        <button onClick={updateUser} className="w-full bg-blue-500 text-white p-2 rounded">
                            更新用户
                        </button>
                    ) : (
                        <button onClick={createUser} className="w-full bg-green-500 text-white p-2 rounded">
                            创建用户
                        </button>
                    )}
                </div>
            </div>
            {/* 用户列表 */}
            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="border p-2">ID</th>
                        <th className="border p-2">邮箱</th>
                        <th className="border p-2">名称</th>
                        <th className="border p-2">头像</th>
                        <th className="border p-2">关注者</th>
                        <th className="border p-2">状态</th>
                        <th className="border p-2">注册时间</th>
                        <th className="border p-2">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="border p-2">{user.id}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.name}</td>
                            <td className="border p-2">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="头像" className="w-10 h-10 rounded-full" />
                                ) : (
                                    '无'
                                )}
                            </td>
                            <td className="border p-2">{user.follwers}</td>
                            <td className="border p-2">{user.isActive ? '活跃' : '未活跃'}</td>
                            <td className="border p-2">{new Date(user.registeredAt).toLocaleString()}</td>
                            <td className="border p-2">
                                <button
                                    onClick={() => editUser(user)}
                                    className="bg-yellow-500 text-white p-1 mr-2 rounded"
                                >
                                    编辑
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="bg-red-500 text-white p-1 rounded"
                                >
                                    删除
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
