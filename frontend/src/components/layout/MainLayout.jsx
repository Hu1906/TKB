import React from 'react';
import Header from './Header';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
            <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
                <p>&copy; <b>Nguyễn Kim Huy 20235106 IT1_07_K68</b> </p>
            </footer>
        </div>
    );
}
