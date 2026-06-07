import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock3, FileUp } from 'lucide-react';

const statusStyles = {
    verified: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    pending: 'border-amber-200 bg-amber-50 text-amber-900',
    rejected: 'border-rose-200 bg-rose-50 text-rose-900',
    missing: 'border-gray-200 bg-gray-50 text-gray-700',
};

const statusIcons = {
    verified: CheckCircle2,
    pending: Clock3,
    rejected: AlertTriangle,
    missing: FileUp,
};

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    sellerProfile,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            business_name: sellerProfile?.business_name ?? '',
            cnic_number: sellerProfile?.cnic_number ?? '',
            city: sellerProfile?.city ?? '',
            bank_name: sellerProfile?.bank_name ?? '',
            bank_account_title: sellerProfile?.bank_account_title ?? '',
            bank_account_number: sellerProfile?.bank_account_number ?? '',
            wallet_provider: sellerProfile?.wallet_provider ?? '',
            wallet_number: sellerProfile?.wallet_number ?? '',
            cnic_front: null,
            cnic_back: null,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), { forceFormData: true });
    };

    const verificationStatus = sellerProfile?.verification_status ?? 'missing';
    const StatusIcon = statusIcons[verificationStatus] ?? FileUp;

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your login, business, pickup, and payout details.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {user.role === 'seller' && (
                    <>
                        <div className={`rounded-lg border p-4 ${statusStyles[verificationStatus] ?? statusStyles.missing}`}>
                            <div className="flex items-start gap-3">
                                <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wide">KYC status: {verificationStatus}</p>
                                    <p className="mt-1 text-sm leading-6">
                                        {verificationStatus === 'verified' && 'Your seller account is verified for shipment booking and COD payout review.'}
                                        {verificationStatus === 'pending' && 'Your account is waiting for admin review. You can update documents or payout details if anything is missing.'}
                                        {verificationStatus === 'rejected' && 'Your KYC needs correction before shipment booking can be enabled.'}
                                        {verificationStatus === 'missing' && 'Add business, CNIC, pickup, and payout details to start seller verification.'}
                                    </p>
                                    {sellerProfile?.rejection_reason && (
                                        <p className="mt-2 rounded-md bg-white/70 px-3 py-2 text-sm font-semibold">Reason: {sellerProfile.rejection_reason}</p>
                                    )}
                                    {sellerProfile?.review_notes && (
                                        <p className="mt-2 text-xs leading-5 opacity-80">Admin note: {sellerProfile.review_notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-base font-semibold text-gray-900">Business setup</h3>
                            <p className="mt-1 text-sm text-gray-600">These details help complete seller onboarding and account verification.</p>
                        </div>

                        <div>
                            <InputLabel htmlFor="business_name" value="Business name" />
                            <TextInput
                                id="business_name"
                                className="mt-1 block w-full"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.business_name} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="cnic_number" value="CNIC number" />
                                <TextInput
                                    id="cnic_number"
                                    className="mt-1 block w-full"
                                    value={data.cnic_number}
                                    onChange={(e) => setData('cnic_number', e.target.value)}
                                    placeholder="35202-1234567-1"
                                />
                                <InputError className="mt-2" message={errors.cnic_number} />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="Pickup city" />
                                <TextInput
                                    id="city"
                                    className="mt-1 block w-full"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Lahore"
                                />
                                <InputError className="mt-2" message={errors.city} />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-base font-semibold text-gray-900">CNIC documents</h3>
                            <p className="mt-1 text-sm text-gray-600">Upload clear JPG, PNG, or PDF files. Updating documents will send your KYC back to pending review.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="cnic_front" value="CNIC front" />
                                <input
                                    id="cnic_front"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="mt-1 block w-full rounded-md border border-gray-300 text-sm file:mr-3 file:border-0 file:bg-gray-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                                    onChange={(e) => setData('cnic_front', e.target.files[0])}
                                />
                                <p className="mt-1 text-xs text-gray-500">{sellerProfile?.cnic_front_path ? 'Current front document is uploaded.' : 'No front document uploaded yet.'}</p>
                                <InputError className="mt-2" message={errors.cnic_front} />
                            </div>

                            <div>
                                <InputLabel htmlFor="cnic_back" value="CNIC back" />
                                <input
                                    id="cnic_back"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="mt-1 block w-full rounded-md border border-gray-300 text-sm file:mr-3 file:border-0 file:bg-gray-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                                    onChange={(e) => setData('cnic_back', e.target.files[0])}
                                />
                                <p className="mt-1 text-xs text-gray-500">{sellerProfile?.cnic_back_path ? 'Current back document is uploaded.' : 'No back document uploaded yet.'}</p>
                                <InputError className="mt-2" message={errors.cnic_back} />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-base font-semibold text-gray-900">Payout details</h3>
                            <p className="mt-1 text-sm text-gray-600">Add either bank details or a mobile wallet for COD payout processing.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="bank_name" value="Bank name" />
                                <TextInput
                                    id="bank_name"
                                    className="mt-1 block w-full"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    placeholder="Meezan Bank"
                                />
                                <InputError className="mt-2" message={errors.bank_name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="bank_account_title" value="Account title" />
                                <TextInput
                                    id="bank_account_title"
                                    className="mt-1 block w-full"
                                    value={data.bank_account_title}
                                    onChange={(e) => setData('bank_account_title', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.bank_account_title} />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="bank_account_number" value="IBAN/account number" />
                            <TextInput
                                id="bank_account_number"
                                className="mt-1 block w-full"
                                value={data.bank_account_number}
                                onChange={(e) => setData('bank_account_number', e.target.value)}
                                placeholder="PK36MEZN0000001122334455"
                            />
                            <InputError className="mt-2" message={errors.bank_account_number} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="wallet_provider" value="Mobile wallet" />
                                <select
                                    id="wallet_provider"
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-600 focus:ring-cyan-600"
                                    value={data.wallet_provider}
                                    onChange={(e) => setData('wallet_provider', e.target.value)}
                                >
                                    <option value="">Select wallet</option>
                                    <option>JazzCash</option>
                                    <option>Easypaisa</option>
                                </select>
                                <InputError className="mt-2" message={errors.wallet_provider} />
                            </div>

                            <div>
                                <InputLabel htmlFor="wallet_number" value="Wallet number" />
                                <TextInput
                                    id="wallet_number"
                                    className="mt-1 block w-full"
                                    value={data.wallet_number}
                                    onChange={(e) => setData('wallet_number', e.target.value)}
                                    placeholder="03001234567"
                                />
                                <InputError className="mt-2" message={errors.wallet_number} />
                            </div>
                        </div>
                    </>
                )}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
