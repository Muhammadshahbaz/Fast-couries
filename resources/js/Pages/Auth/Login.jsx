import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const useDemoAccount = (email) => {
        setData({
            email,
            password: 'password',
            remember: true,
        });
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-cyan-800 ring-1 ring-cyan-100">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Secure portal
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-normal text-gray-950">Welcome back.</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">Login to manage bookings, compare couriers, track COD, review return proof, and run daily operations.</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-gray-500 hover:text-gray-950"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <button disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60">
                        Log in
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase text-gray-500">Demo access</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => useDemoAccount('seller@example.com')}
                            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs font-semibold text-gray-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                        >
                            Seller account
                            <span className="mt-1 block font-normal text-gray-500">seller@example.com / password</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => useDemoAccount('admin@example.com')}
                            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs font-semibold text-gray-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                        >
                            Admin account
                            <span className="mt-1 block font-normal text-gray-500">admin@example.com / password</span>
                        </button>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
