import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

const RecentStock = () => {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRecentStocks = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/stocks/recent`);
                setStocks(res.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || "Failed to fetch recent stocks.");
            }
        };

        fetchRecentStocks();
    }, []);

    const formatCurrency = (currencyCode) => {
        const symbols = {
            INR: "₹",
            USD: "$",
            EUR: "€",
            GBP: "£",
            JPY: "¥",
            AUD: "A$",
            CAD: "C$",
            SGD: "S$",
            HKD: "HK$"
            // Add more if needed
        };
        return symbols[currencyCode] || currencyCode || ""; // fallback: show code if unknown
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center flex-col items-center">
            <h1 className="lg:text-4xl text-2xl font-bold mb-6 text-blue-400">📁 Recent Tracked Stocks</h1>
            <Link
                to="/"
                className="mt-4 mb-5 text-blue-400 underline hover:text-blue-300"
            >
                ← Back to Tracker
            </Link>

            {error && (
                <div className="bg-red-600 px-4 py-2 rounded mb-4">{error}</div>
            )}

            {stocks.length === 0 && !error && (
                <div className="text-gray-400">No recent stocks found.</div>
            )}

            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stocks.map((stock) => (
                    <div
                        key={stock._id}
                        className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between items-start"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">{stock.symbol}</h2>
                            <p className="text-green-400 text-lg font-bold">
                                {formatCurrency(stock.currency)} {stock.lastPrice}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {new Date(stock.lastTrackedTime).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default RecentStock;
