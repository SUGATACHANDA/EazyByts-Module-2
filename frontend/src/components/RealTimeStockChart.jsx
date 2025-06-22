import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const SOCKET_URL = import.meta.env.VITE_BACKEND_API_URL;
const MAX_POINTS = 30;

export default function RealTimeStockChart({ stockSymbol }) {
    const [data, setData] = useState([]);
    const [latestPrice, setLatestPrice] = useState(null);
    const [currency, setCurrency] = useState("₹"); // Default to ₹
    const socketRef = useRef(null);
    const active = useRef(true);

    useEffect(() => {
        if (!stockSymbol) return;

        active.current = true;

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io(SOCKET_URL);
        socketRef.current.emit("startTracking", stockSymbol);

        socketRef.current.on("stockData", (stockData) => {
            if (!active.current || !stockData || !stockData.symbol || stockData.price == null) return;

            const price = stockData.price;
            const timeFormatted = new Date(stockData.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });

            setData((prev) => {
                const updated = [...prev, { time: timeFormatted, price }];
                return updated.length > MAX_POINTS ? updated.slice(-MAX_POINTS) : updated;
            });

            setLatestPrice(price);

            if (stockData.currency) {
                setCurrency(stockData.currency);
            }
        });

        socketRef.current.on("error", (errorMsg) => {
            console.error("Socket error:", errorMsg);
        });

        return () => {
            active.current = false;
            if (socketRef.current) {
                socketRef.current.emit("stopTracking", stockSymbol);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setData([]);
            setLatestPrice(null);
            setCurrency("₹"); // Reset to default on unmount
        };
    }, [stockSymbol]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white rounded p-2 text-sm shadow-lg">
                    <p className="text-blue-400 font-semibold">{label}</p>
                    <p className="font-semibold">
                        Price: {currency} {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[400px] bg-gray-900 rounded-xl shadow-lg p-4 text-white relative">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-400">{stockSymbol}</h2>
                {latestPrice !== null && (
                    <div className="text-xl font-bold text-white">
                        {currency} {latestPrice.toFixed(2)}
                    </div>
                )}
            </div>

            {data.length === 0 ? (
                <div className="text-gray-400 text-center animate-pulse pt-12">
                    Waiting for data...
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="time" tick={{ fill: "#ccc", fontSize: 12 }} />
                        <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: "#ccc", fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={true}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
