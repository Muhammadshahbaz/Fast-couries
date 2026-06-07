export default function ApplicationLogo({ className = '', iconClassName = '', showText = true, dark = false, ...props }) {
    return (
        <span {...props} className={`inline-flex items-center gap-3 ${className}`}>
            <span className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-gray-950 text-white shadow-sm ${iconClassName}`}>
                <span className="text-[15px] font-black leading-none tracking-normal">FC</span>
                <span className="absolute bottom-2 left-2 h-0.5 w-7 rounded-full bg-cyan-300" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>

            {showText && (
                <span className="leading-none">
                    <span className={`block text-lg font-black tracking-normal ${dark ? 'text-white' : 'text-gray-950'}`}>Fast Couriers</span>
                    <span className={`mt-1 block text-[11px] font-bold uppercase tracking-[0.14em] ${dark ? 'text-cyan-200' : 'text-cyan-700'}`}>Courier command center</span>
                </span>
            )}
        </span>
    );
}
