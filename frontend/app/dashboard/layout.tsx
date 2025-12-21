'use client';

// Placeholder for Sidebar and Header modules
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar placeholder */}
            <aside className="w-64 bg-gray-900 text-white hidden md:block">
                <div className="p-4 font-bold text-xl">CyberRange</div>
                <nav className="mt-8 space-y-2 px-2">
                    {/* Nav items will go here */}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                {/* Header placeholder */}
                <header className="bg-white shadow h-16 flex items-center px-4 justify-between">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    {/* User profile menu */}
                </header>

                <main className="flex-1 p-6 bg-gray-100 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
