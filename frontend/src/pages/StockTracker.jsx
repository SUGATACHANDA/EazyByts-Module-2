/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RealTimeStockChart from "../components/RealTimeStockChart";

const SOCKET_URL = import.meta.env.VITE_BACKEND_API_URL;

const StockTracker = () => {
    const [stockSymbol, setStockSymbol] = useState("");
    const [tracking, setTracking] = useState(false);
    const [alert, setAlert] = useState(null);
    const [latestPrice, setLatestPrice] = useState(null);
    const [currency, setCurrency] = useState(null);
    const [initialPrice, setInitialPrice] = useState(null);

    const inputRef = useRef(null);
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const showAlert = useCallback((message, color = "bg-red-500") => {
        setAlert({ message, color });
        setTimeout(() => setAlert(null), 4000);
    }, []);

    const stopTracking = useCallback(async () => {
        try {
            if (stockSymbol && latestPrice && currency) {
                await axios.post(`${SOCKET_URL}/api/stocks/upsert`, {
                    symbol: stockSymbol,
                    price: latestPrice,
                    currency,
                });
                showAlert(`✅ ${stockSymbol} saved successfully`, "bg-green-600");
            }
        } catch (err) {
            showAlert(err.response?.data?.error || "❌ Error saving stock data.");
        }

        if (socketRef.current) {
            socketRef.current.emit("stopTracking");
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setTracking(false);
        setStockSymbol("");
        setLatestPrice(null);
        setInitialPrice(null);
        setCurrency(null);
        inputRef.current?.focus();
    }, [stockSymbol, latestPrice, currency, showAlert]);

    useEffect(() => {
        if (tracking && stockSymbol) {
            if (socketRef.current) {
                // DON'T disconnect immediately - just reuse if available
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            socketRef.current = io(SOCKET_URL, {
                transports: ["websocket"], // Force websocket to avoid polling delays
                reconnectionAttempts: 3,   // Optional: limit reconnections
            });

            socketRef.current.emit("startTracking", stockSymbol);

            socketRef.current.on("stockData", (data) => {
                setLatestPrice(data.price);
                if (!initialPrice) setInitialPrice(data.price);
            });

            socketRef.current.on("error", (err) => {
                showAlert(err);
                stopTracking(); // Custom function to handle cleanup and UI
            });

            socketRef.current.on("disconnect", () => {
                console.warn("Socket disconnected by server or manually");
                showAlert("Disconnected from server");
                setTracking(false); // optional
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.emit("stopTracking");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [tracking, stockSymbol]);

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9.-]/g, "");
        setStockSymbol(value);
    };

    const startTracking = () => {
        if (!stockSymbol.trim()) {
            showAlert("Please enter a valid stock symbol.");
            return;
        }

        setTracking(true);
        setLatestPrice(null);
        setInitialPrice(null);
        setCurrency(null);
    };

    const getPercentageChange = () => {
        if (!initialPrice || !latestPrice) return "0.00%";
        const diff = latestPrice - initialPrice;
        const percent = (diff / initialPrice) * 100;
        return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center">
            {alert && (
                <div
                    className={`fixed top-5 left-1/2 transform -translate-x-1/2 ${alert.color} text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse`}
                >
                    {alert.message}
                </div>
            )}

            <h1 className="text-3xl font-bold mb-6 text-center text-blue-400 drop-shadow">
                📊 Real-Time Stock Tracker
            </h1>

            <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
                {!tracking && (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={stockSymbol}
                            onChange={handleInputChange}
                            placeholder="Enter Stock Symbol (e.g., TCS.NS, 2664.T)"
                            className="w-full p-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        />
                        <button
                            onClick={startTracking}
                            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 font-semibold"
                        >
                            🚀 Start Tracking
                        </button>
                    </>
                )}

                {tracking && (
                    <button
                        onClick={stopTracking}
                        className="w-full bg-red-500 hover:bg-red-600 transition rounded-lg py-3 font-semibold"
                    >
                        🛑 Stop Tracking & Save
                    </button>
                )}
                <button
                    onClick={() => navigate("/recent")}
                    className="w-full bg-gray-700 hover:bg-gray-600 transition rounded-lg py-2 text-sm"
                >
                    📁 View Recently Tracked Stocks
                </button>
            </div>

            {tracking && latestPrice !== null && (
                <div className="mt-6 text-center">
                    <h2 className="text-2xl font-bold text-white">{stockSymbol}</h2>
                    <p className="text-3xl font-bold text-green-400">
                        {currency} {latestPrice}
                    </p>
                    <p
                        className={`text-lg ${getPercentageChange().startsWith("+") ? "text-white" : ""
                            }`}
                    >
                        {/* {getPercentageChange()} */}
                    </p>
                </div>
            )}

            <div className="w-full max-w-5xl mt-8">
                {tracking && <RealTimeStockChart stockSymbol={stockSymbol} />}
            </div>

            <footer className="mt-10 text-gray-500 text-sm text-center">
                Built with ❤️ using React, Recharts, and Socket.io
            </footer>
        </div>
    );
};

export default StockTracker;
