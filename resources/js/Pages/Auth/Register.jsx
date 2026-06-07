import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        business_name: '',
        phone: '',
        email: '',
        cnic_number: '',
        cnic_front: null,
        cnic_back: null,
        city: '',
        bank_name: '',
        bank_account_title: '',
        bank_account_number: '',
        wallet_provider: '',
        wallet_number: '',
        terms_accepted: false,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase text-cyan-800 ring-1 ring-cyan-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Seller onboarding
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-normal text-gray-950">Create your shipping account.</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">Add business, KYC, payout, and login details so your account can be reviewed for COD and courier access.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Full name" />

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />

                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="business_name" value="Business name" />

                        <TextInput
                            id="business_name"
                            name="business_name"
                            value={data.business_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('business_name', e.target.value)}
                            required
                        />

                        <InputError message={errors.business_name} className="mt-2" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="phone" value="Phone number" />

                        <TextInput
                            id="phone"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full"
                            autoComplete="tel"
                            placeholder="03001234567"
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />

                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="cnic_number" value="CNIC number" />

                        <TextInput
                            id="cnic_number"
                            name="cnic_number"
                            value={data.cnic_number}
                            className="mt-1 block w-full"
                            placeholder="42101-1234567-1"
                            onChange={(e) => setData('cnic_number', e.target.value)}
                            required
                        />

                        <InputError message={errors.cnic_number} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="city" value="City" />

                        <TextInput
                            id="city"
                            name="city"
                            value={data.city}
                            className="mt-1 block w-full"
                            placeholder="Lahore"
                            onChange={(e) => setData('city', e.target.value)}
                            required
                        />

                        <InputError message={errors.city} className="mt-2" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="cnic_front" value="CNIC front photo" />

                        <input
                            id="cnic_front"
                            name="cnic_front"
                            type="file"
                            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                            onChange={(e) => setData('cnic_front', e.target.files[0])}
                        />

                        <InputError message={errors.cnic_front} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="cnic_back" value="CNIC back photo" />

                        <input
                            id="cnic_back"
                            name="cnic_back"
                            type="file"
                            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                            onChange={(e) => setData('cnic_back', e.target.files[0])}
                        />

                        <InputError message={errors.cnic_back} className="mt-2" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="bank_name" value="Bank" />

                        <TextInput
                            id="bank_name"
                            name="bank_name"
                            value={data.bank_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('bank_name', e.target.value)}
                        />

                        <InputError message={errors.bank_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="bank_account_title" value="Account title" />

                        <TextInput
                            id="bank_account_title"
                            name="bank_account_title"
                            value={data.bank_account_title}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('bank_account_title', e.target.value)}
                        />

                        <InputError message={errors.bank_account_title} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="bank_account_number" value="IBAN/account number" />

                        <TextInput
                            id="bank_account_number"
                            name="bank_account_number"
                            value={data.bank_account_number}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('bank_account_number', e.target.value)}
                        />

                        <InputError message={errors.bank_account_number} className="mt-2" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="wallet_provider" value="Mobile wallet" />

                        <select
                            id="wallet_provider"
                            name="wallet_provider"
                            value={data.wallet_provider}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            onChange={(e) => setData('wallet_provider', e.target.value)}
                        >
                            <option value="">None</option>
                            <option value="JazzCash">JazzCash</option>
                            <option value="Easypaisa">Easypaisa</option>
                        </select>

                        <InputError message={errors.wallet_provider} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="wallet_number" value="Wallet number" />

                        <TextInput
                            id="wallet_number"
                            name="wallet_number"
                            value={data.wallet_number}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('wallet_number', e.target.value)}
                        />

                        <InputError message={errors.wallet_number} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={data.terms_accepted}
                        className="mt-1 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        onChange={(e) => setData('terms_accepted', e.target.checked)}
                        required
                    />
                    <span>I accept the seller agreement, COD settlement policy, and KYC verification terms.</span>
                </label>
                <InputError message={errors.terms_accepted} className="mt-2" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-950"
                    >
                        Already registered?
                    </Link>

                    <button disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60">
                        Register
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
