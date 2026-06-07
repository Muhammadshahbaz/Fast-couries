import SellerLayout from '@/Layouts/SellerLayout';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';

const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'packer', label: 'Packer' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'finance', label: 'Finance' },
];

export default function Index({ members }) {
    const form = useForm({
        name: '',
        email: '',
        role: 'packer',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('team.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('name', 'email'),
        });
    };

    return (
        <SellerLayout header={<div><h2 className="text-xl font-semibold text-gray-950">Team</h2><p className="text-sm text-gray-500">Invite staff and prepare role-based access for warehouse, dispatch, and finance users.</p></div>}>
            <Head title="Team" />

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-700">Role-based access</p>
                            <h1 className="mt-2 text-3xl font-bold text-gray-950">Team users</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                                Prepare your seller account for warehouse staff, dispatch teams, finance users, and business admins.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-gray-950">
                            <Users className="h-5 w-5" />
                            <div>
                                <p className="text-xs font-semibold uppercase text-cyan-800">Active seats</p>
                                <p className="text-xl font-bold">{members.filter((member) => member.is_active).length}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                            <h2 className="font-bold text-gray-950">Invite team member</h2>
                        </div>
                        <div className="space-y-3">
                            <input
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="Full name"
                                required
                            />
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                placeholder="Email address"
                                required
                            />
                            <select
                                value={form.data.role}
                                onChange={(event) => form.setData('role', event.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm"
                                required
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add user
                            </button>
                        </div>
                    </form>

                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="font-bold text-gray-950">Users and roles</h2>
                            <p className="text-sm text-gray-500">Each role can later receive its own permission rules.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {members.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-gray-500">No team users added yet.</p>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                        <div>
                                            <p className="font-semibold text-gray-950">{member.name}</p>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:justify-end">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold capitalize text-blue-700">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                {member.role}
                                            </span>
                                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${member.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {member.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </SellerLayout>
    );
}
