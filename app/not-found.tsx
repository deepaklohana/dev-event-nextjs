import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-10rem)] w-full items-center justify-center p-4 ">
            <div style={{ flexDirection: 'column' }} className="glass card-shadow flex flex-col items-center gap-6 rounded-2xl p-10 text-center sm:p-14 md:min-w-[500px]">
                <div className="flex flex-col items-center gap-2" style={{ flexDirection: 'column' }}>
                    <h1 className="text-gradient text-[120px] font-bold leading-none tracking-tighter sm:text-[150px]">
                        404
                    </h1>
                    <h2 className="font-schibsted-grotesk text-3xl font-bold tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-light-200 text-lg">
                        Sorry, the page you are looking for doesn't exist or has been moved.
                    </p>
                    <Link
                        href="/"
                        className="bg-primary hover:bg-primary/90 text-dark-100 mt-4 rounded-full px-8 py-3 text-lg font-semibold transition-all hover:scale-105 active:scale-95"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
