export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b p-4">
                {/* Navigation Component will go here */}
                <nav className="container mx-auto flex justify-between">
                    <div className="font-bold text-xl">CyberRange</div>
                    <div className="space-x-4">
                        <a href="/login" className="text-sm font-medium hover:underline">Login</a>
                        <a href="/signup" className="text-sm font-medium hover:underline">Signup</a>
                    </div>
                </nav>
            </header>
            <main className="flex-1 container mx-auto p-4">
                {children}
            </main>
            <footer className="border-t p-4 text-center text-sm text-gray-500">
                © 2025 CyberRange. All rights reserved.
            </footer>
        </div>
    );
}
